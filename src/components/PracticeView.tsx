import React, { useState, useEffect, useMemo } from 'react';
import {
  Profile,
  LanguageMode,
  QuizQuestion,
  QuizSourceLink,
  QuizAttempt,
  FlashcardItem,
  FlashcardProgress,
} from '../types/tracker';
import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import { CLASS_10_FLASHCARDS } from '../data/flashcardsData';
import { generateCuratedFallbackQuiz } from '../data/mcqFallbackBank';
import { getLocalStudyDateKey, updateStreak } from '../utils/storage';
import {
  CheckSquare,
  Sparkles,
  Shuffle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  Layers,
  Plus,
  Trash2,
  Eye,
  Award,
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeViewProps {
  profile: Profile;
  isGuestPreview?: boolean;
  onUpdateProfile: (updated: Profile) => void;
  language?: LanguageMode;
}

function addDaysToDateKey(baseDateKey: string, days: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(baseDateKey);
  const dt = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date();
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const mo = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  profile,
  isGuestPreview = false,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'mcq' | 'flashcards'>('mcq');

  const enrolledSubjects = useMemo(() => {
    const ids = profile.selectedSubjectIds || ['maths', 'science', 'sst', 'english', 'hindi_b'];
    const filtered = CLASS_10_SUBJECTS.filter((s) => ids.includes(s.id));
    return filtered.length > 0 ? filtered : CLASS_10_SUBJECTS.slice(0, 5);
  }, [profile.selectedSubjectIds]);

  // =========================================================================
  // 1. Live 10-Question MCQ Quiz State (Gemini + Google Search Grounding)
  // =========================================================================
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(enrolledSubjects[0]?.id || 'science');
  const selectedSubject = useMemo(
    () => enrolledSubjects.find((s) => s.id === selectedSubjectId) || enrolledSubjects[0],
    [enrolledSubjects, selectedSubjectId]
  );

  const availableChapters = useMemo(
    () => selectedSubject?.groups.flatMap((g) => g.chapters) || [],
    [selectedSubject]
  );

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    availableChapters[0]?.id || ''
  );

  useEffect(() => {
    if (!availableChapters.some((ch) => ch.id === selectedChapterId)) {
      setSelectedChapterId(availableChapters[0]?.id || '');
    }
  }, [availableChapters, selectedChapterId]);

  const [enableTimer, setEnableTimer] = useState<boolean>(true);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizNotice, setQuizNotice] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizMode, setQuizMode] = useState<'chapter' | 'random'>('chapter');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sources, setSources] = useState<QuizSourceLink[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(600);
  const [quizStartedAt, setQuizStartedAt] = useState<number>(0);

  // Countdown tick while quiz active
  useEffect(() => {
    if (questions.length === 0 || isSubmitted || !enableTimer) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [questions.length, isSubmitted, enableTimer]);

  // Auto-submit when 10-minute timer reaches 0
  useEffect(() => {
    if (enableTimer && questions.length > 0 && !isSubmitted && secondsLeft === 0) {
      handleSubmitQuiz();
    }
  }, [secondsLeft, enableTimer, questions.length, isSubmitted]);

  const startLiveMcqQuiz = async (modeToRun: 'chapter' | 'random') => {
    setQuizLoading(true);
    setQuizError(null);
    setQuizNotice(null);
    setQuestions([]);
    setSources([]);
    setAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setQuizMode(modeToRun);

    const chosenChapter = availableChapters.find((c) => c.id === selectedChapterId) || availableChapters[0];
    const chapterLabel =
      modeToRun === 'random'
        ? 'Mixed Enrolled Chapters'
        : chosenChapter?.name || selectedSubject?.name || 'Core Syllabus';
    const seedToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const response = await fetch('/api/quiz/generate-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: profile.board || 'CBSE',
          subjectId: selectedSubject?.id || 'science',
          subjectName: selectedSubject?.name || 'Science',
          chapterId: chosenChapter?.id || '',
          chapterName: chapterLabel,
          mode: modeToRun,
          enrolledSubjectNames: enrolledSubjects.map((s) => s.name),
          seedToken,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success || !Array.isArray(data?.questions)) {
        throw new Error(data?.error || 'Unable to fetch 10 MCQs right now.');
      }

      setQuizTitle(data.quizTitle || `${chapterLabel} — 10-MCQ Sprint`);
      setQuestions(data.questions);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      if (data.notice) {
        setQuizNotice(String(data.notice));
      }
      setSecondsLeft(600);
      setQuizStartedAt(Date.now());
    } catch {
      const localFallback = generateCuratedFallbackQuiz({
        board: profile.board || 'CBSE',
        subjectName: selectedSubject?.name || 'Science',
        chapterName: chapterLabel,
        mode: modeToRun,
        enrolledSubjectNames: enrolledSubjects.map((s) => s.name),
        seedToken,
      });
      setQuizTitle(localFallback.quizTitle);
      setQuestions(localFallback.questions);
      setSources(localFallback.sources);
      setQuizNotice('Offline/Curated 10-question NCERT/CBSE Sprint loaded so you can keep practicing uninterrupted.');
      setSecondsLeft(600);
      setQuizStartedAt(Date.now());
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted || questions.length === 0) return;
    setIsSubmitted(true);

    const score = questions.reduce(
      (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
      0
    );
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - quizStartedAt) / 1000));
    const xpEarned = score * 15 + 50;

    if (score >= 7) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    if (!isGuestPreview) {
      const chosenChapter = availableChapters.find((c) => c.id === selectedChapterId);
      const attempt: QuizAttempt = {
        id: `quiz-${Date.now()}`,
        subjectId: quizMode === 'random' ? 'mixed' : selectedSubject?.id || 'science',
        subjectName: quizMode === 'random' ? 'Random Class 10 Mix' : selectedSubject?.name || 'Science',
        chapterName: quizMode === 'random' ? 'Mixed Subjects & Chapters' : chosenChapter?.name || 'Chapter Quiz',
        mode: quizMode,
        score,
        totalQuestions: questions.length,
        xpEarned,
        timeSpentSeconds,
        completedAt: new Date().toISOString(),
      };

      const nextHistory = [attempt, ...(profile.quizHistory || [])].slice(0, 40);
      const updated = updateStreak({
        ...profile,
        xp: (profile.xp || 0) + xpEarned,
        focusPoints: (profile.focusPoints || 0) + xpEarned,
        quizHistory: nextHistory,
      });
      onUpdateProfile(updated);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // =========================================================================
  // 2. Smart Flashcards & Spaced-Repetition State
  // =========================================================================
  const todayKey = getLocalStudyDateKey();
  const [fcSubjectFilter, setFcSubjectFilter] = useState<string>('all');
  const [fcQueueFilter, setFcQueueFilter] = useState<'all' | 'due' | 'mastered'>('all');
  const [fcIndex, setFcIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showAddCard, setShowAddCard] = useState<boolean>(false);
  const [newCardSubject, setNewCardSubject] = useState<string>(enrolledSubjects[0]?.id || 'maths');
  const [newCardChapter, setNewCardChapter] = useState<string>('');
  const [newCardFront, setNewCardFront] = useState<string>('');
  const [newCardBack, setNewCardBack] = useState<string>('');
  const [newCardHint, setNewCardHint] = useState<string>('');

  const allFlashcards = useMemo<FlashcardItem[]>(() => {
    return [...(profile.customFlashcards || []), ...CLASS_10_FLASHCARDS];
  }, [profile.customFlashcards]);

  const flashcardProgressMap = profile.flashcardProgress || {};

  const filteredFlashcards = useMemo(() => {
    return allFlashcards.filter((card) => {
      if (fcSubjectFilter !== 'all' && card.subjectId !== fcSubjectFilter) return false;
      const prog = flashcardProgressMap[card.id];
      if (fcQueueFilter === 'due') {
        if (!prog) return true;
        return prog.status === 'review' || prog.nextReviewDate <= todayKey;
      }
      if (fcQueueFilter === 'mastered') {
        return prog?.status === 'mastered';
      }
      return true;
    });
  }, [allFlashcards, fcSubjectFilter, fcQueueFilter, flashcardProgressMap, todayKey]);

  const safeFcIdx = filteredFlashcards.length > 0 ? fcIndex % filteredFlashcards.length : 0;
  const activeFlashcard = filteredFlashcards[safeFcIdx] || null;
  const activeFcProgress = activeFlashcard ? flashcardProgressMap[activeFlashcard.id] : undefined;

  const masteredCount = useMemo(
    () =>
      allFlashcards.filter((c) => flashcardProgressMap[c.id]?.status === 'mastered').length,
    [allFlashcards, flashcardProgressMap]
  );

  const handleGradeFlashcard = (cardId: string, grade: 'review' | 'mastered') => {
    if (isGuestPreview) {
      setIsFlipped(false);
      setShowHint(false);
      setFcIndex((prev) => (prev + 1) % Math.max(1, filteredFlashcards.length));
      return;
    }

    const prevEntry = flashcardProgressMap[cardId];
    const nextReviewDate =
      grade === 'mastered'
        ? addDaysToDateKey(todayKey, 7)
        : addDaysToDateKey(todayKey, 1);

    const updatedEntry: FlashcardProgress = {
      status: grade,
      reviewCount: (prevEntry?.reviewCount || 0) + 1,
      lastReviewedDate: todayKey,
      nextReviewDate,
    };

    const updated = updateStreak({
      ...profile,
      xp: (profile.xp || 0) + (grade === 'mastered' ? 15 : 5),
      flashcardProgress: {
        ...flashcardProgressMap,
        [cardId]: updatedEntry,
      },
    });
    onUpdateProfile(updated);
    setIsFlipped(false);
    setShowHint(false);
    setFcIndex((prev) => (prev + 1) % Math.max(1, filteredFlashcards.length));
  };

  const handleAddCustomFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardFront.trim() || !newCardBack.trim() || isGuestPreview) return;

    const newItem: FlashcardItem = {
      id: `fc-custom-${Date.now()}`,
      subjectId: newCardSubject,
      chapterName: newCardChapter.trim() || 'Personal Revision',
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      hint: newCardHint.trim() || undefined,
      isCustom: true,
    };

    onUpdateProfile({
      ...profile,
      customFlashcards: [newItem, ...(profile.customFlashcards || [])],
    });
    setNewCardChapter('');
    setNewCardFront('');
    setNewCardBack('');
    setNewCardHint('');
    setShowAddCard(false);
    setFcIndex(0);
  };

  const handleDeleteCustomCard = (cardId: string) => {
    if (isGuestPreview) return;
    onUpdateProfile({
      ...profile,
      customFlashcards: (profile.customFlashcards || []).filter((c) => c.id !== cardId),
    });
    setFcIndex(0);
    setIsFlipped(false);
  };

  const recentAttempts = profile.quizHistory || [];
  const averageAccuracy = useMemo(() => {
    if (recentAttempts.length === 0) return 0;
    const sum = recentAttempts.reduce(
      (acc, a) => acc + (a.score / Math.max(1, a.totalQuestions)) * 100,
      0
    );
    return Math.round(sum / recentAttempts.length);
  }, [recentAttempts]);

  const currentQuestion = questions[currentIdx] || null;
  const quizScore = questions.reduce(
    (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
    0
  );

  return (
    <div className="space-y-6 pb-16 sm:pb-20 animate-in fade-in min-w-0">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Class 10 {profile.board || 'CBSE'} · Live Practice &amp; Active Recall
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] [text-wrap:balance]">
              Chapter MCQ Sprint &amp; Smart Flashcards
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl">
              Launch fresh 10-question MCQs on any chapter or random mix powered by Gemini and Google Search, or drill high-yield formulas and dates with spaced repetition.
            </p>
          </div>

          {/* Segmented Mode Switcher */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] shrink-0 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('mcq')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                activeTab === 'mcq'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>10-MCQ Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Flashcards ({allFlashcards.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: LIVE 10-QUESTION CHAPTER MCQ SPRINT                           */}
      {/* ===================================================================== */}
      {activeTab === 'mcq' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Control & Setup Deck (~35% / 4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Configure 10-Question Sprint</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Subject
                  </label>
                  <select
                    value={selectedSubject?.id || ''}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    disabled={quizLoading}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                  >
                    {enrolledSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Chapter
                  </label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    disabled={quizLoading}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400"
                  >
                    {availableChapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.no}: {ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] cursor-pointer">
                  <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>10-Minute Focus Countdown</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={enableTimer}
                    onChange={(e) => setEnableTimer(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => startLiveMcqQuiz('chapter')}
                  disabled={quizLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {quizLoading && quizMode === 'chapter' ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <CheckSquare className="w-4 h-4 shrink-0" />
                  )}
                  <span>Generate Chapter 10 MCQs</span>
                </button>

                <button
                  type="button"
                  onClick={() => startLiveMcqQuiz('random')}
                  disabled={quizLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-elevated)] hover:border-cyan-400/60 border border-[var(--border-color)] disabled:opacity-60 text-[var(--text-primary)] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {quizLoading && quizMode === 'random' ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-cyan-400" />
                  ) : (
                    <Shuffle className="w-4 h-4 shrink-0 text-cyan-400" />
                  )}
                  <span>Random 10 MCQs Anytime</span>
                </button>
              </div>
            </div>

            {/* Quiz Performance Summary */}
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Practice Telemetry
                </h3>
                <span className="text-xs font-mono tabular-nums font-bold text-cyan-400">
                  {recentAttempts.length} Sprints
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <div className="text-lg font-black font-mono tabular-nums text-[var(--text-primary)]">
                    {averageAccuracy}%
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    Avg Accuracy
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <div className="text-lg font-black font-mono tabular-nums text-emerald-400">
                    {profile.xp || 0}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    Total XP Earned
                  </div>
                </div>
              </div>

              {recentAttempts.length > 0 && (
                <div className="pt-2 border-t border-[var(--border-color)]/60 space-y-2">
                  <div className="text-xs font-bold text-[var(--text-secondary)]">
                    Recent Sprints
                  </div>
                  {recentAttempts.slice(0, 3).map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-2 text-xs py-1"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--text-primary)] truncate">
                          {att.chapterName}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          {att.subjectName} · {new Date(att.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-mono tabular-nums font-black text-cyan-400 shrink-0">
                        {att.score}/{att.totalQuestions}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive 10-MCQ Stage (~65% / 8 cols on lg) */}
          <div className="lg:col-span-8">
            {quizLoading ? (
              <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                <h3 className="text-lg font-extrabold text-[var(--text-primary)]">
                  Searching NCERT &amp; CBSE Resources via Gemini...
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                  Generating 10 fresh Class 10 MCQs grounded with live Google Search citations, board difficulty mix, and solutions.
                </p>
              </div>
            ) : quizError ? (
              <div className="rounded-2xl bg-[var(--bg-card)] border border-rose-500/40 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                      Unable to Generate Live Questions
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] break-words">
                      {quizError}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startLiveMcqQuiz(quizMode)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('flashcards')}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs cursor-pointer"
                  >
                    Practice Offline Flashcards Instead
                  </button>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mx-auto">
                  <CheckSquare className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    Ready for a 10-Question Quiz Sprint?
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Select any chapter on the left for focused NCERT/PYQ practice, or press Random 10 MCQs Anytime for an instant cross-subject board warm-up.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => startLiveMcqQuiz('chapter')}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                  >
                    Start Chapter 10 MCQs
                  </button>
                  <button
                    type="button"
                    onClick={() => startLiveMcqQuiz('random')}
                    className="px-5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-cyan-400/60 text-[var(--text-primary)] font-bold text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                  >
                    Surprise Random 10 MCQs
                  </button>
                </div>
              </div>
            ) : !isSubmitted && currentQuestion ? (
              <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 shadow-sm space-y-5">
                {quizNotice && (
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/30 px-3.5 py-2 text-xs font-semibold text-cyan-200 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{quizNotice}</span>
                  </div>
                )}

                {/* Quiz Header Telemetry */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-color)]/60">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[var(--text-secondary)]">
                      {quizTitle} · {currentQuestion.topicTag} · {currentQuestion.difficulty}
                    </div>
                    <div className="text-sm font-black font-mono tabular-nums text-[var(--text-primary)] mt-0.5">
                      Question {currentIdx + 1} of {questions.length}
                    </div>
                  </div>

                  {enableTimer && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono tabular-nums text-xs font-black border ${
                        secondsLeft <= 60
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-cyan-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatTimer(secondsLeft)}</span>
                    </div>
                  )}
                </div>

                {/* Progress Step Bar */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentIdx;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        aria-label={`Jump to question ${idx + 1}`}
                        className={`h-8 rounded-lg font-mono tabular-nums text-xs font-bold transition-all cursor-pointer border ${
                          isCurrent
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Question Prompt */}
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-relaxed break-words">
                    {currentQuestion.question}
                  </h3>

                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = answers[currentQuestion.id] === optIdx;
                      return (
                        <button
                          key={`${currentQuestion.id}-${optIdx}`}
                          type="button"
                          onClick={() => {
                            setAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: optIdx,
                            }));
                            if (!isGuestPreview) {
                              onUpdateProfile(updateStreak(profile));
                            }
                          }}
                          className={`w-full min-h-[44px] text-left px-4 py-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 text-[var(--text-primary)] font-bold'
                              : 'bg-[var(--bg-elevated)]/70 border-[var(--border-color)] hover:border-cyan-400/50 text-[var(--text-primary)] font-medium'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-sm leading-snug break-words flex-1">
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-color)]/60">
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                    disabled={currentIdx === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] disabled:opacity-40 text-xs font-bold text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span>Previous</span>
                  </button>

                  <div className="text-xs font-mono tabular-nums text-[var(--text-secondary)]">
                    Answered: {Object.keys(answers).length}/{questions.length}
                  </div>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black cursor-pointer whitespace-nowrap"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer whitespace-nowrap"
                    >
                      <span>Submit 10-MCQ Sprint</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Post-Quiz Results & Explanations */
              <div className="space-y-4">
                <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4 shrink-0" />
                      <span>10-Question Sprint Completed</span>
                    </div>
                    <h3 className="text-2xl font-black font-mono tabular-nums text-[var(--text-primary)] mt-1">
                      Score: {quizScore} / {questions.length} (
                      {Math.round((quizScore / Math.max(1, questions.length)) * 100)}%)
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {isGuestPreview
                        ? 'Create a profile in Setup to save your XP, accuracy history, and daily streak.'
                        : `+${quizScore * 15 + 50} XP earned and daily study streak synced.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startLiveMcqQuiz(quizMode)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>New 10 Questions</span>
                    </button>
                  </div>
                </div>

                {/* Grounded Google Search Sources */}
                {sources.length > 0 && (
                  <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 space-y-2">
                    <div className="text-xs font-extrabold text-[var(--text-primary)]">
                      Verified Google Search &amp; Curriculum References
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((src) => (
                        <a
                          key={src.uri}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-cyan-400/60 text-xs font-semibold text-cyan-400"
                        >
                          <span className="truncate max-w-[220px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-Question Answer Review */}
                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const userChoice = answers[q.id];
                    const isCorrect = userChoice === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs font-semibold text-[var(--text-secondary)]">
                            Question {idx + 1} · {q.topicTag} · {q.difficulty}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-black shrink-0 ${
                              isCorrect ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Correct</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Incorrect</span>
                              </>
                            )}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {q.question}
                        </p>

                        <div className="text-xs space-y-1">
                          {userChoice !== undefined && !isCorrect && (
                            <div className="text-rose-400 font-semibold">
                              Your answer: {q.options[userChoice]}
                            </div>
                          )}
                          <div className="text-emerald-400 font-bold">
                            Correct answer: {q.options[q.correctIndex]}
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-elevated)] rounded-xl p-3 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SMART FLASHCARDS & FORMULA RECALL DECK                        */}
      {/* ===================================================================== */}
      {activeTab === 'flashcards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Controls & Custom Card Creator */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                  Deck Filters
                </h2>
                <span className="text-xs font-mono tabular-nums font-bold text-emerald-400">
                  {masteredCount}/{allFlashcards.length} Mastered
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Subject
                  </label>
                  <select
                    value={fcSubjectFilter}
                    onChange={(e) => {
                      setFcSubjectFilter(e.target.value);
                      setFcIndex(0);
                      setIsFlipped(false);
                      setShowHint(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm font-semibold text-[var(--text-primary)]"
                  >
                    <option value="all">All Class 10 Subjects</option>
                    {enrolledSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Revision Queue
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                    {(
                      [
                        ['all', 'All'],
                        ['due', 'Due'],
                        ['mastered', 'Mastered'],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setFcQueueFilter(key);
                          setFcIndex(0);
                          setIsFlipped(false);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          fcQueueFilter === key
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {!isGuestPreview && (
                <button
                  type="button"
                  onClick={() => setShowAddCard((p) => !p)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-cyan-400/60 text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{showAddCard ? 'Close Card Form' : 'Create Custom Flashcard'}</span>
                </button>
              )}

              {showAddCard && (
                <form
                  onSubmit={handleAddCustomFlashcard}
                  className="space-y-2.5 pt-3 border-t border-[var(--border-color)]/60"
                >
                  <select
                    value={newCardSubject}
                    onChange={(e) => setNewCardSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
                  >
                    {enrolledSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newCardChapter}
                    onChange={(e) => setNewCardChapter(e.target.value)}
                    placeholder="Chapter / Topic name"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                  <textarea
                    value={newCardFront}
                    onChange={(e) => setNewCardFront(e.target.value)}
                    placeholder="Question, formula prompt, or historical date..."
                    rows={2}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                  <textarea
                    value={newCardBack}
                    onChange={(e) => setNewCardBack(e.target.value)}
                    placeholder="Complete answer / equation..."
                    rows={3}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                  <input
                    type="text"
                    value={newCardHint}
                    onChange={(e) => setNewCardHint(e.target.value)}
                    placeholder="Optional memory cue"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    Save Flashcard
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Interactive Flashcard Stage */}
          <div className="lg:col-span-8">
            {!activeFlashcard ? (
              <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-extrabold text-[var(--text-primary)]">
                  No Flashcards in This Filter Queue
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Switch back to All Cards or pick another Class 10 subject to keep drilling.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFcSubjectFilter('all');
                    setFcQueueFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Show All Flashcards
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-7 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-color)]/60">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Card {safeFcIdx + 1} of {filteredFlashcards.length} ·{' '}
                    {CLASS_10_SUBJECTS.find((s) => s.id === activeFlashcard.subjectId)?.name ||
                      activeFlashcard.subjectId}{' '}
                    · {activeFlashcard.chapterName}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        activeFcProgress?.status === 'mastered'
                          ? 'text-emerald-400'
                          : activeFcProgress?.status === 'review'
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {activeFcProgress?.status === 'mastered'
                        ? '● Mastered'
                        : activeFcProgress?.status === 'review'
                        ? '▲ Review Due'
                        : 'New Card'}
                    </span>
                    {activeFlashcard.isCustom && !isGuestPreview && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomCard(activeFlashcard.id)}
                        title="Delete custom card"
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Flip Surface */}
                <button
                  type="button"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="w-full min-h-[220px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-cyan-400/60 p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-cyan-400 mb-3">
                    {isFlipped ? 'Answer & Key Concept (Tap to flip back)' : 'Recall Prompt (Tap card to reveal answer)'}
                  </span>
                  <p className="text-base sm:text-xl font-bold text-[var(--text-primary)] whitespace-pre-line leading-relaxed max-w-2xl">
                    {isFlipped ? activeFlashcard.back : activeFlashcard.front}
                  </p>
                  {!isFlipped && activeFlashcard.hint && showHint && (
                    <p className="mt-4 text-xs text-amber-300 font-semibold">
                      Hint: {activeFlashcard.hint}
                    </p>
                  )}
                </button>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFcIndex((p) =>
                          (p - 1 + filteredFlashcards.length) % filteredFlashcards.length
                        );
                        setIsFlipped(false);
                        setShowHint(false);
                      }}
                      className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFlipped((p) => !p)}
                      className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-cyan-400 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>{isFlipped ? 'Show Prompt' : 'Reveal Answer'}</span>
                    </button>
                    {!isFlipped && activeFlashcard.hint && (
                      <button
                        type="button"
                        onClick={() => setShowHint((p) => !p)}
                        className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-amber-300 cursor-pointer"
                      >
                        {showHint ? 'Hide Hint' : 'Hint'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGradeFlashcard(activeFlashcard.id, 'review')}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-xs cursor-pointer whitespace-nowrap"
                    >
                      Review Again (1d)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGradeFlashcard(activeFlashcard.id, 'mastered')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer whitespace-nowrap"
                    >
                      Mastered (+7d)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
