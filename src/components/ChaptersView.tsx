import React, { useState, useEffect } from 'react';
import { Profile, StageKey, StageStatus, LanguageMode } from '../types/tracker';
import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import { getProfileStages } from '../data/stagesCatalog';
import { DEFAULT_SELECTED_SUBJECT_IDS, updateStreak } from '../utils/storage';
import confetti from 'canvas-confetti';
import { playGentleStudyChime } from '../utils/notifications';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCheck,
  FileText,
  Layers,
  BookOpen,
  Filter,
  Zap,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';
import { BatchCatchUpWizardModal } from './BatchCatchUpWizardModal';
import {
  getLocalizedSubjectName,
  getLocalizedGroupName,
  getLocalizedChapterName,
  getLocalizedChapterPrefix,
} from '../utils/chapterTranslations';
import { ResourceCategory } from '../data/resourcesData';
import { getSubjectColorTheme } from '../utils/subjectColors';
import { InfoTooltip } from './InfoTooltip';
import { AutoGrowPromptInput } from './ui/ResponsiveTextControls';

interface ChaptersViewProps {
  profile: Profile;
  selectedSubjectId: string;
  targetChapterFocus?: {
    subjectId: string;
    chapterId: string;
    stageKey?: string;
    timestamp: number;
  } | null;
  onSelectSubject: (id: string) => void;
  onUpdateStage: (subjectId: string, chapterId: string, stageKey: StageKey, status: StageStatus) => void;
  onMarkChapterAllDone: (subjectId: string, chapterId: string) => void;
  onUpdateChapterNotes: (subjectId: string, chapterId: string, notes: string) => void;
  onNavigateToResources?: (subjectId: string, category: ResourceCategory | 'all', chapterName: string) => void;
  onUpdateSelectedSubjects?: (newSubjectIds: string[]) => void;
  onUpdateProfile?: (updatedProfile: Profile) => void;
  onBatchUpdateStages?: (
    updates: { subjectId: string; chapterId: string; stageKey: StageKey; status?: StageStatus }[]
  ) => void;
  isIncompleteProfile?: boolean;
  onCompleteProfile?: () => void;
  language?: LanguageMode;
}

interface AdaptiveStage3DDeckProps {
  stages: ReturnType<typeof getProfileStages>;
  chapterStages: Record<string, StageStatus> | undefined;
  targetStageKey?: string;
  onCycleStage: (stageKey: StageKey, currentStatus: StageStatus | undefined) => void;
}

