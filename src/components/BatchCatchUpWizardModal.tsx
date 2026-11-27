import React, { useState, useMemo, useEffect } from 'react';
import { Subject, Chapter, StageKey, Profile, LanguageMode } from '../types/tracker';
import { getProfileStages } from '../data/stagesCatalog';
import {
  X,
  Zap,
  Check,
  CheckCheck,
  ChevronRight,
  ChevronLeft,
  TableProperties,
  ListOrdered,
} from 'lucide-react';
import { getLocalizedChapterName, getLocalizedSubjectName } from '../utils/chapterTranslations';

export interface BatchCatchUpWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubject: Subject | undefined;
  enrolledSubjects: Subject[];
  onSelectSubject?: (subjectId: string) => void;
  profile: Profile;
  language?: LanguageMode;
  onApplyBatch: (updates: { subjectId: string; chapterId: string; stageKey: StageKey }[]) => void;
}

export const BatchCatchUpWizardModal: React.FC<BatchCatchUpWizardModalProps> = ({
  isOpen,
  onClose,
  activeSubject,
  enrolledSubjects,
  onSelectSubject,
  profile,
  language = 'en',
  onApplyBatch,
}) => {
  // Mode: Step Wizard or Fast Matrix Table
  const [viewMode, setViewMode] = useState<'wizard' | 'matrix'>('wizard');

  // Wizard Step State: 1 = Stages, 2 = Chapters, 3 = Review & Commit
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Active Subject selection
  const [workingSubjectId, setWorkingSubjectId] = useState<string>(() => {
    return activeSubject?.id || enrolledSubjects[0]?.id || 'science';
  });

  const currentSubject = useMemo(() => {
    return (
      enrolledSubjects.find((s) => s.id === workingSubjectId) ||
      activeSubject ||
      enrolledSubjects[0]
    );
  }, [enrolledSubjects, workingSubjectId, activeSubject]);

  // Active stages for current profile
  const availableStages = useMemo(() => {
    return getProfileStages(profile);
  }, [profile]);

  // Step 1: Selected Stages (default to 'ncert')
  const [selectedStageKeys, setSelectedStageKeys] = useState<string[]>(['ncert']);

  // Step 2: Selected Chapter IDs
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);

  // Matrix State: chapterId -> stageKey -> boolean
  const [matrixState, setMatrixState] = useState<Record<string, Record<string, boolean>>>({});

  // Get allowed chapters for the subject based on syllabus
  const allowedChapters = useMemo(() => {
    if (!currentSubject) return [];
    const allowedIds = profile.examSyllabus?.[currentSubject.id];
    const allChs: Chapter[] = [];
    currentSubject.groups.forEach((g) => {
      g.chapters.forEach((ch) => {
        if (!allowedIds || allowedIds.length === 0 || allowedIds.includes(ch.id)) {
          allChs.push(ch);
        }
      });
    });
    return allChs.sort((a, b) => a.no - b.no);
  }, [currentSubject, profile.examSyllabus]);

  // Initialize state when opening modal or changing subject
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      if (activeSubject && activeSubject.id !== 'all') {
        setWorkingSubjectId(activeSubject.id);
      } else if (enrolledSubjects.length > 0) {
        setWorkingSubjectId((prev) => prev || enrolledSubjects[0].id);
      }
      setSelectedStageKeys(['ncert']);
      setSelectedChapterIds([]);
    }
  }, [isOpen, activeSubject, enrolledSubjects]);

  // Populate Matrix State when currentSubject or allowedChapters change
  useEffect(() => {
    if (!currentSubject) return;
    const initialMatrix: Record<string, Record<string, boolean>> = {};
    allowedChapters.forEach((ch) => {
      initialMatrix[ch.id] = {};
      availableStages.forEach((st) => {
        const isDone = profile.progress[currentSubject.id]?.[ch.id]?.stages?.[st.key] === 'done';
        initialMatrix[ch.id][st.key] = isDone;
      });
    });
    setMatrixState(initialMatrix);
  }, [currentSubject, allowedChapters, availableStages, profile.progress, isOpen]);

  // Wizard Planned Updates
  const wizardPlannedUpdates = useMemo(() => {
    if (!currentSubject) return [];
    const updates: { subjectId: string; chapterId: string; stageKey: StageKey }[] = [];
    selectedChapterIds.forEach((chId) => {
      selectedStageKeys.forEach((stKey) => {
        updates.push({
          subjectId: currentSubject.id,
          chapterId: chId,
          stageKey: stKey as StageKey,
        });
      });
    });
    return updates;
  }, [selectedChapterIds, selectedStageKeys, currentSubject]);

  // Matrix Planned Updates (only changes that mark new completions)
  const matrixPlannedUpdates = useMemo(() => {
    if (!currentSubject) return [];
    const updates: { subjectId: string; chapterId: string; stageKey: StageKey }[] = [];
    allowedChapters.forEach((ch) => {
      availableStages.forEach((st) => {
        const isChecked = !!matrixState[ch.id]?.[st.key];
        const wasDone = profile.progress[currentSubject.id]?.[ch.id]?.stages?.[st.key] === 'done';
        if (isChecked && !wasDone) {
          updates.push({
            subjectId: currentSubject.id,
            chapterId: ch.id,
            stageKey: st.key as StageKey,
          });
        }
      });
    });
    return updates;
  }, [matrixState, allowedChapters, availableStages, currentSubject, profile.progress]);

  const activePlannedUpdates = viewMode === 'wizard' ? wizardPlannedUpdates : matrixPlannedUpdates;

  // Calculate points gained for new completions
  const estimatedPointsGained = useMemo(() => {
    if (!currentSubject) return 0;
    const count = activePlannedUpdates.filter(
      (u) => profile.progress[u.subjectId]?.[u.chapterId]?.stages?.[u.stageKey] !== 'done'
    ).length;
    return count * 25;
  }, [activePlannedUpdates, currentSubject, profile.progress]);

  if (!isOpen || !currentSubject) return null;

  // Toggle stage selection in Wizard
  const handleToggleStage = (key: string) => {
    setSelectedStageKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllStages = () => {
    if (selectedStageKeys.length === availableStages.length) {
      setSelectedStageKeys(['ncert']);
    } else {
      setSelectedStageKeys(availableStages.map((s) => s.key));
    }
  };

  // Toggle chapter selection in Wizard
  const handleToggleChapter = (chapterId: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    );
  };

  const handleSelectAllChapters = () => {
    if (selectedChapterIds.length === allowedChapters.length) {
      setSelectedChapterIds([]);
    } else {
      setSelectedChapterIds(allowedChapters.map((ch) => ch.id));
    }
  };

  const handleSelectPendingOnly = () => {
    const pendingIds = allowedChapters
      .filter((ch) => {
        const chProgress = profile.progress[currentSubject.id]?.[ch.id]?.stages || {};
        return selectedStageKeys.some((k) => chProgress[k] !== 'done');
      })
      .map((ch) => ch.id);
    setSelectedChapterIds(pendingIds);
  };

  const handleSelectRange = (count: number) => {
    const rangeIds = allowedChapters.slice(0, count).map((ch) => ch.id);
    setSelectedChapterIds(rangeIds);
  };

  // Matrix cell toggle
  const handleToggleMatrixCell = (chId: string, stageKey: string) => {
    setMatrixState((prev) => ({
      ...prev,
      [chId]: {
        ...(prev[chId] || {}),
        [stageKey]: !prev[chId]?.[stageKey],
      },
    }));
  };

  // Matrix toggle all for a stage column
  const handleToggleMatrixColumn = (stageKey: string) => {
    const allChecked = allowedChapters.every((ch) => !!matrixState[ch.id]?.[stageKey]);
    setMatrixState((prev) => {
      const next = { ...prev };
      allowedChapters.forEach((ch) => {
        next[ch.id] = {
          ...(next[ch.id] || {}),
          [stageKey]: !allChecked,
        };
      });
      return next;
    });
  };

  // Matrix toggle all for a chapter row
  const handleToggleMatrixRow = (chId: string) => {
    const allChecked = availableStages.every((st) => !!matrixState[chId]?.[st.key]);
    setMatrixState((prev) => ({
      ...prev,
      [chId]: availableStages.reduce(
        (acc, st) => ({ ...acc, [st.key]: !allChecked }),
        {} as Record<string, boolean>
      ),
    }));
  };

  const handleCommitWizard = () => {
    if (wizardPlannedUpdates.length === 0) {
      onClose();
      return;
    }
    onApplyBatch(wizardPlannedUpdates);
    onClose();
  };

  const handleCommitMatrix = () => {
    if (matrixPlannedUpdates.length === 0) {
      onClose();
      return;
    }
    onApplyBatch(matrixPlannedUpdates);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fast-catch-up-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between gap-3 bg-[var(--bg-elevated)]/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="fast-catch-up-title"
                  className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight"
                >
                  Fast Stage Catch-Up
                </h2>
                {viewMode === 'wizard' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold shrink-0">
                    Step {currentStep} of 3
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold shrink-0">
                    Quick Matrix Mode
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--text-muted)] leading-snug break-words block">
                {viewMode === 'wizard'
                  ? currentStep === 1
                    ? '1. Pick the stage(s) completed'
                    : currentStep === 2
                    ? '2. Select target chapters'
                    : '3. Review and apply batch checkmarks'
                  : 'Tap any stage cell to tick mark in seconds'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle: Step Wizard vs Quick Matrix */}
            <div className="bg-[var(--bg-elevated)] p-0.5 rounded-xl border border-[var(--border-color)] flex items-center">
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'wizard'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Step-by-step guided wizard"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Wizard</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Interactive multi-chapter checkbox matrix"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid Matrix</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SUBJECT SELECTOR BAR */}
        <div className="px-4 py-2 bg-[var(--bg-elevated)]/60 border-b border-[var(--border-color)] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-[var(--text-muted)]">
            <span>Subject:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {enrolledSubjects.map((sub) => {
              const isSelected = sub.id === workingSubjectId;
              const subName = getLocalizedSubjectName(sub.id, sub.name, language);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setWorkingSubjectId(sub.id);
                    setSelectedChapterIds([]);
                    if (onSelectSubject) onSelectSubject(sub.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-color)]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span>{subName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP PROGRESS INDICATOR (WIZARD MODE ONLY) */}
        {viewMode === 'wizard' && (
          <div className="px-4 py-2 bg-[var(--bg-elevated)]/40 border-b border-[var(--border-color)] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                currentStep >= 1 ? 'text-cyan-400' : 'text-[var(--text-muted)]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep >= 1 ? 'bg-cyan-500 text-slate-950' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                }`}
              >
                1
              </span>
              <span className="hidden sm:inline">Choose Stages</span>
            </button>
            <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-cyan-500' : 'bg-white/10'}`} />
            <button
              type="button"
              disabled={selectedStageKeys.length === 0}
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                currentStep >= 2 ? 'text-cyan-400' : 'text-[var(--text-muted)]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep >= 2 ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-[var(--text-muted)]'
                }`}
              >
                2
              </span>
              <span className="hidden sm:inline">Choose Chapters</span>
            </button>
            <div className={`flex-1 h-0.5 ${currentStep >= 3 ? 'bg-cyan-500' : 'bg-white/10'}`} />
            <button
              type="button"
              disabled={selectedChapterIds.length === 0}
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                currentStep === 3 ? 'text-cyan-400' : 'text-[var(--text-muted)]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 3 ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-[var(--text-muted)]'
                }`}
              >
                3
              </span>
              <span className="hidden sm:inline">Review &amp; Apply</span>
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* ===================== MODE 1: STEP WIZARD ===================== */}
          {viewMode === 'wizard' && (
            <>
              {/* STEP 1: SELECT STAGE(S) */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      Which study stage(s) did you complete?
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllStages}
                      className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
                    >
                      {selectedStageKeys.length === availableStages.length ? 'Reset to NCERT' : 'Select All Stages'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableStages.map((st) => {
                      const isSelected = selectedStageKeys.includes(st.key);
                      return (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => handleToggleStage(st.key)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 text-[var(--text-primary)] shadow-sm'
                              : 'bg-[var(--bg-elevated)] border-[var(--border-color)] hover:border-slate-500 text-[var(--text-secondary)]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                              isSelected
                                ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                                : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-base">{st.emoji}</span>
                              <span className="text-xs sm:text-sm font-black break-words leading-tight">{st.label}</span>
                            </div>
                            <span className="text-[11px] text-[var(--text-muted)] break-words mt-0.5 block leading-snug">
                              {st.description || st.shortLabel}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: CHOOSE TARGET CHAPTERS */}
              {currentStep === 2 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      Select chapters to mark done for{' '}
                      <span className="text-cyan-300">
                        {selectedStageKeys
                          .map((k) => availableStages.find((s) => s.key === k)?.shortLabel || k)
                          .join(' + ')}
                      </span>
                      :
                    </span>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={handleSelectAllChapters}
                        className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-color)]/40 border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                      >
                        {selectedChapterIds.length === allowedChapters.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectPendingOnly}
                        className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer"
                      >
                        Pending Only
                      </button>
                    </div>
                  </div>

                  {/* Quick Range Shortcuts */}
                  {allowedChapters.length >= 3 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-[var(--text-muted)]">
                      <span>Quick Range:</span>
                      {[3, 5, 8, 10, 15].map((num) => {
                        if (num > allowedChapters.length) return null;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleSelectRange(num)}
                            className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-cyan-400 text-cyan-300 font-mono text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Ch 1–{num}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Chapters Checklist */}
                  <div className="max-h-60 sm:max-h-72 overflow-y-auto space-y-1.5 pr-1 border border-[var(--border-color)] rounded-xl p-2 bg-[var(--bg-elevated)]/60">
                    {allowedChapters.map((ch) => {
                      const isChecked = selectedChapterIds.includes(ch.id);
                      const chProgress = profile.progress[currentSubject.id]?.[ch.id]?.stages || {};

                      const doneSelectedCount = selectedStageKeys.filter(
                        (k) => chProgress[k] === 'done'
                      ).length;
                      const allSelectedDone = doneSelectedCount === selectedStageKeys.length;

                      return (
                        <div
                          key={ch.id}
                          onClick={() => handleToggleChapter(ch.id)}
                          className={`flex items-start sm:items-center justify-between p-2.5 rounded-xl border text-xs gap-2 transition-colors cursor-pointer select-none ${
                            isChecked
                              ? 'bg-cyan-500/15 border-cyan-400 text-[var(--text-primary)] font-bold'
                              : 'bg-[var(--bg-card)]/80 border-transparent hover:border-[var(--border-color)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border mt-0.5 sm:mt-0 ${
                                isChecked
                                  ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                                  : 'border-[var(--border-color)] bg-[var(--bg-elevated)]'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="font-mono text-[11px] text-cyan-300 shrink-0 font-bold mt-0.5 sm:mt-0">
                              C{ch.no}
                            </span>
                            <span className="break-words leading-snug flex-1 min-w-0 text-left font-medium text-xs">
                              {getLocalizedChapterName(ch.id, ch.name, language, currentSubject.id)}
                            </span>
                          </div>

                          <div className="shrink-0 ml-1 self-start sm:self-center">
                            {allSelectedDone ? (
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                <span>Already Done</span>
                                <Check className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                {doneSelectedCount}/{selectedStageKeys.length} Done
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & COMMIT */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 via-[var(--bg-elevated)] to-emerald-500/10 border border-cyan-500/35 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Summary of Batch Changes
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        +{estimatedPointsGained} Focus Points
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-[var(--text-primary)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Target Subject:</span>
                        <span className="font-bold flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: currentSubject.color }}
                          />
                          {currentSubject.name} (Code {currentSubject.code})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Stage(s) to Mark Done:</span>
                        <span className="font-bold text-cyan-300">
                          {selectedStageKeys
                            .map((k) => availableStages.find((s) => s.key === k)?.label || k)
                            .join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Selected Chapters:</span>
                        <span className="font-bold text-emerald-300 font-mono">
                          {selectedChapterIds.length} Chapters
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Total Stage Updates:</span>
                        <span className="font-black text-cyan-400 font-mono text-sm">
                          {wizardPlannedUpdates.length} updates
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===================== MODE 2: FAST MATRIX GRID ===================== */}
          {viewMode === 'matrix' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[var(--text-secondary)]">
                  Tap any stage badge to toggle it directly:
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  +{estimatedPointsGained} XP ({matrixPlannedUpdates.length} updates)
                </span>
              </div>

              {/* Responsive Matrix Table */}
              <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-card)]">
                <div className="max-h-72 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/90 sticky top-0 z-10">
                        <th className="p-2.5 font-bold text-[var(--text-primary)] min-w-[160px] sm:min-w-[200px]">
                          Chapter
                        </th>
                        {availableStages.map((st) => (
                          <th key={st.key} className="p-2 text-center min-w-[56px]">
                            <button
                              type="button"
                              onClick={() => handleToggleMatrixColumn(st.key)}
                              className="text-[11px] font-bold text-cyan-300 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                              title={`Toggle all ${st.shortLabel} for this subject`}
                            >
                              <span>{st.emoji}</span>
                              <span className="leading-tight">{st.shortLabel}</span>
                            </button>
                          </th>
                        ))}
                        <th className="p-2 text-center text-[10px] text-[var(--text-muted)] font-mono min-w-[48px]">
                          Row
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {allowedChapters.map((ch) => {
                        const rowProg = matrixState[ch.id] || {};
                        const allRowDone = availableStages.every((st) => !!rowProg[st.key]);

                        return (
                          <tr
                            key={ch.id}
                            className="hover:bg-[var(--bg-elevated)]/70 transition-colors"
                          >
                            <td className="p-2.5 font-medium text-[var(--text-primary)] min-w-[160px] sm:min-w-[200px] whitespace-normal break-words leading-snug">
                              <span className="font-mono text-cyan-400 font-bold mr-1.5 shrink-0">
                                C{ch.no}
                              </span>
                              <span className="break-words">
                                {getLocalizedChapterName(ch.id, ch.name, language, currentSubject.id)}
                              </span>
                            </td>

                            {availableStages.map((st) => {
                              const isChecked = !!rowProg[st.key];
                              const wasOriginallyDone =
                                profile.progress[currentSubject.id]?.[ch.id]?.stages?.[st.key] === 'done';

                              return (
                                <td key={st.key} className="p-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMatrixCell(ch.id, st.key)}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center mx-auto transition-all cursor-pointer select-none ${
                                      isChecked
                                        ? wasOriginallyDone
                                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                          : 'bg-cyan-500 border-cyan-400 text-slate-950 font-black shadow-sm ring-2 ring-cyan-400/40'
                                        : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-slate-500'
                                    }`}
                                    title={`${ch.name} - ${st.label}: ${isChecked ? 'Completed' : 'Pending'}`}
                                  >
                                    {isChecked ? (
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    ) : (
                                      <span className="text-[10px] opacity-40">{st.shortLabel[0]}</span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}

                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleMatrixRow(ch.id)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-color)]/40 border border-[var(--border-color)] text-[var(--text-secondary)] font-bold cursor-pointer"
                                title="Toggle all stages for this chapter"
                              >
                                {allRowDone ? 'Reset' : 'All'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER CONTROLS */}
        <div className="p-3 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)]/70 flex items-center justify-between gap-2">
          {viewMode === 'wizard' ? (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              )}

              {currentStep === 1 && (
                <button
                  type="button"
                  disabled={selectedStageKeys.length === 0}
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <span>Next: Choose Chapters</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  disabled={selectedChapterIds.length === 0}
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <span>Next: Review ({selectedChapterIds.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={handleCommitWizard}
                  disabled={selectedChapterIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:opacity-95 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Apply Fast Catch-Up</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCommitMatrix}
                disabled={matrixPlannedUpdates.length === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:opacity-95 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Apply Changes ({matrixPlannedUpdates.length})</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
