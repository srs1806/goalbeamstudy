import { TrackerState } from '../types/tracker';
import { saveTrackerState, getLocalStudyDateKey } from './storage';
import { parseDDMMYYYY } from './planner';

const AUTO_RESET_HISTORY_KEY = 'topr_auto_reset_history_shahid';

/**
 * Returns current CBSE Academic Year dynamically.
 * e.g., Before March 25, 2027: '2026-27'
 * After March 25, 2027: '2027-28', etc.
 */
export function getDynamicAcademicYear(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed: 0=Jan, 1=Feb, 2=Mar, 3=Apr
  const day = referenceDate.getDate();

  // If in April or later in the year (e.g. Sept 2026), session is 2026-27
  if (month >= 3) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }

  // If Jan or Feb, exams are about to happen or in progress, session is (year-1)-year
  if (month < 2) {
    return `${year - 1}-${String(year).slice(-2)}`;
  }

  // If in March: CBSE exams usually end around March 21-25.
  // After March 25, exams are finished, so roll over to next session (e.g., 2027-28)
  if (month === 2 && day > 25) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }

  return `${year - 1}-${String(year).slice(-2)}`;
}

/**
 * Calculates the exam conclusion date.
 * If first paper is on 15/02/YEAR, CBSE Class 10 exams typically conclude 30 days later (around 17/03/YEAR).
 */
export function getExamConclusionDate(firstPaperDateStr: string): Date {
  const parsed = parseDDMMYYYY(firstPaperDateStr);
  if (!parsed) {
    // Fallback: March 21 of the current dynamic year
    const now = new Date();
    return new Date(now.getFullYear(), 2, 21, 23, 59, 59);
  }

  // Add 30 days from first paper date
  const conclusion = new Date(parsed.getTime());
  conclusion.setDate(conclusion.getDate() + 30);
  conclusion.setHours(23, 59, 59, 999);
  return conclusion;
}

/**
 * Checks if the board exams are over and if 5 days have elapsed since the final exam date.
 * If yes, automatically rolls over the academic year and resets the monitor for the fresh batch!
 */
export function checkExamOverAndAutoReset(
  state: TrackerState,
  forceSimulate: boolean = false
): {
  state: TrackerState;
  hasAutoReset: boolean;
  message: string;
} {
  const now = new Date();
  const activeProfile = state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];

  if (!activeProfile) {
    return { state, hasAutoReset: false, message: '' };
  }

  const examEndDate = getExamConclusionDate(activeProfile.firstPaperDate);
  // 5 days in milliseconds
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
  const resetThresholdTime = examEndDate.getTime() + FIVE_DAYS_MS;

  const isEligibleForAutoReset = forceSimulate || now.getTime() >= resetThresholdTime;

  if (!isEligibleForAutoReset) {
    return { state, hasAutoReset: false, message: '' };
  }

  // Check if we already auto-reset for this cycle
  const resetHistory = localStorage.getItem(AUTO_RESET_HISTORY_KEY) || '';
  const currentAcademicYear = getDynamicAcademicYear(now);
  const cycleTag = `reset_done_${currentAcademicYear}_${activeProfile.firstPaperDate}`;

  if (!forceSimulate && resetHistory.includes(cycleTag)) {
    return { state, hasAutoReset: false, message: '' };
  }

  // Perform Automatic Academic Year Rollover and Monitor Reset
  // Calculate next academic year
  const nextYearStart = now.getFullYear() + (now.getMonth() < 3 ? 0 : 1);
  const nextPaperDate = `15/02/${nextYearStart + 1}`;
  const newAcademicYear = `${nextYearStart}-${String(nextYearStart + 1).slice(-2)}`;

  // Reset chapter stages to 'none' while preserving user's syllabus selection and profile name
  const updatedProfiles = state.profiles.map((p) => {
    const freshProgress: Record<string, Record<string, any>> = {};
    Object.keys(p.progress).forEach((subjectId) => {
      freshProgress[subjectId] = {};
      Object.keys(p.progress[subjectId] || {}).forEach((chId) => {
        freshProgress[subjectId][chId] = {
          stages: {
            theory: 'none',
            ncert: 'none',
            exemplar: 'none',
            pyq: 'none',
            cbq: 'none',
            mindmap: 'none',
            revision: 'none',
          },
          completed: false,
          notes: '',
        };
      });
    });

    return {
      ...p,
      firstPaperDate: nextPaperDate,
      progress: freshProgress,
      streak: { count: 0, lastActiveDate: '' },
    };
  });

  const updatedState: TrackerState = {
    ...state,
    profiles: updatedProfiles,
    lastSyncedDate: `Session ${newAcademicYear} (Auto-Rollover)`,
  };

  saveTrackerState(updatedState);
  localStorage.setItem(AUTO_RESET_HISTORY_KEY, `${resetHistory};${cycleTag}`);

  return {
    state: updatedState,
    hasAutoReset: true,
    message: `🎉 Academic Year Auto-Rollover: Board exams for the past session have finished and 5 days have passed. Your monitor has been automatically reset for Session ${newAcademicYear}! Target date updated to ${nextPaperDate}.`,
  };
}
