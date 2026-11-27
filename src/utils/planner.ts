import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import { getProfileStages } from '../data/stagesCatalog';
import { Profile, SubjectPaceCalculation, StageKey } from '../types/tracker';

export function parseDDMMYYYY(str: string): Date | null {
  if (!str) return null;
  const parts = str.trim().split(/[/.-]/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const date = new Date(year, month, day, 23, 59, 59);
  return isNaN(date.getTime()) ? null : date;
}

export function formatToDDMMYYYY(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function isoToDDMMYYYY(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function ddmmyyyyToIso(ddmmyyyy: string): string {
  if (!ddmmyyyy) return '';
  const parts = ddmmyyyy.trim().split(/[/.-]/);
  if (parts.length !== 3) return '';
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2];
  return `${year}-${month}-${day}`;
}

/**
 * Calculates days remaining until the target first paper date.
 * The study day cycle strictly rolls over daily at 5:00 AM morning.
 * For students studying late into the night, the current day count remains steady
 * until 5:00 AM sharp, when the new study cycle begins.
 */
export function getDaysUntilFirstPaper(firstPaperDateStr: string, customNow?: Date): number {
  if (!firstPaperDateStr) return 0;
  const parts = firstPaperDateStr.trim().split(/[/.-]/);
  if (parts.length !== 3) return 0;
  const targetDay = parseInt(parts[0], 10);
  const targetMonth = parseInt(parts[1], 10) - 1;
  const targetYear = parseInt(parts[2], 10);
  if (isNaN(targetDay) || isNaN(targetMonth) || isNaN(targetYear)) return 0;

  const now = customNow || new Date();

  // Current active 5:00 AM study milestone:
  // If current time is earlier than 5:00 AM today (e.g. 02:30 AM),
  // the student's study day belongs to yesterday's cycle starting at yesterday 05:00 AM.
  // Once 5:00 AM arrives, today's cycle begins.
  const current5am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0);
  if (now.getTime() < current5am.getTime()) {
    current5am.setDate(current5am.getDate() - 1);
  }

  // Target exam date 5:00 AM milestone:
  const target5am = new Date(targetYear, targetMonth, targetDay, 5, 0, 0, 0);

  const diffMs = target5am.getTime() - current5am.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Calculates milliseconds until the next 5:00 AM rollover
 */
export function getMsUntilNext5am(): number {
  const now = new Date();
  const next5am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0);
  if (now.getTime() >= next5am.getTime()) {
    next5am.setDate(next5am.getDate() + 1);
  }
  return next5am.getTime() - now.getTime();
}


export function getSubjectPaceCalculations(profile: Profile): SubjectPaceCalculation[] {
  const daysRemaining = getDaysUntilFirstPaper(profile.firstPaperDate);
  const activeStages = getProfileStages(profile);
  const totalStagesPerChapter = activeStages.length;

  const enrolledSubjectIds = Array.isArray(profile.selectedSubjectIds)
    ? profile.selectedSubjectIds
    : CLASS_10_SUBJECTS.map((s) => s.id);

  return CLASS_10_SUBJECTS
    .filter((subject) => enrolledSubjectIds.includes(subject.id))
    .map((subject) => {
    const includedChapterIds = profile.examSyllabus[subject.id] || [];
    const subjectProgress = profile.progress[subject.id] || {};

    let totalChaptersInSyllabus = 0;
    let completedChapters = 0;
    let inProgressChapters = 0;
    let completedStages = 0;

    subject.groups.forEach((group) => {
      group.chapters.forEach((chapter) => {
        if (includedChapterIds.includes(chapter.id)) {
          totalChaptersInSyllabus++;
          const chProg = subjectProgress[chapter.id];
          if (chProg) {
            let chDoneCount = 0;
            let chHasStarted = false;

            activeStages.forEach((stage) => {
              const status = chProg.stages[stage.key];
              if (status === 'done') {
                chDoneCount++;
                completedStages++;
              } else if (status === 'in_progress') {
                chHasStarted = true;
              }
            });

            if (chDoneCount === totalStagesPerChapter || chProg.completed) {
              completedChapters++;
            } else if (chDoneCount > 0 || chHasStarted) {
              inProgressChapters++;
            }
          }
        }
      });
    });

    const totalStages = totalChaptersInSyllabus * totalStagesPerChapter;
    const stagesRemaining = Math.max(0, totalStages - completedStages);
    const percentComplete = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    const stagesPerDayNeeded = daysRemaining > 0 
      ? Number((stagesRemaining / daysRemaining).toFixed(2)) 
      : stagesRemaining;

    let status: SubjectPaceCalculation['status'] = 'on-track';
    if (percentComplete === 100) {
      status = 'completed';
    } else if (stagesPerDayNeeded > 3) {
      status = 'urgent';
    } else if (stagesPerDayNeeded > 1.5) {
      status = 'needs-attention';
    }

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalChaptersInSyllabus,
      completedChapters,
      inProgressChapters,
      totalStages,
      completedStages,
      percentComplete,
      stagesRemaining,
      daysRemaining,
      stagesPerDayNeeded,
      status,
    };
  });
}

