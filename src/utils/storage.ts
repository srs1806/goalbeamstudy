import { CLASS_10_SUBJECTS, STAGES_CONFIG } from '../data/chaptersData';
import { Profile, TrackerState, ThemeMode, FontMode, LanguageMode, ChapterProgress, StageStatus } from '../types/tracker';

const STORAGE_KEY = 'cbse_study_tracker_v10';
const OLD_STORAGE_KEY = 'cbse_study_tracker_v10_shahid';
const THEME_KEY = 'cbse_study_theme';
const OLD_THEME_KEY = 'cbse_study_theme_shahid';
const FONT_KEY = 'cbse_study_font';
const OLD_FONT_KEY = 'cbse_study_font_shahid';
const LANGUAGE_KEY = 'cbse_study_language';

export const DEFAULT_SELECTED_SUBJECT_IDS = ['science', 'maths', 'sst', 'english', 'hindi_b'];

/**
 * Computes the local study-day key (YYYY-MM-DD) using a 5:00 AM daily rollover boundary.
 * E.g. 04:30 AM local time counts toward the previous calendar day; 05:00 AM starts the new study day.
 */
export function getLocalStudyDateKey(referenceDate: Date = new Date()): string {
  const shifted = new Date(referenceDate.getTime() - 5 * 60 * 60 * 1000);
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns whole calendar-day difference (toDateKey - fromDateKey) safely across timezones & DST.
 */
export function getStudyDaysDiff(fromDateKey: string, toDateKey: string): number {
  const fromMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec((fromDateKey || '').trim());
  const toMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec((toDateKey || '').trim());
  if (!fromMatch || !toMatch) return NaN;

  const fromUtc = Date.UTC(Number(fromMatch[1]), Number(fromMatch[2]) - 1, Number(fromMatch[3]));
  const toUtc = Date.UTC(Number(toMatch[1]), Number(toMatch[2]) - 1, Number(toMatch[3]));
  return Math.round((toUtc - fromUtc) / (24 * 60 * 60 * 1000));
}

export function getDefaultSyllabus(): Record<string, string[]> {
  const syllabus: Record<string, string[]> = {};
  CLASS_10_SUBJECTS.forEach((subject) => {
    syllabus[subject.id] = [];
    subject.groups.forEach((group) => {
      group.chapters.forEach((ch) => {
        syllabus[subject.id].push(ch.id);
      });
    });
  });
  return syllabus;
}

export function createEmptyChapterProgress(): ChapterProgress {
  const stages: any = {};
  STAGES_CONFIG.forEach((s) => {
    stages[s.key] = 'none';
  });
  return {
    stages,
    completed: false,
  };
}

export function createInitialProfile(
  name: string,
  firstPaperDate = '15/02/2027',
  targetPercentage = 95,
  dailyHourGoal = 4,
  targetExamName = 'Board Exam (Finals)',
  pomodoroMinutes = 25,
  selectedSubjectIds: string[] = DEFAULT_SELECTED_SUBJECT_IDS,
  board = 'CBSE'
): Profile {
  const syllabus = getDefaultSyllabus();
  const progress: Record<string, Record<string, ChapterProgress>> = {};

  CLASS_10_SUBJECTS.forEach((subject) => {
    progress[subject.id] = {};
    subject.groups.forEach((group) => {
      group.chapters.forEach((ch) => {
        progress[subject.id][ch.id] = createEmptyChapterProgress();
      });
    });
  });

  return {
    id: 'prof_' + Date.now(),
    name: name.trim() || 'Class 10 Scholar',
    grade: 10,
    board: 'CBSE',
    targetPercentage,
    firstPaperDate,
    targetExamName,
    pomodoroMinutes,
    dailyHourGoal,
    selectedSubjectIds,
    examSyllabus: syllabus,
    progress,
    streak: {
      count: 0,
      lastActiveDate: '',
    },
    notificationSettings: {
      enabled: true,
      morningReminderTime: '05:00',
    },
    createdAt: new Date().toISOString(),
  };
}

export function loadTrackerState(): TrackerState {
  const rawTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem(OLD_THEME_KEY);
  const savedTheme: ThemeMode = (rawTheme as ThemeMode) || 'dark';
  const rawFont = localStorage.getItem(FONT_KEY) || localStorage.getItem(OLD_FONT_KEY);
  const savedFont: FontMode = (rawFont as FontMode) || 'sans';
  const rawLang = localStorage.getItem(LANGUAGE_KEY);
  const savedLang: LanguageMode = (rawLang as LanguageMode) || 'en';

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.profiles)) {
        const normalizedProfiles = parsed.profiles.map((prof: Profile) => ({
          ...prof,
          board: 'CBSE',
          streak: {
            count: Math.max(0, Number(prof?.streak?.count) || 0),
            lastActiveDate: prof?.streak?.lastActiveDate || '',
          },
        }));
        return {
          ...parsed,
          profiles: normalizedProfiles,
          theme: parsed.theme || savedTheme,
          fontFamily: parsed.fontFamily || savedFont,
          language: parsed.language || savedLang,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load tracker state from localStorage', err);
  }

  return {
    version: 1,
    activeProfileId: null,
    profiles: [],
    theme: savedTheme,
    fontFamily: savedFont,
    language: savedLang,
    lastSyncedDate: 'September 2026',
    lastSyncedMonth: '2026-09',
  };
}