const AdaptiveStage3DDeck: React.FC<AdaptiveStage3DDeckProps> = ({
  stages,
  chapterStages = {},
  targetStageKey,
  onCycleStage,
}) => {
  // Screen size awareness:
  // PC/Laptop (>= 1024px): Full-width button grid spanning the entire chapter width!
  // Tablet (640px - 1024px): 2 stages in 3D carousel + Left/Right tactile buttons
  // Mobile (< 640px): 1-2 stages in 3D carousel with finger swiping & buttons
  const [viewportWidth, setViewportWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 1200;
    return window.innerWidth;
  });

  const [mobileViewMode, setMobileViewMode] = useState<'3d' | 'grid'>('3d');

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLaptopOrPC = viewportWidth >= 1024;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  // On laptop/PC, all stages are displayed cleanly as buttons across the tab
  const allFit = isLaptopOrPC || stages.length <= (isTablet ? 3 : 2) || mobileViewMode === 'grid';

  // If all stages fit or PC screen, render clean responsive buttons spanning the whole tab
  if (allFit) {
    return (
      <div className="pt-2 border-t border-[var(--border-color)] w-full space-y-1.5">
        <div
          className="grid gap-2 w-full"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${isLaptopOrPC ? '160px' : '140px'}, 1fr))`,
          }}
        >
          {stages.map((st) => {
            const status: StageStatus = chapterStages[st.key] || 'none';
            const isDone = status === 'done';
            const isInProgress = status === 'in_progress';
            const isTargeted = targetStageKey === st.key;

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => onCycleStage(st.key, status)}
                className={`h-10 px-2.5 rounded-xl flex items-center justify-between gap-1.5 border text-xs font-bold transition-all cursor-pointer select-none bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] opacity-100 w-full shadow-sm ${
                  isTargeted
                    ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.4)] stage-targeted-beacon'
                    : isDone
                    ? 'border-2 border-emerald-500 text-emerald-300 shadow-[0_2px_8px_rgba(16,185,129,0.25)]'
                    : isInProgress
                    ? 'text-amber-300 animate-border-blink-only'
                    : 'border border-[var(--border-color)] text-[var(--text-primary)] hover:border-slate-500'
                }`}
                title={`Tap to cycle stage: ${st.label}${isTargeted ? ' (Today Target)' : ''}`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-sm shrink-0">{st.emoji || '📖'}</span>
                  <span className="text-xs font-black leading-tight break-words">{st.shortLabel}</span>
                </div>
                <span className="ml-1 shrink-0">
                  {isTargeted && !isDone ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-400 text-slate-950 font-black animate-pulse">
                      Target 🎯
                    </span>
                  ) : isDone ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  ) : isInProgress ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-400 text-slate-950 font-black">
                      Doing
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">Start</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile quick toggle if user wants to see 3D deck */}
        {!isLaptopOrPC && stages.length > 2 && (
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setMobileViewMode('3d')}
              className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Switch to 3D Rotating Deck ⇄</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3D Overlapping Carousel for Mobile / Small Screens with smooth touch swipe and tactile buttons
  const visibleCount = isTablet ? 2 : 1;
  const initialIndex = stages.findIndex((s) => chapterStages[s.key] !== 'done');
  const [activeIndex, setActiveIndex] = useState(
    initialIndex >= 0 ? Math.min(initialIndex, stages.length - visibleCount) : 0
  );

  // Auto-focus target stage if specified
  useEffect(() => {
    if (targetStageKey) {
      const idx = stages.findIndex((s) => s.key === targetStageKey);
      if (idx >= 0) {
        setActiveIndex(Math.min(idx, stages.length - visibleCount));
      }
    }
  }, [targetStageKey, stages, visibleCount]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  const maxIndex = Math.max(0, stages.length - visibleCount);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null) {
      if (touchDeltaX > 28) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
      } else if (touchDeltaX < -28) {
        setActiveIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsSwiping(false);
  };

  const nextStage = () => {
    setActiveIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const prevStage = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  // Dynamically size the 3D card based on mobile screen width so it fits properly
  const cardWidth = Math.min(220, Math.max(160, Math.floor((viewportWidth - 110) / visibleCount)));
  const cardGap = 8;
  const containerWidth = visibleCount * cardWidth + (visibleCount - 1) * cardGap;

  return (
    <div className="pt-2 border-t border-[var(--border-color)] space-y-1.5">
      {/* 3D Stage Carousel Deck Container */}
      <div
        className="relative h-12 flex items-center justify-between select-none px-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: '1000px' }}
      >
        {/* Left Tactile Arrow Button */}
        <button
          type="button"
          onClick={prevStage}
          aria-label="Previous stage"
          className="z-40 w-8 h-10 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-color)] hover:border-cyan-400 flex items-center justify-center text-cyan-400 shadow-md transition-colors cursor-pointer shrink-0"
          title="Previous stage"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 3D Stage Cards Window */}
        <div
          className="relative h-10 flex-1 flex items-center justify-center overflow-visible mx-1"
          style={{ width: `${containerWidth}px` }}
        >
          {stages.map((st, idx) => {
            const status: StageStatus = chapterStages[st.key] || 'none';
            const isDone = status === 'done';
            const isInProgress = status === 'in_progress';
            const isTargeted = targetStageKey === st.key;

            const isInFrontWindow = idx >= activeIndex && idx < activeIndex + visibleCount;
            let transform = '';
            let zIndex = 30;
            let filter = 'none';

            // Add live touch swipe nudging for buttery smooth response
            const swipeNudge = isSwiping ? Math.max(-30, Math.min(30, touchDeltaX * 0.4)) : 0;

            if (isInFrontWindow) {
              const windowSlot = idx - activeIndex;
              const slotX = (windowSlot - (visibleCount - 1) / 2) * (cardWidth + cardGap) + swipeNudge;
              transform = `translateX(${slotX}px) scale(1) translateZ(0px) rotateY(${swipeNudge * 0.15}deg)`;
              zIndex = 30;
              filter = 'none';
            } else if (idx >= activeIndex + visibleCount) {
              const rightmostSlotX = ((visibleCount - 1) / 2) * (cardWidth + cardGap) + swipeNudge;
              const diff = idx - (activeIndex + visibleCount - 1);
              const offsetPx = rightmostSlotX + Math.min(diff * 26, 68);
              const scale = Math.max(0.82, 1 - diff * 0.06);
              const rotY = -Math.min(diff * 8, 20);
              transform = `translateX(${offsetPx}px) scale(${scale}) translateZ(${-diff * 35}px) rotateY(${rotY}deg)`;
              zIndex = 30 - diff;
              filter = `brightness(${Math.max(0.75, 1 - diff * 0.12)})`;
            } else {
              const leftmostSlotX = -((visibleCount - 1) / 2) * (cardWidth + cardGap) + swipeNudge;
              const diff = activeIndex - idx;
              const offsetPx = leftmostSlotX - Math.min(diff * 26, 68);
              const scale = Math.max(0.82, 1 - diff * 0.06);
              const rotY = Math.min(diff * 8, 20);
              transform = `translateX(${offsetPx}px) scale(${scale}) translateZ(${-diff * 35}px) rotateY(${rotY}deg)`;
              zIndex = 30 - diff;
              filter = `brightness(${Math.max(0.75, 1 - diff * 0.12)})`;
            }

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => {
                  if (isInFrontWindow) {
                    onCycleStage(st.key, status);
                  } else if (idx < activeIndex) {
                    setActiveIndex(Math.max(0, idx));
                  } else {
                    setActiveIndex(Math.min(maxIndex, idx - visibleCount + 1));
                  }
                }}
                style={{
                  width: `${cardWidth}px`,
                  transform,
                  zIndex,
                  opacity: 1,
                  filter,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transition: isSwiping
                    ? 'none'
                    : 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease',
                  transformStyle: 'preserve-3d',
                }}
                className={`absolute h-9 px-2.5 rounded-xl flex items-center justify-between gap-1.5 cursor-pointer select-none bg-[var(--bg-elevated)] opacity-100 shadow-md ${
                  isTargeted
                    ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_14px_rgba(6,182,212,0.5)] stage-targeted-beacon'
                    : isDone
                    ? 'border-2 border-emerald-500 text-emerald-300 shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
                    : isInProgress
                    ? 'text-amber-300 animate-border-blink-only'
                    : 'border border-[var(--border-color)] text-[var(--text-primary)] hover:border-slate-400'
                }`}
                title={isInFrontWindow ? `Tap to update ${st.label}` : `Tap to bring ${st.label} to front`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-sm shrink-0">{st.emoji || '📖'}</span>
                  <span className="text-xs font-black leading-tight break-words text-[var(--text-primary)] tracking-tight">
                    {st.shortLabel}
                  </span>
                </div>

                <div className="shrink-0 flex items-center">
                  {isTargeted && !isDone ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-400 text-slate-950 shadow-sm animate-pulse">
                      Target 🎯
                    </span>
                  ) : isDone ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-sm">
                      ✓
                    </span>
                  ) : isInProgress ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-400 text-slate-950 shadow-sm">
                      Doing
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
                      Start
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Tactile Arrow Button */}
        <button
          type="button"
          onClick={nextStage}
          aria-label="Next stage"
          className="z-40 w-8 h-10 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-color)] hover:border-cyan-400 flex items-center justify-center text-cyan-400 shadow-md transition-colors cursor-pointer shrink-0"
          title="Next stage"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pagination Dot Indicator + Swipe Hint */}
      <div className="flex items-center justify-between px-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          {stages.map((st, idx) => {
            const stStatus = chapterStages[st.key];
            const isDone = stStatus === 'done';
            const isInProg = stStatus === 'in_progress';
            const isActive = idx >= activeIndex && idx < activeIndex + visibleCount;

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setActiveIndex(Math.min(maxIndex, Math.max(0, idx)))}
                className={`transition-all rounded-full cursor-pointer ${
                  isActive
                    ? 'w-4 h-1.5 bg-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/40'
                    : isDone
                    ? 'w-1.5 h-1.5 bg-emerald-500'
                    : isInProg
                    ? 'w-1.5 h-1.5 bg-amber-400'
                    : 'w-1.5 h-1.5 bg-[var(--border-color)]'
                }`}
                title={`Jump to ${st.shortLabel}`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)] font-medium">
            {visibleCount === 1
              ? `${activeIndex + 1}/${stages.length}: ${stages[activeIndex]?.shortLabel} • Swipe ⇄`
              : `${visibleCount} visible of ${stages.length} stages • ⇄ 3D Rotate`}
          </span>
          <button
            type="button"
            onClick={() => setMobileViewMode('grid')}
            className="text-[10px] font-bold text-cyan-400 hover:underline"
          >
            Show Grid
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChaptersView: React.FC<ChaptersViewProps> = ({
  profile,
  selectedSubjectId,
  targetChapterFocus,
  onSelectSubject,
  onUpdateStage,
  onMarkChapterAllDone,
  onUpdateChapterNotes,
  onNavigateToResources,
  onUpdateSelectedSubjects,
  onUpdateProfile,
  onBatchUpdateStages,
  isIncompleteProfile = false,
  onCompleteProfile,
  language = 'en',
}) => {
  const isGuestLocked = isIncompleteProfile || !profile?.id || profile.id === 'guest-preview';
  const triggerCompleteProfile = () => {
    onCompleteProfile?.();
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed' | 'highYield'>('all');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  // Auto-scroll and expand targeted chapter on app-native view transition redirect
  useEffect(() => {
    if (!targetChapterFocus?.chapterId) return;
    setExpandedChapterId(`${targetChapterFocus.subjectId}:${targetChapterFocus.chapterId}`);
    const timer = setTimeout(() => {
      const el = document.getElementById(`chapter-card-${targetChapterFocus.chapterId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [targetChapterFocus?.timestamp]);

  // Dynamic user-customized study references / stages
  const activeStages = getProfileStages(profile);

  const enrolledIds =
    Array.isArray(profile.selectedSubjectIds) && profile.selectedSubjectIds.length > 0
      ? profile.selectedSubjectIds
      : DEFAULT_SELECTED_SUBJECT_IDS;

  const enrolledSubjectsList = CLASS_10_SUBJECTS.filter((s) => enrolledIds.includes(s.id));

  // If selected subject is not in enrolled list, default to first or 'all'
  const activeSubject = enrolledSubjectsList.find((s) => s.id === selectedSubjectId);

  const visibleSubjects =
    selectedSubjectId === 'all'
      ? enrolledSubjectsList
      : activeSubject
      ? [activeSubject]
      : enrolledSubjectsList;

  // Trigger celebration confetti & gentle beep
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'],
      });
      playGentleStudyChime();
    } catch {
      // ignore
    }
  };

  const cycleStageStatus = (
    subjectId: string,
    chapterId: string,
    stageKey: StageKey,
    current: StageStatus | undefined
  ) => {
    let nextStatus: StageStatus = 'none';
    if (!current || current === 'none') nextStatus = 'in_progress';
    else if (current === 'in_progress') nextStatus = 'done';
    else nextStatus = 'none';

    // Check if this action will complete the chapter (all other stages already done)
    if (nextStatus === 'done') {
      const chProg = profile.progress[subjectId]?.[chapterId]?.stages || {};
      const doneOthers = activeStages.filter(
        (s) => s.key !== stageKey && chProg[s.key] === 'done'
      ).length;
      const isChapterComplete = doneOthers === activeStages.length - 1;
      if (isChapterComplete) {
        triggerCelebration();
      }
    }

    onUpdateStage(subjectId, chapterId, stageKey, nextStatus);
  };

  const handleMarkAll = (subjectId: string, chapterId: string) => {
    triggerCelebration();
    onMarkChapterAllDone(subjectId, chapterId);
  };

  // State for Fast Catch-Up Wizard modal & Quiet Toast feedback
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [quietToast, setQuietToast] = useState<string | null>(null);

  useEffect(() => {
    if (!quietToast) return;
    const timer = setTimeout(() => setQuietToast(null), 4500);
    return () => clearTimeout(timer);
  }, [quietToast]);

  const handleBatchComplete = (updates: { subjectId: string; chapterId: string; stageKey: StageKey }[]) => {
    if (!updates.length) return;

    if (onBatchUpdateStages) {
      onBatchUpdateStages(updates);
    } else {
      // Robust atomic fallback
      const newProgress = JSON.parse(JSON.stringify(profile.progress || {}));
      let pointsGained = 0;
      let chaptersCompletedCount = 0;

      updates.forEach(({ subjectId, chapterId, stageKey }) => {
        if (!newProgress[subjectId]) newProgress[subjectId] = {};
        if (!newProgress[subjectId][chapterId]) {
          newProgress[subjectId][chapterId] = { stages: {}, completed: false };
        }
        if (!newProgress[subjectId][chapterId].stages) {
          newProgress[subjectId][chapterId].stages = {};
        }

        const prevStatus = newProgress[subjectId][chapterId].stages[stageKey];
        if (prevStatus !== 'done') {
          pointsGained += 25;
        }
        newProgress[subjectId][chapterId].stages[stageKey] = 'done';
        newProgress[subjectId][chapterId].lastUpdated = new Date().toISOString();
      });

      const distinctSubjectChapters = Array.from(
        new Set(updates.map((u) => `${u.subjectId}___${u.chapterId}`))
      );

      distinctSubjectChapters.forEach((scKey) => {
        const [sId, cId] = scKey.split('___');
        const stagesState = newProgress[sId]?.[cId]?.stages || {};
        const allDone = activeStages.every((st) => stagesState[st.key] === 'done');
        const wasAllDoneBefore = activeStages.every(
          (st) => profile.progress[sId]?.[cId]?.stages?.[st.key] === 'done'
        );
        if (allDone && !wasAllDoneBefore) {
          if (newProgress[sId][cId]) {
            newProgress[sId][cId].completed = true;
          }
          chaptersCompletedCount += 1;
          pointsGained += 100;
        }
      });

      if (onUpdateProfile) {
        onUpdateProfile(
          updateStreak({
            ...profile,
            progress: newProgress,
            focusPoints: (profile.focusPoints || 0) + pointsGained,
            treesGrown: (profile.treesGrown || 0) + chaptersCompletedCount,
          })
        );
      }
    }

    const distinctSubjectChapters = Array.from(
      new Set(updates.map((u) => `${u.subjectId}___${u.chapterId}`))
    );
    const stageSummary = updates.length === 1 ? '1 stage' : `${updates.length} stages`;
    const chapterSummary =
      distinctSubjectChapters.length === 1 ? '1 chapter' : `${distinctSubjectChapters.length} chapters`;
    setQuietToast(`✓ ${stageSummary} marked complete across ${chapterSummary}!`);

    try {
      playGentleStudyChime();
    } catch {}
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 min-w-0">
      {/* Non-blocking Quiet Toast Notification for Fast Catch-Up */}
      {quietToast && (
        <div className="keep-dark-surface fixed top-16 right-4 z-50 bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-top-2 backdrop-blur-md max-w-sm">
          <div className="flex items-start gap-2 min-w-0">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="break-words [overflow-wrap:anywhere]">{quietToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setQuietToast(null)}
            className="text-emerald-400 hover:text-white cursor-pointer ml-1.5 text-sm font-black shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Unified Control Center (Scrolls naturally with the Chapters view) */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-3 sm:p-4 shadow-sm space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Section Title & Single Unified Subject Dropdown + Fast Catch-Up Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <h1 className="text-base sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                Chapters &amp; Stage Mastery
              </h1>
              <InfoTooltip
                text="Tap any stage to cycle: Start → Doing (amber blink) → Done (green ✓). Completing all stages unlocks chapter mastery."
                label="Stage mastery guide"
              />
            </div>

            {/* Dropdown Menu showing subject names with official CBSE code & exact color */}
            <div className="relative w-full sm:w-auto sm:min-w-[260px] flex-1 sm:flex-initial min-w-0">
              {activeSubject && (
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-sm pointer-events-none"
                  style={{ backgroundColor: activeSubject.color }}
                />
              )}
              <select
                value={selectedSubjectId}
                onChange={(e) => onSelectSubject(e.target.value)}
                aria-label="Select CBSE Subject"
                className={`w-full appearance-none pr-10 py-1.5 sm:py-2 rounded-xl bg-[var(--bg-elevated)] border text-xs sm:text-sm font-extrabold text-[var(--text-primary)] focus:outline-none cursor-pointer transition-all shadow-inner ${
                  activeSubject ? 'pl-9 border-current' : 'pl-3.5 border-[var(--border-color)]'
                }`}
                style={
                  activeSubject
                    ? {
                        borderColor: `${activeSubject.color}80`,
                        backgroundColor: `${activeSubject.color}10`,
                      }
                    : undefined
                }
              >
                <option value="all" className="bg-[var(--bg-card)]">
                  ✦ All Enrolled Subjects ({enrolledSubjectsList.length} Subjects)
                </option>
                {enrolledSubjectsList.map((sub) => {
                  const allowedCount = (profile.examSyllabus[sub.id] || []).length;
                  const localizedName = getLocalizedSubjectName(sub.id, sub.name, language);
                  const theme = getSubjectColorTheme(sub.id);
                  return (
                    <option key={sub.id} value={sub.id} className="bg-[var(--bg-card)]">
                      {theme.colorEmoji} {localizedName} — (Code {sub.code}) • {allowedCount} Ch
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Fast Stage Catch-Up Button (Beside the Subject Dropdown) */}
            {isGuestLocked ? (
              <button
                type="button"
                onClick={triggerCompleteProfile}
                className="h-8 sm:h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-amber-400/80 text-[var(--text-primary)] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                title="Click on me to unlock for free"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Fast Catch-Up 🔒</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="h-8 sm:h-9 px-3 rounded-xl bg-gradient-to-r from-cyan-500/15 via-emerald-500/15 to-teal-500/15 hover:from-cyan-500/25 hover:to-emerald-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                title="Fast Stage Catch-Up: Batch complete stages across multiple chapters"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fast Catch-Up ⚡</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5 pointer-events-none" />
            <AutoGrowPromptInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search chapter name or number..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Toolbar: Filter Pills */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)] flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'highYield', label: 'High-Yield' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMode === f.id
                    ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)] shadow-sm'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chapters Listing (Scrolls smoothly with the entire section) */}
      <div className="space-y-4 pb-2">
        {visibleSubjects.map((subject) => {
          const allowedIds = profile.examSyllabus[subject.id] || [];
          const subProg = profile.progress[subject.id] || {};
          const displaySubjectName = getLocalizedSubjectName(subject.id, subject.name, language);

          let totalStagesSubject = 0;
          let doneStagesSubject = 0;

          subject.groups.forEach((g) => {
            g.chapters.forEach((ch) => {
              if (allowedIds.includes(ch.id)) {
                totalStagesSubject += activeStages.length;
                const cProg = subProg[ch.id]?.stages || {};
                activeStages.forEach((st) => {
                  if (cProg[st.key] === 'done') doneStagesSubject++;
                });
              }
            });
          });

          const subjectPercent =
            totalStagesSubject > 0 ? Math.round((doneStagesSubject / totalStagesSubject) * 100) : 0;

          return (
            <div key={subject.id} className="space-y-3">
              {/* Subject Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <span
                    className="w-3.5 h-3.5 rounded-md inline-block shadow-sm shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                    {displaySubjectName}
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    Code {subject.code}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    • {allowedIds.length} Chapters
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden border border-[var(--border-color)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${subjectPercent}%`,
                        backgroundColor: subject.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {subjectPercent}%
                  </span>
                </div>
              </div>

              {/* Subject Groups & Chapter Cards */}
              {subject.groups.map((group) => {
                const filteredChapters = group.chapters.filter((ch) => {
                  if (!allowedIds.includes(ch.id)) return false;

                  const localizedCh = getLocalizedChapterName(
                    ch.id,
                    ch.name,
                    language,
                    subject.id
                  );

                  if (searchQuery.trim() !== '') {
                    const q = searchQuery.toLowerCase();
                    const matchName =
                      ch.name.toLowerCase().includes(q) ||
                      localizedCh.toLowerCase().includes(q);
                    const matchNo = String(ch.no).includes(q);
                    if (!matchName && !matchNo) return false;
                  }

                  const chProg = subProg[ch.id];
                  const doneCount = activeStages.filter(
                    (s) => chProg?.stages?.[s.key] === 'done'
                  ).length;
                  const isCompleted = doneCount === activeStages.length;

                  if (filterMode === 'completed' && !isCompleted) return false;
                  if (filterMode === 'pending' && isCompleted) return false;
                  if (filterMode === 'highYield' && !ch.highYield) return false;

                  return true;
                });

                if (filteredChapters.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-2.5">
                    {group.name && (
                      <div className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-2 pt-0.5 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-[var(--accent-primary)]" />
                        <span>{getLocalizedGroupName(group.id, group.name, language, subject.id)}</span>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {filteredChapters.map((chapter) => {
                        const chProg = subProg[chapter.id] || {
                          completed: false,
                          stages: {} as any,
                          notes: '',
                        };
                        const doneStages = activeStages.filter(
                          (s) => chProg.stages?.[s.key] === 'done'
                        ).length;
                        const inProgStages = activeStages.filter(
                          (s) => chProg.stages?.[s.key] === 'in_progress'
                        ).length;
                        const percent = Math.round((doneStages / activeStages.length) * 100);
                        const isAllDone = doneStages === activeStages.length;
                        const isExpanded = expandedChapterId === `${subject.id}:${chapter.id}`;
                        const isTargetedChapter = targetChapterFocus?.chapterId === chapter.id;

                        return (
                          <div
                            key={chapter.id}
                            id={`chapter-card-${chapter.id}`}
                            className={`rounded-2xl bg-[var(--bg-card)] border transition-all overflow-hidden shadow-sm ${
                              isTargetedChapter
                                ? 'chapter-targeted-highlight border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.4)]'
                                : isAllDone
                                ? 'border-emerald-500/50 bg-emerald-500/[0.07]'
                                : inProgStages > 0
                                ? 'border-amber-500/30'
                                : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/40'
                            }`}
                          >
                            {/* Card Content: Header & Adaptive Stages Presentation */}
                            <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                              {/* Chapter Info & Action Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                                {/* Chapter Identity */}
                                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                  <div
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono font-black text-[11px] sm:text-xs shrink-0 border transition-all ${
                                      isTargetedChapter
                                        ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.5)]'
                                        : isAllDone
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                        : 'sub-accent-pill'
                                    }`}
                                    style={
                                      !isTargetedChapter && !isAllDone
                                        ? ({ '--sub-hex': subject.color } as React.CSSProperties)
                                        : undefined
                                    }
                                  >
                                    {isAllDone ? '✓' : `C${chapter.no}`}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                      <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] break-words leading-snug tracking-tight">
                                        {getLocalizedChapterPrefix(language)} {chapter.no}:{' '}
                                        {getLocalizedChapterName(
                                          chapter.id,
                                          chapter.name,
                                          language,
                                          subject.id
                                        )}
                                      </h3>
                                      {isTargetedChapter && (
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 flex items-center gap-1 animate-pulse shrink-0">
                                          <span>🎯 Target Focus</span>
                                        </span>
                                      )}
                                      {chapter.highYield && (
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                                          High-Yield
                                        </span>
                                      )}
                                      {chapter.pyqCount && (
                                        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
                                          {chapter.pyqCount} PYQs
                                        </span>
                                      )}
                                      {chapter.cbqCount && (
                                        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                                          {chapter.cbqCount} CBQs
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[var(--text-secondary)] mt-0.5 sm:mt-1 flex-wrap">
                                      <span>
                                        <strong className="text-[var(--text-primary)] font-extrabold">{doneStages}</strong>
                                        /{activeStages.length} Stages Done
                                      </span>
                                      {inProgStages > 0 && (
                                        <span className="text-amber-400 font-bold flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                                          {inProgStages} In Progress
                                        </span>
                                      )}
                                      <span className="font-mono text-[var(--accent-primary)] font-black">
                                        • {percent}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Header Action Controls: Resources Link (Open) + Mark All Done & Notes (Locked for Guest) */}
                                <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto shrink-0 flex-wrap justify-end">
                                  {onNavigateToResources && (
                                    <button
                                      type="button"
                                      onClick={() => onNavigateToResources(subject.id, 'all', chapter.name)}
                                      title={`Browse free Notes, PYQs & MCQs for ${chapter.name}`}
                                      className="h-7 sm:h-9 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                                    >
                                      <span>Resources</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  )}

                                  {isGuestLocked ? (
                                    <button
                                      type="button"
                                      onClick={triggerCompleteProfile}
                                      title="Click on me to unlock for free"
                                      className="h-7 sm:h-9 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-amber-400/80 text-[var(--text-primary)] text-[11px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                                    >
                                      <Lock className="w-3 h-3 text-amber-400" />
                                      <span>Notes &amp; Done 🔒</span>
                                    </button>
                                  ) : (
                                    <>
                                      {!isAllDone && (
                                        <button
                                          type="button"
                                          onClick={() => handleMarkAll(subject.id, chapter.id)}
                                          title={`Mark all ${activeStages.length} stages as Completed (Celebration!)`}
                                          className="h-7 sm:h-9 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shrink-0"
                                        >
                                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>Mark All Done</span>
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedChapterId(
                                            isExpanded ? null : `${subject.id}:${chapter.id}`
                                          )
                                        }
                                        className={`h-7 sm:h-9 px-2 sm:px-2.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                                          chProg.notes && chProg.notes.trim() !== ''
                                            ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 text-[var(--accent-primary)]'
                                            : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                        title={
                                          chProg.notes && chProg.notes.trim() !== ''
                                            ? 'View/Edit Chapter Notes (Has Notes)'
                                            : 'Add Chapter Notes'
                                        }
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Notes</span>
                                        {isExpanded ? (
                                          <ChevronUp className="w-3 h-3" />
                                        ) : (
                                          <ChevronDown className="w-3 h-3" />
                                        )}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Adaptive 3D Rotating Stage Deck — Chained & Locked until profile setup completed */}
                              {isGuestLocked ? (
                                <LockedFeatureOverlay
                                  variant="compact"
                                  featureLabel="Stage Mastery"
                                  onCompleteProfile={triggerCompleteProfile}
                                >
                                  <AdaptiveStage3DDeck
                                    stages={activeStages}
                                    chapterStages={chProg.stages}
                                    targetStageKey={isTargetedChapter ? targetChapterFocus?.stageKey : undefined}
                                    onCycleStage={() => {}}
                                  />
                                </LockedFeatureOverlay>
                              ) : (
                                <AdaptiveStage3DDeck
                                  stages={activeStages}
                                  chapterStages={chProg.stages}
                                  targetStageKey={isTargetedChapter ? targetChapterFocus?.stageKey : undefined}
                                  onCycleStage={(stKey, stStatus) =>
                                    cycleStageStatus(subject.id, chapter.id, stKey, stStatus)
                                  }
                                />
                              )}
                            </div>

                            {/* Expandable Chapter Notes Drawer */}
                            {!isGuestLocked && isExpanded && (
                              <div className="px-3.5 pb-3.5 pt-2 border-t border-[var(--border-color)] bg-[var(--bg-elevated)]/40 space-y-2 animate-in fade-in">
                                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                                  <span>Revision Notes</span>
                                </label>
                                <textarea
                                  rows={2}
                                  value={chProg.notes || ''}
                                  onChange={(e) =>
                                    onUpdateChapterNotes(subject.id, chapter.id, e.target.value)
                                  }
                                  placeholder="Key formulas, NCERT pages, or doubts..."
                                  className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Fast Catch-Up Multi-Chapter Batch Wizard Modal */}
      {isBatchModalOpen && (
        <BatchCatchUpWizardModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          activeSubject={activeSubject}
          enrolledSubjects={enrolledSubjectsList}
          onSelectSubject={onSelectSubject}
          profile={profile}
          language={language}
          onApplyBatch={handleBatchComplete}
        />
      )}
    </div>
  );
};