export function getOverallStats(profile: Profile) {
  const paces = getSubjectPaceCalculations(profile);
  const totalStages = paces.reduce((sum, p) => sum + p.totalStages, 0);
  const completedStages = paces.reduce((sum, p) => sum + p.completedStages, 0);
  const stagesRemaining = paces.reduce((sum, p) => sum + p.stagesRemaining, 0);
  const totalChapters = paces.reduce((sum, p) => sum + p.totalChaptersInSyllabus, 0);
  const completedChapters = paces.reduce((sum, p) => sum + p.completedChapters, 0);
  const overallPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  const daysRemaining = getDaysUntilFirstPaper(profile.firstPaperDate);
  const dailyTotalStageGoal = daysRemaining > 0 
    ? Number((stagesRemaining / daysRemaining).toFixed(1)) 
    : stagesRemaining;

  return {
    paces,
    totalStages,
    completedStages,
    stagesRemaining,
    totalChapters,
    completedChapters,
    overallPercent,
    daysRemaining,
    dailyTotalStageGoal,
  };
}

export interface FocusTargetItem {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  groupId: string;
  groupName: string;
  chapterId: string;
  chapterNo: number;
  chapterName: string;
  nextStage: StageKey;
  stageLabel: string;
  highYield?: boolean;
  pyqCount?: number;
  cbqCount?: number;
  completedStagesCount: number;
  totalStagesCount: number;
}

export function getTodaysFocus(profile: Profile, limit = 6): FocusTargetItem[] {
  const enrolledSubjectIds = Array.isArray(profile.selectedSubjectIds)
    ? profile.selectedSubjectIds
    : CLASS_10_SUBJECTS.map((s) => s.id);

  const primaryPerSubject: FocusTargetItem[] = [];
  const secondaryItems: FocusTargetItem[] = [];

  for (const subject of CLASS_10_SUBJECTS) {
    if (!enrolledSubjectIds.includes(subject.id)) continue;
    const includedChapters = profile.examSyllabus[subject.id] || [];
    const subProg = profile.progress[subject.id] || {};

    const subjectCandidates: FocusTargetItem[] = [];

    const activeStages = getProfileStages(profile);
    for (const group of subject.groups) {
      for (const chapter of group.chapters) {
        if (!includedChapters.includes(chapter.id)) continue;
        const prog = subProg[chapter.id];

        let completedStagesCount = 0;
        let firstIncompleteStage: (typeof activeStages)[number] | null = null;

        for (const stage of activeStages) {
          const status = prog?.stages?.[stage.key] || 'none';
          if (status === 'done') {
            completedStagesCount++;
          } else if (!firstIncompleteStage) {
            firstIncompleteStage = stage;
          }
        }

        if (firstIncompleteStage) {
          subjectCandidates.push({
            subjectId: subject.id,
            subjectName: subject.name,
            subjectCode: subject.code,
            groupId: group.id,
            groupName: group.name || subject.description || 'Core Syllabus Section',
            chapterId: chapter.id,
            chapterNo: chapter.no,
            chapterName: chapter.name,
            nextStage: firstIncompleteStage.key,
            stageLabel: firstIncompleteStage.label,
            highYield: chapter.highYield,
            pyqCount: chapter.pyqCount,
            cbqCount: chapter.cbqCount,
            completedStagesCount,
            totalStagesCount: activeStages.length,
          });
        }
      }
    }

    if (subjectCandidates.length > 0) {
      // Prioritize chapters already started (completedStagesCount > 0), then high-yield chapters
      subjectCandidates.sort((a, b) => {
        const aStarted = a.completedStagesCount > 0 ? 1 : 0;
        const bStarted = b.completedStagesCount > 0 ? 1 : 0;
        if (bStarted !== aStarted) return bStarted - aStarted;
        const aHy = a.highYield ? 1 : 0;
        const bHy = b.highYield ? 1 : 0;
        if (bHy !== aHy) return bHy - aHy;
        return a.chapterNo - b.chapterNo;
      });

      primaryPerSubject.push(subjectCandidates[0]);
      for (let i = 1; i < subjectCandidates.length; i++) {
        secondaryItems.push(subjectCandidates[i]);
      }
    }
  }

  const combined = [...primaryPerSubject, ...secondaryItems];
  return combined.slice(0, limit);
}