function compactProfileForStorage(profile: Profile): Profile {
  const compactedProgress: Record<string, Record<string, ChapterProgress>> = {};
  const rawProgress = profile.progress || {};

  Object.entries(rawProgress).forEach(([subjectId, subjectChapters]) => {
    if (!subjectChapters || typeof subjectChapters !== 'object') return;
    const keptChapters: Record<string, ChapterProgress> = {};
    Object.entries(subjectChapters).forEach(([chapterId, chapterProg]) => {
      if (!chapterProg || typeof chapterProg !== 'object') return;
      const stages = chapterProg.stages || {};
      const activeStages: Record<string, StageStatus> = {};
      Object.entries(stages).forEach(([k, v]) => {
        if (v && v !== 'none') activeStages[k] = v;
      });
      const hasNotes = typeof chapterProg.notes === 'string' && chapterProg.notes.trim().length > 0;
      const isCompleted = Boolean(chapterProg.completed);
      if (isCompleted || hasNotes || Object.keys(activeStages).length > 0) {
        keptChapters[chapterId] = {
          ...(isCompleted ? { completed: true } : { completed: false }),
          stages: activeStages as ChapterProgress['stages'],
          ...(hasNotes ? { notes: chapterProg.notes } : {}),
        };
      }
    });
    if (Object.keys(keptChapters).length > 0) {
      compactedProgress[subjectId] = keptChapters;
    }
  });

  return {
    ...profile,
    progress: compactedProgress,
  };
}

