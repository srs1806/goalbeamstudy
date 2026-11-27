import React, { useEffect, useState } from 'react';
import {
  X,
  Volume2,
  CheckCircle2,
  ExternalLink,
  Flame,
  Calendar,
  Sparkles,
  Award,
  Music,
  Check,
} from 'lucide-react';
import {
  MorningNotificationPayload,
  MorningSoundType,
  MORNING_SOUND_OPTIONS,
  playCustomMorningNotificationSound,
} from '../utils/notifications';
import { StageKey } from '../types/tracker';
import { NotificationOSPreviewStudio } from './NotificationOSPreviewStudio';

interface MorningNotificationModalProps {
  payload: MorningNotificationPayload | null;
  onClose: () => void;
  onStartNotification?: () => void | Promise<void>;
  onMarkStageDone: (subjectId: string, chapterId: string, stage: StageKey) => void;
  onOpenSubjectChapter: (subjectId: string) => void;
  onChangeSoundType?: (sound: MorningSoundType) => void;
}

export const MorningNotificationModal: React.FC<MorningNotificationModalProps> = ({
  payload,
  onClose,
  onStartNotification,
  onMarkStageDone,
  onOpenSubjectChapter,
  onChangeSoundType,
}) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [completedTargets, setCompletedTargets] = useState<Record<string, boolean>>({});
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (payload) {
      try {
        playCustomMorningNotificationSound(payload.soundType || 'zenith-symphony');
        setIsPlayingSound(true);
        const timer = setTimeout(() => setIsPlayingSound(false), 700);
        return () => clearTimeout(timer);
      } catch {
        // Ignored
      }
    }
  }, [payload]);

  if (!payload) return null;

  const isScreenPreview = payload.previewMode === 'screens';

  const handlePlaySound = (sound: MorningSoundType) => {
    playCustomMorningNotificationSound(sound);
    setIsPlayingSound(true);
    setTimeout(() => setIsPlayingSound(false), 700);
  };

  const handleMarkDone = (subjectId: string, chapterId: string, stageKey: StageKey) => {
    const key = `${subjectId}:${chapterId}`;
    setCompletedTargets((prev) => ({ ...prev, [key]: true }));
    onMarkStageDone(subjectId, chapterId, stageKey);
  };

  const handleConfirmStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      if (onStartNotification) {
        await onStartNotification();
      } else {
        onClose();
      }
    } finally {
      setIsStarting(false);
    }
  };

  // Dedicated Zero-Scroll Screen Preview Modal with ONLY 2 options:
  // "Start Notification" and "No, I will think later"
  if (isScreenPreview) {
    return (
      <div className="fixed inset-0 z-[125] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] max-h-[760px] bg-[var(--bg-card)] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Compact Header */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/25 via-orange-500/15 to-cyan-500/25 border-b border-[var(--border-color)] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow shrink-0">
                <span className="text-base">🌅</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-black text-[var(--text-primary)] truncate">
                  Daily Target Notification Preview
                </h2>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">
                  See how alerts appear when the website is closed
                </p>
              </div>
            </div>
          </div>

          {/* Viewport-Fitted Single Device Image / Video Body (Zero Scrolling) */}
          <div className="flex-1 min-h-0 p-2.5 sm:p-3.5 flex flex-col overflow-hidden">
            <NotificationOSPreviewStudio payload={payload} />
          </div>

          {/* Strictly ONLY Two Footer Options: Start Notification & No, I will think later */}
          <div className="px-4 py-3 bg-[var(--bg-elevated)] border-t border-[var(--border-color)] grid grid-cols-2 gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isStarting}
              onClick={handleConfirmStart}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm cursor-pointer shadow-md transition-colors text-center"
            >
              {isStarting ? 'Starting...' : 'Start Notification'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs sm:text-sm cursor-pointer transition-colors text-center"
            >
              No, I will think later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[125] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Colorful Sunrise Gradient Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-cyan-500/30 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
              <span className="text-xl">🌅</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Today's Daily Target
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold font-mono">
                  Active
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] break-words">
                Ready for Today's Target, {payload.studentName}! 🚀
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handlePlaySound(payload.soundType)}
              className={`p-2 rounded-xl border border-amber-500/40 text-amber-300 bg-[var(--bg-card)] hover:bg-amber-500/20 transition-colors cursor-pointer ${
                isPlayingSound ? 'ring-2 ring-amber-400 bg-amber-500/20' : ''
              }`}
              title="Play Gentle Notification Beep"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 divide-x divide-[var(--border-color)] bg-[var(--bg-elevated)] border-b border-[var(--border-color)] text-center text-xs py-2.5 px-3 shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>1st Paper</span>
            </div>
            <div className="font-black text-xs sm:text-sm text-cyan-300 mt-0.5">
              {payload.daysLeft} Days Left
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Study Streak</span>
            </div>
            <div className="font-black text-xs sm:text-sm text-amber-300 mt-0.5">
              {payload.streakCount} Day Streak
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>Daily Goal</span>
            </div>
            <div className="font-black text-xs sm:text-sm text-emerald-300 mt-0.5">
              {payload.dailyStageGoal} Stages / Day
            </div>
          </div>
        </div>

        {/* Scrollable Body for Target Alerts */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Section-Wise Today's Targets</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-semibold">
              Tap "Mark Done" to advance stage
            </span>
          </div>

          <div className="space-y-3">
            {payload.sectionTargets && payload.sectionTargets.length > 0 ? (
              payload.sectionTargets.map((item) => {
                const targetKey = `${item.subjectId}:${item.chapterId}`;
                const isDone = completedTargets[targetKey];

                return (
                  <div
                    key={targetKey}
                    className={`p-3.5 rounded-xl border-2 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-emerald-500/15 border-emerald-500/60 opacity-95'
                        : `bg-gradient-to-br ${item.gradientClass} ${item.borderClass}`
                    }`}
                  >
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${item.badgeBgClass}`}>
                          {item.colorEmoji} {item.subjectName}
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${item.textAccentClass}`}>
                          Unit: {item.sectionName}
                        </span>
                        {item.highYield && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white">
                            High-Yield
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                        {item.chapterPrefix} {item.chapterNo}: {item.chapterName}
                      </h4>

                      <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                        <span>Target Stage:</span>
                        <strong className={item.textAccentClass}>{item.nextStageLabel}</strong>
                        <span>•</span>
                        <span className="font-mono text-[10px]">
                          {item.completedStagesCount}/{item.totalStagesCount} Stages Done
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleMarkDone(item.subjectId, item.chapterId, item.nextStageKey)}
                        disabled={isDone}
                        className={`py-2 px-3.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Done ✓</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Done</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenSubjectChapter(item.subjectId);
                          onClose();
                        }}
                        className="py-2 px-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Open Chapter View"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-[var(--text-secondary)]">
                No outstanding targets for today! You're fully on track. 🎉
              </div>
            )}
          </div>

          {/* Sound Customization Footer Bar */}
          <div className="mt-4 pt-3 border-t border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Notification Sound (Small Beep):</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {payload.soundName || 'Normal Small Beep (Startup Chime)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MORNING_SOUND_OPTIONS.map((snd) => {
                const isSelected = payload.soundType === snd.id;
                return (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => {
                      if (onChangeSoundType) onChangeSoundType(snd.id);
                      handlePlaySound(snd.id);
                    }}
                    className={`p-2 rounded-xl text-left border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold break-words">{snd.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] break-words">{snd.badge}</div>
                    </div>
                    <Volume2 className="w-3.5 h-3.5 shrink-0 opacity-70 hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="p-3 bg-[var(--bg-elevated)] border-t border-[var(--border-color)] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-[var(--text-inverse)] font-black text-xs cursor-pointer shadow-md transition-colors"
          >
            Start Today's Study Session ⚡
          </button>
        </div>
      </div>
    </div>
  );
};
