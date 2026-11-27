import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Award,
  Copy,
  Check,
} from 'lucide-react';
import { AutoGrowPromptInput } from '../ui/ResponsiveTextControls';

interface DialogueTurn {
  speaker: 'Aarav' | 'Diya';
  text: string;
  slideIndex: number;
}

interface StudySlide {
  title: string;
  subtitle: string;
  bullets: string[];
  formulaOrKey?: string;
  examTip?: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface BoardQuestion {
  marks: number;
  question: string;
  answerScheme: string;
}

interface StudyStudioPackage {
  topic: string;
  subject: string;
  estimatedDurationMinutes: number;
  summary: string;
  keyTakeaways: string[];
  dialogue: DialogueTurn[];
  slides: StudySlide[];
  flashcards: Flashcard[];
  boardQuestions: BoardQuestion[];
}

const SAMPLE_TOPICS = [
  { subject: 'Science', topic: 'Chemical Reactions: Balancing, Types & Redox (5-Mark CBSE Scheme)' },
  { subject: 'Mathematics', topic: 'Real Numbers & Proof of Irrationality (Fundamental Theorem)' },
  { subject: 'Science', topic: 'Electricity: Ohm’s Law, Resistance in Series & Parallel' },
  { subject: 'Social Science', topic: 'Nationalism in Europe: Treaty of Vienna & Unification' },
  { subject: 'Science', topic: 'Life Processes: Nutrition, Double Circulation & Nephron Filtration' },
  { subject: 'Mathematics', topic: 'Triangles: Thales Theorem (BPT) Statement & Proof' },
];

export const ScholarCastBriefing: React.FC<{ initialTopic?: string }> = ({ initialTopic }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || SAMPLE_TOPICS[0].topic);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [isGeneratingOverview, setIsGeneratingOverview] = useState<boolean>(false);
  const [studioPackage, setStudioPackage] = useState<StudyStudioPackage | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const handleGenerateOverview = async (topicToFetch: string) => {
    const cleanTopic = (topicToFetch || selectedTopic).trim();
    if (!cleanTopic) return;

    setIsGeneratingOverview(true);
    setIsPlayingAudio(false);
    if (synthRef.current) synthRef.current.cancel();

    try {
      const res = await fetch('/api/zenith-study-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customTopic: cleanTopic,
          subjectId: 'CBSE Class 10',
        }),
      });
      const data = await res.json();
      const pkg = data.package || data.data;
      if (data && pkg) {
        setStudioPackage(pkg);
        setCurrentTurnIndex(0);
        setCurrentSlideIndex(0);
        return;
      }
    } catch {
      // Fall through to structured package
    } finally {
      setIsGeneratingOverview(false);
    }

    setStudioPackage({
      topic: cleanTopic,
      subject: 'CBSE Class 10',
      estimatedDurationMinutes: 4,
      summary: `Structured study breakdown of ${cleanTopic} aligned with NCERT and board evaluation rules.`,
      keyTakeaways: [
        'Exact NCERT definitions and boundary conditions.',
        'Step-by-step proofs and balanced equations.',
        'Diagram labeling & SI units checklist.',
      ],
      dialogue: [
        {
          speaker: 'Aarav',
          text: `Welcome back! Today we are breaking down ${cleanTopic} so you can lock in full marks cleanly.`,
          slideIndex: 0,
        },
        {
          speaker: 'Diya',
          text: `A common reason students drop a mark is skipping SI units or missing the exact NCERT postulate on slide 1.`,
          slideIndex: 0,
        },
        {
          speaker: 'Aarav',
          text: `On slide 2, notice how each algebraic or conceptual step leads straight into the labeled diagram.`,
          slideIndex: 1,
        },
        {
          speaker: 'Diya',
          text: `Review the flashcards and 5-mark evaluation breakdown below right after listening!`,
          slideIndex: 2,
        },
      ],
      slides: [
        {
          title: cleanTopic,
          subtitle: 'Core Concept & NCERT Foundation',
          bullets: [
            'Official CBSE Class 10 Syllabus alignment',
            'Fundamental definition with precise keywords',
            'Initial boundary conditions and assumptions',
          ],
          formulaOrKey: 'Core NCERT Principle',
          examTip: 'Underline key scientific terms to secure full step marks.',
        },
        {
          title: 'Step-by-Step Derivation & Diagram',
          subtitle: 'Standard 3-Mark & 5-Mark Representation',
          bullets: [
            'Neat pencil diagram with clear directional labels',
            'Logical step progression without skipping intermediate steps',
            'Standard SI units attached to all final quantities',
          ],
          formulaOrKey: 'Step-Marking Blueprint',
          examTip: '1 full mark is reserved for a neatly labeled diagram.',
        },
        {
          title: 'High-Yield Revision Summary',
          subtitle: 'Final Takeaways for 100/100',
          bullets: [
            'Review NCERT in-text examples & Exemplar questions',
            'Verify Assertion-Reason cause linkages carefully',
          ],
          formulaOrKey: 'Board Target: 100%',
          examTip: 'Re-check units and signs during final 15 minutes.',
        },
      ],
      flashcards: [
        {
          front: `What is the core principle behind ${cleanTopic}?`,
          back: 'Stated under standard conditions using exact NCERT terminology and units.',
        },
        {
          front: 'How much weightage is allotted to a neat labeled diagram in 5-mark answers?',
          back: 'Typically 1 to 1.5 marks are reserved specifically for accurate labeling.',
        },
      ],
      boardQuestions: [
        {
          marks: 5,
          question: `Explain ${cleanTopic} with a labeled diagram and step-by-step derivation.`,
          answerScheme:
            '1 mark statement, 1 mark diagram, 2 marks step-by-step reasoning, 1 mark final conclusion & SI units.',
        },
      ],
    });
    setCurrentTurnIndex(0);
    setCurrentSlideIndex(0);
  };

  useEffect(() => {
    if (!studioPackage && !isGeneratingOverview) {
      handleGenerateOverview(selectedTopic);
    }
  }, []);

  const speakCurrentTurn = (turn: DialogueTurn) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(turn.text);
    utterance.rate = 1.05;
    utterance.pitch = turn.speaker === 'Diya' ? 1.15 : 0.95;

    utterance.onend = () => {
      if (studioPackage && isPlayingAudio) {
        if (currentTurnIndex < studioPackage.dialogue.length - 1) {
          const nextIndex = currentTurnIndex + 1;
          setCurrentTurnIndex(nextIndex);
          const nextTurn = studioPackage.dialogue[nextIndex];
          if (nextTurn.slideIndex !== undefined) {
            setCurrentSlideIndex(nextTurn.slideIndex);
          }
          speakCurrentTurn(nextTurn);
        } else {
          setIsPlayingAudio(false);
        }
      }
    };

    synthRef.current.speak(utterance);
  };

  const handleTogglePlayAudio = () => {
    if (!studioPackage || studioPackage.dialogue.length === 0) return;
    if (isPlayingAudio) {
      synthRef.current?.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakCurrentTurn(studioPackage.dialogue[currentTurnIndex]);
    }
  };

  const handleNextTurn = () => {
    if (!studioPackage || currentTurnIndex >= studioPackage.dialogue.length - 1) return;
    const nextIdx = currentTurnIndex + 1;
    setCurrentTurnIndex(nextIdx);
    const nextTurn = studioPackage.dialogue[nextIdx];
    if (nextTurn.slideIndex !== undefined) setCurrentSlideIndex(nextTurn.slideIndex);
    if (isPlayingAudio) speakCurrentTurn(nextTurn);
  };

  const handlePrevTurn = () => {
    if (!studioPackage || currentTurnIndex <= 0) return;
    const prevIdx = currentTurnIndex - 1;
    setCurrentTurnIndex(prevIdx);
    const prevTurn = studioPackage.dialogue[prevIdx];
    if (prevTurn.slideIndex !== undefined) setCurrentSlideIndex(prevTurn.slideIndex);
    if (isPlayingAudio) speakCurrentTurn(prevTurn);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(label);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  const activeSlide = studioPackage?.slides[currentSlideIndex] || null;

  return (
    <div className="p-3.5 sm:p-5 space-y-4">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {SAMPLE_TOPICS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isGeneratingOverview}
              onClick={() => {
                setSelectedTopic(item.topic);
                handleGenerateOverview(item.topic);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left break-words transition-all cursor-pointer border ${
                selectedTopic === item.topic
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="text-[10px] text-indigo-400 font-mono">[{item.subject}]</span>{' '}
              {item.topic.split(':')[0]}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
          <AutoGrowPromptInput
            placeholder="Type any custom chapter (e.g. Carbon & Its Compounds, Arithmetic Progressions)..."
            value={customTopicInput}
            onValueChange={setCustomTopicInput}
            onSubmitPrompt={() => {
              if (customTopicInput.trim()) {
                setSelectedTopic(customTopicInput);
                handleGenerateOverview(customTopicInput);
              }
            }}
            className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-primary)] focus:border-indigo-400 focus:outline-none"
          />
          <button
            type="button"
            disabled={isGeneratingOverview || !customTopicInput.trim()}
            onClick={() => {
              setSelectedTopic(customTopicInput);
              handleGenerateOverview(customTopicInput);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingOverview ? 'Synthesizing...' : 'Build Briefing'}</span>
          </button>
        </div>
      </div>

      {studioPackage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl bg-slate-950 border border-[var(--border-color)] p-5 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-extrabold">
                Whiteboard Slide {currentSlideIndex + 1} / {studioPackage.slides.length}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <button
                  type="button"
                  disabled={currentSlideIndex <= 0}
                  onClick={() => setCurrentSlideIndex((p) => Math.max(0, p - 1))}
                  className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentSlideIndex >= studioPackage.slides.length - 1}
                  onClick={() =>
                    setCurrentSlideIndex((p) => Math.min(studioPackage.slides.length - 1, p + 1))
                  }
                  className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {activeSlide && (
              <div className="py-4 space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">{activeSlide.title}</h3>
                  <p className="text-xs text-indigo-300 font-semibold mt-0.5">{activeSlide.subtitle}</p>
                </div>

                <div className="space-y-2 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  {activeSlide.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                {activeSlide.formulaOrKey && (
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-mono font-bold flex items-center justify-between">
                    <span>Key: {activeSlide.formulaOrKey}</span>
                    <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="break-words [overflow-wrap:anywhere] flex-1 min-w-0">{studioPackage.topic}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(JSON.stringify(activeSlide, null, 2), 'slide')}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-bold shrink-0"
              >
                {copiedStatus === 'slide' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStatus === 'slide' ? 'Copied' : 'Copy Notes'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider">Dual-Host Narration</h4>
                <span className="text-[11px] font-mono text-indigo-400 font-bold">Aarav &amp; Diya</span>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2 border-b border-[var(--border-color)]/60">
                <button
                  type="button"
                  onClick={handleTogglePlayAudio}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlayingAudio ? 'Pause' : 'Play Briefing'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentTurnIndex <= 0}
                    onClick={handlePrevTurn}
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold px-2">
                    {currentTurnIndex + 1}/{studioPackage.dialogue.length}
                  </span>
                  <button
                    type="button"
                    disabled={currentTurnIndex >= studioPackage.dialogue.length - 1}
                    onClick={handleNextTurn}
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pt-2.5 pr-1">
                {studioPackage.dialogue.map((turn, idx) => {
                  const isCurrent = idx === currentTurnIndex;
                  const isAarav = turn.speaker === 'Aarav';
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentTurnIndex(idx);
                        if (turn.slideIndex !== undefined) setCurrentSlideIndex(turn.slideIndex);
                        if (isPlayingAudio) speakCurrentTurn(turn);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer ${
                        isCurrent
                          ? isAarav
                            ? 'bg-cyan-500/15 border-cyan-400'
                            : 'bg-pink-500/15 border-pink-400'
                          : 'bg-[var(--bg-card)] border-[var(--border-color)] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className={`font-bold block mb-0.5 ${isAarav ? 'text-cyan-400' : 'text-pink-400'}`}>
                        {turn.speaker}
                      </span>
                      <p className="leading-relaxed text-[11px]">{turn.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {studioPackage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider">Revision Flashcards</h4>
              <span className="text-[11px] font-mono text-indigo-400 font-bold">Tap to flip</span>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {studioPackage.flashcards.map((fc, idx) => {
                const isFlipped = flippedCardIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setFlippedCardIndex(isFlipped ? null : idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer ${
                      isFlipped
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-indigo-400'
                    }`}
                  >
                    <div className="font-bold">{fc.front}</div>
                    {isFlipped && (
                      <div className="mt-2 pt-2 border-t border-emerald-500/30 text-emerald-300">
                        {fc.back}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider">5-Mark Evaluation Schemes</h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {studioPackage.boardQuestions.map((bq, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5 text-xs"
                >
                  <div className="font-bold">
                    Q{idx + 1} ({bq.marks} Marks): {bq.question}
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
                    {bq.answerScheme}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
