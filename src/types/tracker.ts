export type StageKey = string;

export type StageStatus = 'none' | 'in_progress' | 'done';

export interface StageDefinition {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  emoji?: string;
  isCompulsory?: boolean;
}

export interface Chapter {
  id: string;
  no: number;
  name: string;
  subTitle?: string;
  highYield?: boolean;
  pyqCount?: number;
  cbqCount?: number;
  importantTopics?: string[];
}

export interface ChapterGroup {
  id: string;
  name: string | null;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  bookNames?: string[];
  groups: ChapterGroup[];
  color: string;
  accentBg: string;
}

export interface ChapterProgress {
  stages: Record<StageKey, StageStatus>;
  notes?: string;
  lastUpdated?: string;
  completed?: boolean;
}

export const EXAM_NAME_OPTIONS = [
  'Board Exam (Finals)',
  'Pre-Board 1',
  'Pre-Board 2',
  'Pre-Board 3',
  'Pre-Board 4',
  'Unit Test 1',
  'Unit Test 2',
  'Unit Test 3',
  'Unit Test 4',
  'Unit Test 5',
  'Unit Test 6',
] as const;

export type ExamNameType = typeof EXAM_NAME_OPTIONS[number];

export type MorningSoundType =
  | 'zenith-symphony'
  | 'himalayan-chimes'
  | 'marimba-sunrise'
  | 'cyber-awakening';

export interface Profile {
  id: string;
  name: string;
  grade: 10; // strictly Class 10th
  board?: string; // Strictly CBSE Class 10 ('CBSE')
  targetPercentage: number;
  firstPaperDate: string; // DD/MM/YYYY format
  targetExamName?: string; // e.g., 'Board Exam (Finals)', 'Pre-Board 1', 'Unit Test 1', etc.
  pomodoroMinutes?: number; // 5 to 60 minutes
  dailyHourGoal: number;
  selectedSubjectIds?: string[]; // array of subject IDs student is enrolled in
  selectedStages?: StageDefinition[]; // customizable study stages / references (min 4, NCERT compulsory)
  examSyllabus: Record<string, string[]>; // subjectId -> array of chapter IDs included
  progress: Record<string, Record<string, ChapterProgress>>; // subjectId -> chapterId -> ChapterProgress
  streak: {
    count: number;
    lastActiveDate: string;
  };
  xp?: number; // Total Experience Points (XP) earned
  focusPoints?: number; // 10 points per focus minute
  totalFocusMinutes?: number; // Total focused study minutes
  treesGrown?: number; // Number of successfully grown 3D focus trees
  examDateSheet?: Record<string, string>; // subjectId -> YYYY-MM-DD
  dailyTimetable?: TimetableSlot[];
  flashcardProgress?: Record<string, FlashcardProgress>;
  customFlashcards?: FlashcardItem[];
  quizHistory?: QuizAttempt[];
  notificationSettings?: {
    enabled: boolean;
    morningReminderTime: string; // e.g. "05:00"
    studyStartTime?: string; // e.g. "05:00"
    studyEndTime?: string; // e.g. "22:00"
    lastNotifiedDate?: string;
    soundType?: MorningSoundType;
  };
  createdAt: string;
}

export interface TimetableSlot {
  id: string;
  startTime: string; // HH:MM (24h)
  endTime: string;   // HH:MM (24h)
  subjectId: string;
  chapterId?: string;
  taskType: 'study' | 'mcq' | 'flashcards' | 'revision';
  title?: string;
  completedDate?: string; // YYYY-MM-DD (5:00 AM study day key)
}

export interface FlashcardItem {
  id: string;
  subjectId: string;
  chapterName: string;
  front: string;
  back: string;
  hint?: string;
  isCustom?: boolean;
}

export interface FlashcardProgress {
  status: 'new' | 'review' | 'mastered';
  reviewCount: number;
  lastReviewedDate: string; // YYYY-MM-DD
  nextReviewDate: string;   // YYYY-MM-DD
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizSourceLink {
  title: string;
  uri: string;
}

export interface QuizAttempt {
  id: string;
  subjectId: string;
  subjectName: string;
  chapterName: string;
  mode: 'chapter' | 'random';
  score: number;
  totalQuestions: number;
  xpEarned: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export type FontMode = 'sans' | 'cursive' | 'dancing' | 'serif' | 'rounded' | 'mono' | 'display';

export type LanguageMode = 
  | 'en' // English Medium
  | 'hi' // Hindi Medium
  | 'ur' // Urdu Medium
  | 'mr' // Marathi Medium
  | 'sa' // Sanskrit Medium
  | 'bn' // Bengali Medium
  | 'gu' // Gujarati Medium
  | 'ta' // Tamil Medium
  | 'te' // Telugu Medium
  | 'pa' // Punjabi Medium
  | 'ml' // Malayalam Medium
  | 'kn' // Kannada Medium
  | 'or' // Odia Medium
  | 'as' // Assamese Medium
  | 'ne' // Nepali Medium
  | 'ks' // Kashmiri Medium
  | 'sd' // Sindhi Medium
  | 'kok' // Konkani Medium
  | 'mni' // Manipuri Medium
  | 'brx' // Bodo Medium
  | 'mai' // Maithili Medium
  | 'fr' // French
  | 'de' // German
  | 'es' // Spanish
  | 'ar'; // Arabic

export interface TrackerState {
  version: number;
  activeProfileId: string | null;
  profiles: Profile[];
  theme: ThemeMode;
  fontFamily?: FontMode;
  language?: LanguageMode;
  lastSyncedDate?: string;
  lastSyncedMonth?: string;
}

export type ThemeMode = 'dark' | 'light' | 'gold' | 'matrix' | 'cyberpunk';

export type ActiveScreen = 
  | 'onboarding' 
  | 'dashboard' 
  | 'chapters' 
  | 'practice'
  | 'planner'
  | 'resources'
  | 'leaderboard'
  | 'focus' 
  | 'insights' 
  | 'settings'
  | 'aura-ai';

export interface SubjectPaceCalculation {
  subjectId: string;
  subjectName: string;
  totalChaptersInSyllabus: number;
  completedChapters: number;
  inProgressChapters: number;
  totalStages: number;
  completedStages: number;
  percentComplete: number;
  stagesRemaining: number;
  daysRemaining: number;
  stagesPerDayNeeded: number;
  status: 'on-track' | 'needs-attention' | 'urgent' | 'completed';
}
