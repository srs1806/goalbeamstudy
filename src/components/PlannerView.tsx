import React, { useState, useMemo } from 'react';
import { Profile, TimetableSlot, ActiveScreen, LanguageMode } from '../types/tracker';
import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import {
  buildSuggestedExamDateSheet,
  buildDefaultTimetableSlots,
} from '../data/flashcardsData';
import { getLocalStudyDateKey, updateStreak } from '../utils/storage';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface PlannerViewProps {
  profile: Profile;
  isGuestPreview?: boolean;
  onUpdateProfile: (updated: Profile) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenSubjectChapters?: (subjectId: string) => void;
  language?: LanguageMode;
}

function getDaysBetweenIso(targetIso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((targetIso || '').trim());
  if (!m) return NaN;
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetUtc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Math.round((targetUtc - todayUtc) / (24 * 60 * 60 * 1000));
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  profile,
  isGuestPreview = false,
  onUpdateProfile,
  onNavigate,
  onOpenSubjectChapters,
}) => {
  const todayKey = getLocalStudyDateKey();

  const enrolledSubjects = useMemo(() => {
    const ids = profile.selectedSubjectIds || ['maths', 'science', 'sst', 'english', 'hindi_b'];
    const filtered = CLASS_10_SUBJECTS.filter((s) => ids.includes(s.id));
    return filtered.length > 0 ? filtered : CLASS_10_SUBJECTS.slice(0, 5);
  }, [profile.selectedSubjectIds]);

  const effectiveDateSheet = useMemo(() => {
    const suggested = buildSuggestedExamDateSheet(
      enrolledSubjects.map((s) => s.id),
      profile.firstPaperDate
    );
    return {
      ...suggested,
      ...(profile.examDateSheet || {}),
    };
  }, [enrolledSubjects, profile.firstPaperDate, profile.examDateSheet]);

  const timetableSlots = useMemo<TimetableSlot[]>(() => {
    const base =
      profile.dailyTimetable && profile.dailyTimetable.length > 0
        ? profile.dailyTimetable
        : buildDefaultTimetableSlots(enrolledSubjects.map((s) => s.id));
    return [...base].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [profile.dailyTimetable, enrolledSubjects]);

  // Add New Slot Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [slotStart, setSlotStart] = useState('18:00');
  const [slotEnd, setSlotEnd] = useState('19:00');
  const [slotSubjectId, setSlotSubjectId] = useState(enrolledSubjects[0]?.id || 'maths');
  const [slotChapterId, setSlotChapterId] = useState('');
  const [slotTaskType, setSlotTaskType] = useState<TimetableSlot['taskType']>('study');
  const [slotTitle, setSlotTitle] = useState('');

  const slotChapters = useMemo(() => {
    const sub = enrolledSubjects.find((s) => s.id === slotSubjectId);
    return sub ? sub.groups.flatMap((g) => g.chapters) : [];
  }, [enrolledSubjects, slotSubjectId]);

  const completedTodayCount = timetableSlots.filter((s) => s.completedDate === todayKey).length;

  const handleToggleSlotComplete = (slotId: string) => {
    if (isGuestPreview) return;
    const baseSlots =
      profile.dailyTimetable && profile.dailyTimetable.length > 0
        ? profile.dailyTimetable
        : timetableSlots;

    let earnedNow = false;
    const updatedSlots = baseSlots.map((slot) => {
      if (slot.id !== slotId) return slot;
      const wasDoneToday = slot.completedDate === todayKey;
      if (!wasDoneToday) earnedNow = true;
      return {
        ...slot,
        completedDate: wasDoneToday ? '' : todayKey,
      };
    });

    const nextProfile = earnedNow
      ? updateStreak({
          ...profile,
          xp: (profile.xp || 0) + 20,
          dailyTimetable: updatedSlots,
        })
      : {
          ...profile,
          dailyTimetable: updatedSlots,
        };

    onUpdateProfile(nextProfile);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuestPreview) return;
    const baseSlots =
      profile.dailyTimetable && profile.dailyTimetable.length > 0
        ? profile.dailyTimetable
        : timetableSlots;

    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      startTime: slotStart,
      endTime: slotEnd,
      subjectId: slotSubjectId,
      chapterId: slotChapterId || undefined,
      taskType: slotTaskType,
      title: slotTitle.trim() || undefined,
    };

    onUpdateProfile({
      ...profile,
      dailyTimetable: [...baseSlots, newSlot],
    });
    setSlotTitle('');
    setShowAddForm(false);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (isGuestPreview) return;
    const baseSlots =
      profile.dailyTimetable && profile.dailyTimetable.length > 0
        ? profile.dailyTimetable
        : timetableSlots;
    onUpdateProfile({
      ...profile,
      dailyTimetable: baseSlots.filter((s) => s.id !== slotId),
    });
  };

  const handleExamDateChange = (subjectId: string, newDateIso: string) => {
    if (isGuestPreview || !newDateIso) return;
    onUpdateProfile({
      ...profile,
      examDateSheet: {
        ...effectiveDateSheet,
        [subjectId]: newDateIso,
      },
    });
  };

  const handleResetDateSheet = () => {
    if (isGuestPreview) return;
    const suggested = buildSuggestedExamDateSheet(
      enrolledSubjects.map((s) => s.id),
      profile.firstPaperDate
    );
    onUpdateProfile({
      ...profile,
      examDateSheet: suggested,
    });
  };

  const sortedDateSheet = useMemo(() => {
    return [...enrolledSubjects].sort((a, b) => {
      const dateA = effectiveDateSheet[a.id] || '2099-12-31';
      const dateB = effectiveDateSheet[b.id] || '2099-12-31';
      return dateA.localeCompare(dateB);
    });
  }, [enrolledSubjects, effectiveDateSheet]);

  return (
    <div className="space-y-6 pb-16 sm:pb-20 animate-in fade-in min-w-0">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Daily Study Routine · {todayKey} · 5:00 AM Rollover
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] [text-wrap:balance]">
              Study Timetable &amp; Board Exam Date-Sheet
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl">
              Organize your morning and evening study slots and keep track of live days remaining for each enrolled Class 10 board paper.
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] px-4 py-2.5 text-center shrink-0">
            <div className="text-xl font-black font-mono tabular-nums text-cyan-400">
              {completedTodayCount} / {timetableSlots.length}
            </div>
            <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Slots Done Today
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Timetable (~7 cols) + Exam Date-Sheet (~5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Daily Timetable Section */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Daily Study Timetable</span>
            </h2>

            {!isGuestPreview && (
              <button
                type="button"
                onClick={() => setShowAddForm((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>{showAddForm ? 'Cancel' : 'Add Study Slot'}</span>
              </button>
            )}
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddSlot}
              className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 space-y-3"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    required
                    className="w-full px-2.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    required
                    className="w-full px-2.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Subject
                  </label>
                  <select
                    value={slotSubjectId}
                    onChange={(e) => {
                      setSlotSubjectId(e.target.value);
                      setSlotChapterId('');
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
                  >
                    {enrolledSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Activity
                  </label>
                  <select
                    value={slotTaskType}
                    onChange={(e) => setSlotTaskType(e.target.value as TimetableSlot['taskType'])}
                    className="w-full px-2.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
                  >
                    <option value="study">NCERT Study</option>
                    <option value="mcq">10-MCQ Sprint</option>
                    <option value="flashcards">Flashcards</option>
                    <option value="revision">PYQ Revision</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={slotChapterId}
                  onChange={(e) => setSlotChapterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  <option value="">Any Chapter / General Revision</option>
                  {slotChapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      Ch {ch.no}: {ch.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={slotTitle}
                  onChange={(e) => setSlotTitle(e.target.value)}
                  placeholder="Optional focus goal (e.g., Solve Ex 8.4)"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                Save Timetable Block
              </button>
            </form>
          )}

          <div className="space-y-3">
            {timetableSlots.map((slot) => {
              const sub = CLASS_10_SUBJECTS.find((s) => s.id === slot.subjectId);
              const ch = slot.chapterId
                ? sub?.groups.flatMap((g) => g.chapters).find((c) => c.id === slot.chapterId)
                : undefined;
              const isDoneToday = slot.completedDate === todayKey;
              const taskLabel =
                slot.taskType === 'mcq'
                  ? '10-MCQ Sprint'
                  : slot.taskType === 'flashcards'
                  ? 'Flashcards'
                  : slot.taskType === 'revision'
                  ? 'Revision'
                  : 'NCERT Study';

              return (
                <div
                  key={slot.id}
                  className={`rounded-xl border p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isDoneToday
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-[var(--bg-elevated)]/70 border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      disabled={isGuestPreview}
                      onClick={() => handleToggleSlotComplete(slot.id)}
                      aria-label={isDoneToday ? 'Mark study slot incomplete' : 'Mark study slot completed'}
                      className="mt-0.5 shrink-0 cursor-pointer disabled:opacity-60"
                    >
                      {isDoneToday ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--text-secondary)] hover:text-cyan-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-mono tabular-nums font-bold text-cyan-400">
                        {slot.startTime} – {slot.endTime} · {taskLabel}
                      </div>
                      <div
                        className={`text-sm font-extrabold break-words mt-0.5 ${
                          isDoneToday
                            ? 'line-through text-[var(--text-secondary)]'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {slot.title || `${sub?.name || slot.subjectId} Study Session`}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {sub?.name || slot.subjectId}
                        {ch ? ` · Ch ${ch.no}: ${ch.name}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (slot.taskType === 'mcq' || slot.taskType === 'flashcards') {
                          onNavigate('practice');
                        } else if (onOpenSubjectChapters && sub) {
                          onOpenSubjectChapters(sub.id);
                        } else {
                          onNavigate('chapters');
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400/60 text-xs font-bold text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </button>

                    {!isGuestPreview && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id)}
                        aria-label="Delete study slot"
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Board Exam Date-Sheet Section */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Exam Date-Sheet</span>
            </h2>
            {!isGuestPreview && (
              <button
                type="button"
                onClick={handleResetDateSheet}
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] hover:text-cyan-400 cursor-pointer"
                title="Reset dates relative to 1st Paper Target Date"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Auto-Fill Dates</span>
              </button>
            )}
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Set your exact school Pre-Board or {profile.board || 'CBSE'} final exam dates for each subject to track real countdowns.
          </p>

          <div className="space-y-2.5">
            {sortedDateSheet.map((sub) => {
              const isoDate = effectiveDateSheet[sub.id] || '';
              const daysLeft = getDaysBetweenIso(isoDate);
              const badgeText = Number.isNaN(daysLeft)
                ? 'Set date'
                : daysLeft < 0
                ? 'Completed'
                : daysLeft === 0
                ? 'Exam Today'
                : `${daysLeft}d left`;

              const badgeColor = Number.isNaN(daysLeft)
                ? 'text-[var(--text-secondary)]'
                : daysLeft < 0
                ? 'text-emerald-400'
                : daysLeft <= 14
                ? 'text-amber-400'
                : 'text-cyan-400';

              return (
                <div
                  key={sub.id}
                  className="rounded-xl bg-[var(--bg-elevated)]/70 border border-[var(--border-color)] p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {sub.name}
                    </div>
                    <div className={`text-xs font-mono tabular-nums font-bold ${badgeColor}`}>
                      {badgeText} · Code {sub.code}
                    </div>
                  </div>

                  <input
                    type="date"
                    value={isoDate}
                    disabled={isGuestPreview}
                    onChange={(e) => handleExamDateChange(sub.id, e.target.value)}
                    aria-label={`Exam date for ${sub.name}`}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] disabled:opacity-60 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
