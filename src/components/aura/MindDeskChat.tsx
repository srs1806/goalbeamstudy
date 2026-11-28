import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Mic,
  MicOff,
  User,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { CLASS_10_SUBJECTS } from '../../data/chaptersData';
import { AutoGrowPromptInput } from '../ui/ResponsiveTextControls';
import { generateOfflineTutorReply } from '../../utils/offlineStudyEngine';

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

type ReasoningTier = 'rapid' | 'balanced' | 'interactive' | 'deep';

const PERSONA_PRESETS = [
  {
    id: 'mentor',
    label: 'Board Exam Mentor',
    instruction:
      'You are Goalbeam MindDesk, an articulate CBSE Class 10 Course Academic Mentor. Format answers clearly with definitions, step-by-step derivations, formulas, and board marking keywords.',
  },
  {
    id: 'proof',
    label: 'Strict Proof & Numericals Tutor',
    instruction:
      'You are a rigorous Mathematics and Physics tutor. Break every numerical and theorem proof into Given, Formula, Step-by-step Substitution, and Final Answer with SI units.',
  },
  {
    id: 'concise',
    label: 'Rapid Revision Flashcard Coach',
    instruction:
      'Give ultra-crisp bullet summaries, memory mnemonics, and 3 probable 1-mark exam questions at the end of every answer.',
  },
  {
    id: 'custom',
    label: 'Custom System Role',
    instruction: '',
  },
];

interface MindDeskChatProps {
  initialPrompt?: string;
}

export const MindDeskChat: React.FC<MindDeskChatProps> = ({ initialPrompt }) => {
  const [tier, setTier] = useState<ReasoningTier>('balanced');
  const [subject, setSubject] = useState<string>('all');
  const [personaId, setPersonaId] = useState<string>('mentor');
  const [customPersona, setCustomPersona] = useState<string>(PERSONA_PRESETS[0].instruction);
  const [showRolePanel, setShowRolePanel] = useState<boolean>(false);

  const [input, setInput] = useState<string>(initialPrompt || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-minddesk',
      role: 'assistant',
      text: 'Welcome to **MindDesk Dialogue**. Ask any syllabus doubt, numerical, theorem proof, or revision question — I retain our full conversation context across turns.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const activeSystemInstruction =
    personaId === 'custom'
      ? customPersona.trim() || PERSONA_PRESETS[0].instruction
      : (PERSONA_PRESETS.find((p) => p.id === personaId)?.instruction || PERSONA_PRESETS[0].instruction) +
        (subject !== 'all' ? ` Focus specifically on CBSE Class 10 ${subject}.` : '');

  const handleSend = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || isLoading) return;

    if (!preset) setInput('');
    const userTurn: ChatTurn = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historySnapshot = messages.slice(-16).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userTurn]);
    setIsLoading(true);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('offline');
      }
      const res = await fetch('/api/aura/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historySnapshot,
          systemInstruction: activeSystemInstruction,
          mode: tier,
        }),
      });
      if (!res.ok) throw new Error('api_error');
      const data = await res.json();
      const replyText =
        data?.reply ||
        generateOfflineTutorReply(text);

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: replyText,
          modelUsed: data?.model,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      const offlineReply = generateOfflineTutorReply(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: offlineReply,
          modelUsed: 'Offline Knowledge Vault',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        text: 'Fresh session started in **MindDesk Dialogue**. What topic would you like to master next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (speakingId === id) {
      synth.cancel();
      setSpeakingId(null);
      return;
    }
    synth.cancel();
    const clean = text.replace(/[*#_`$]/g, '').slice(0, 1000);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1.04;
    utt.onend = () => setSpeakingId(null);
    utt.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    synth.speak(utt);
  };

  const handleToggleMic = async () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType =
        ['audio/webm', 'audio/mp4', 'audio/ogg'].find(
          (t) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t)
        ) || '';
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const resolvedType = mr.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: resolvedType });
        if (blob.size < 100) return;
        setIsTranscribing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const res = await fetch('/api/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: reader.result as string,
                mimeType: resolvedType,
              }),
            });
            const data = await res.json();
            if (data.success && data.transcript) {
              setInput((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
            }
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'rapid', label: 'Rapid Flash' },
              { id: 'balanced', label: 'Balanced Study' },
              { id: 'interactive', label: 'Interactive Mentor' },
              { id: 'deep', label: 'Deep Reasoning' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTier(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                tier === item.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Subjects</option>
            {CLASS_10_SUBJECTS.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowRolePanel((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showRolePanel
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Persona</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-cyan-400 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Thread</span>
          </button>
        </div>
      </div>

      {/* Collapsible Persona & System Instruction Configurator */}
      {showRolePanel && (
        <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {PERSONA_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPersonaId(p.id);
                  if (p.instruction) setCustomPersona(p.instruction);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  personaId === p.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {personaId === 'custom' && (
            <textarea
              rows={2}
              value={customPersona}
              onChange={(e) => setCustomPersona(e.target.value)}
              placeholder="Write custom instructions for how MindDesk should teach you..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
            />
          )}
        </div>
      )}

      {/* Conversation Feed */}
      <div className="h-[420px] sm:h-[460px] overflow-y-auto space-y-3 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[78%] p-3.5 rounded-xl text-xs sm:text-sm space-y-2 ${
                  isUser
                    ? 'bg-cyan-500/15 border border-cyan-400/40 text-[var(--text-primary)]'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-[var(--text-muted)] border-b border-[var(--border-color)]/50 pb-1">
                  <span className="font-bold">{isUser ? 'You' : 'MindDesk'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-[13px]">
                  {msg.text}
                </div>

                {!isUser && (
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-[var(--text-muted)]">
                    <button
                      type="button"
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer font-semibold"
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>{speakingId === msg.id ? 'Stop' : 'Listen'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer font-semibold"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold px-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Synthesizing response ({tier})...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          'Derive Mirror Formula step by step',
          'Prove √5 is irrational for 3 marks',
          'Summarize Double Circulation in humans',
          'Explain Treaty of Vienna 1815 in 5 points',
        ].map((promptText) => (
          <button
            key={promptText}
            type="button"
            onClick={() => handleSend(promptText)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-cyan-500/10 border border-[var(--border-color)] hover:border-cyan-400/50 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-cyan-300 text-left break-words cursor-pointer"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2"
      >
        <AutoGrowPromptInput
          value={input}
          onValueChange={setInput}
          onSubmitPrompt={() => handleSend()}
          placeholder={
            isTranscribing
              ? 'Transcribing speech...'
              : 'Ask anything or follow up on our conversation...'
          }
          className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-[var(--text-primary)]"
        />

        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={isTranscribing}
            className={`p-3 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-cyan-400'
            }`}
            title="Speak your question"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};