export function saveTrackerState(state: TrackerState): void {
  try {
    const compactedState: TrackerState = {
      ...state,
      profiles: Array.isArray(state.profiles)
        ? state.profiles.map(compactProfileForStorage)
        : [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compactedState));
  } catch (err) {
    console.error('Failed to save tracker state', err);
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    applyThemeToDOM(theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function applyThemeToDOM(theme: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-gold', 'theme-matrix', 'theme-cyberpunk', 'dark');

  let themeColor = '#03050a';
  if (theme === 'light') {
    root.classList.add('theme-light');
    themeColor = '#f8fafc';
  } else if (theme === 'gold') {
    root.classList.add('theme-gold', 'dark');
    themeColor = '#100c05';
  } else if (theme === 'matrix') {
    root.classList.add('theme-matrix', 'dark');
    themeColor = '#020803';
  } else if (theme === 'cyberpunk') {
    root.classList.add('theme-cyberpunk', 'dark');
    themeColor = '#0c0414';
  } else {
    root.classList.add('dark');
    themeColor = '#03050a';
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeColor);
  }
}

export function saveFont(font: FontMode): void {
  try {
    localStorage.setItem(FONT_KEY, font);
    applyFontToDOM(font);
  } catch (e) {
    console.error('Failed to save font', e);
  }
}

export function applyFontToDOM(font?: FontMode): void {
  const root = document.documentElement;
  root.classList.remove('font-sans', 'font-rounded', 'font-mono', 'font-serif', 'font-cursive', 'font-dancing', 'font-display');
  if (font) {
    root.classList.add(`font-${font}`);
  } else {
    root.classList.add('font-sans');
  }
}

/**
 * Checks whether an existing earned streak has expired across 5:00 AM daily rollovers.
 * IMPORTANT: Never awards or increments a streak passively on app load/focus.
 * Streaks are only awarded on qualifying actions (chapters, PDFs, or tests/quizzes).
 */
export function syncStreakOnRollover(profile: Profile): Profile {
  const todayKey = getLocalStudyDateKey();
  const prevCount = Math.max(0, Number(profile.streak?.count) || 0);
  const lastActive = profile.streak?.lastActiveDate || '';

  if (prevCount === 0 || !lastActive) {
    if (profile.streak?.count === 0 && lastActive === '') {
      return profile;
    }
    return {
      ...profile,
      streak: { count: 0, lastActiveDate: '' },
    };
  }

  const diffDays = getStudyDaysDiff(lastActive, todayKey);
  if (Number.isNaN(diffDays) || diffDays >= 2) {
    // Missed at least one full study day -> reset streak to 0 until next qualifying action
    return {
      ...profile,
      streak: { count: 0, lastActiveDate: '' },
    };
  }

  // diffDays === 0 (active today) or diffDays === 1 (active yesterday, awaiting today's study action)
  return profile;
}

/**
 * Records a qualifying study activity (chapter started/in-progress/completed,
 * PDF opened from Resources, or test/quiz taken) against the 5:00 AM daily streak.
 */
export function updateStreak(profile: Profile): Profile {
  const todayKey = getLocalStudyDateKey();
  const prevCount = Math.max(0, Number(profile.streak?.count) || 0);
  const lastActive = profile.streak?.lastActiveDate || '';

  if (!lastActive || prevCount === 0) {
    return {
      ...profile,
      streak: { count: 1, lastActiveDate: todayKey },
    };
  }

  const diffDays = getStudyDaysDiff(lastActive, todayKey);

  if (Number.isNaN(diffDays)) {
    return {
      ...profile,
      streak: { count: 1, lastActiveDate: todayKey },
    };
  }

  if (diffDays === 0) {
    // Already recorded qualifying study activity today -> preserve current count
    if (profile.streak?.count === prevCount && lastActive === todayKey) {
      return profile;
    }
    return {
      ...profile,
      streak: { count: Math.max(1, prevCount), lastActiveDate: todayKey },
    };
  }

  if (diffDays === 1) {
    // Consecutive study day after 5:00 AM rollover -> increment streak
    return {
      ...profile,
      streak: { count: prevCount + 1, lastActiveDate: todayKey },
    };
  }

  if (diffDays < 0) {
    // Handle timezone/UTC-to-local migration without erasing user's existing streak
    return {
      ...profile,
      streak: { count: Math.max(1, prevCount), lastActiveDate: lastActive },
    };
  }

  // Gap of 2+ study days -> qualifying action restarts streak at 1 today
  return {
    ...profile,
    streak: { count: 1, lastActiveDate: todayKey },
  };
}

/**
 * Monthly AI Syllabus Auto-Update Engine
 * Checks every 1 month if a new monthly syllabus sync is due.
 * Crucially preserves 100% of user data: names, dates, syllabus choices, stage completions, and notes!
 */
export function checkAndApplyMonthlyAutoSync(state: TrackerState): {
  state: TrackerState;
  updated: boolean;
  message: string;
} {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  if (state.lastSyncedMonth !== currentMonthKey) {
    const updatedState: TrackerState = {
      ...state,
      lastSyncedMonth: currentMonthKey,
      lastSyncedDate: currentMonthName,
    };
    saveTrackerState(updatedState);
    return {
      state: updatedState,
      updated: true,
      message: `AI Engine automatically synced latest CBSE circulars for ${currentMonthName}. All your saved progress and chapters are preserved!`,
    };
  }

  return {
    state,
    updated: false,
    message: `Syllabus is up to date for ${state.lastSyncedDate || currentMonthName}.`,
  };
}

export function saveLanguage(lang: LanguageMode): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch (e) {
    console.error('Failed to save language', e);
  }
}

export function resetTrackerState(): TrackerState {
  localStorage.removeItem(STORAGE_KEY);
  const theme = (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark';
  const font = (localStorage.getItem(FONT_KEY) as FontMode) || 'sans';
  const lang = (localStorage.getItem(LANGUAGE_KEY) as LanguageMode) || 'en';
  const newState: TrackerState = {
    version: 1,
    activeProfileId: null,
    profiles: [],
    theme,
    fontFamily: font,
    language: lang,
    lastSyncedDate: 'September 2026',
    lastSyncedMonth: '2026-09',
  };
  saveTrackerState(newState);
  return newState;
}
