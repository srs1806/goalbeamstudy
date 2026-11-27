import React, { useState } from 'react';
import { Logo } from './Logo';
import logoImg256 from '../assets/logo-256.png';
import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import { Profile, Subject, LanguageMode, StageDefinition } from '../types/tracker';
import { DEFAULT_STAGES_CONFIG, CATALOG_STAGES_OPTIONS, STAGE_EMOJI_OPTIONS, getProfileStages } from '../data/stagesCatalog';
import { createInitialProfile, DEFAULT_SELECTED_SUBJECT_IDS } from '../utils/storage';
import { parseDDMMYYYY, isoToDDMMYYYY, ddmmyyyyToIso, formatToDDMMYYYY } from '../utils/planner';
import { requestNotificationPermission, sendMorningStudyReminder, recordUserVisit } from '../utils/notifications';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Target, 
  Clock, 
  Award,
  Check,
  CheckSquare,
  Square,
  Search,
  ExternalLink,
  X,
  Play,
  Globe,
  ChevronDown,
  Plus,
  Bookmark
} from 'lucide-react';
import { ManualVideoTour } from './ManualVideoTour';
import { SUPPORTED_LANGUAGES } from '../utils/translations';
import {
  getLocalizedSubjectName,
  getLocalizedChapterName,
  getLocalizedChapterPrefix,
} from '../utils/chapterTranslations';
import { InfoTooltip } from './InfoTooltip';
import { AutoGrowPromptInput, ExpandableText } from './ui/ResponsiveTextControls';

interface OnboardingProps {
  onComplete: (profile: Profile) => void;
  onSkipToExplore?: () => void;
  existingProfile?: Profile | null;
  preserveProgress?: boolean;
  currentLanguage?: LanguageMode;
  onLanguageChange?: (lang: LanguageMode) => void;
}

// Function to generate 36 randomized small background logos across the screen for each step
function generateStepLogos(stepKey: string, count = 36) {
  let hash = 0;
  for (let i = 0; i < stepKey.length; i++) {
    hash = (hash << 5) - hash + stepKey.charCodeAt(i);
    hash |= 0;
  }
  const pseudoRand = (i: number, salt: number) => {
    const x = Math.sin(hash + i * 8191 + salt * 43997) * 233280;
    return x - Math.floor(x);
  };

  return Array.from({ length: count }, (_, i) => {
    // Distribute across screen with margin
    const topPct = Math.round(pseudoRand(i, 1) * 94 + 2); // 2% to 96%
    const leftPct = Math.round(pseudoRand(i, 2) * 94 + 2); // 2% to 96%
    const size = Math.round(24 + pseudoRand(i, 3) * 20); // 24px to 44px (small but clearly visible on mobile & PC)
    const opacity = +(0.20 + pseudoRand(i, 4) * 0.16).toFixed(2); // 0.20 to 0.36 (perfect transparent visibility)
    const rotate = Math.round((pseudoRand(i, 5) - 0.5) * 60); // -30deg to +30deg
    const animDuration = +(3 + pseudoRand(i, 6) * 3).toFixed(1);

    return {
      id: i + 1,
      top: `${topPct}%`,
      left: `${leftPct}%`,
      size,
      opacity,
      rotate,
      animDuration,
    };
  });
}

export const Onboarding: React.FC<OnboardingProps> = ({ 
  onComplete, 
  onSkipToExplore,
  existingProfile,
  preserveProgress = false,
  currentLanguage = 'en',
  onLanguageChange
}) => {
  // Navigation Phases:
  // 1. 'details' (Student Details)
  // 2. 'date' (1st Paper Exam Date + Suggestion Dates)
  // 3. 'subjects' (Select Enrolled Subjects - Hindi A/B, Comm Eng, Sanskrit, AI 417, etc.)
  // 4. 'syllabus' (Select chapters only for chosen subjects)
  // 5. 'stages' (Select Study References & Milestones - NCERT compulsory, min 4, custom additions)
  // 6. 'finished' (Record prior completed work)
  // 7. 'videotour' (Interactive Video Guide)
  const [phase, setPhase] = useState<'details' | 'date' | 'subjects' | 'syllabus' | 'stages' | 'finished' | 'videotour'>('details');
  const [syllabusSubjectIndex, setSyllabusSubjectIndex] = useState<number>(0);

  // Form State (Strictly CBSE Class 10)
  const [studentName, setStudentName] = useState(existingProfile?.name || '');
  const selectedBoard = 'CBSE';
  const [mediumSearchQuery, setMediumSearchQuery] = useState('');
  const [targetPercentage, setTargetPercentage] = useState(existingProfile?.targetPercentage || 95);
  const [dailyHourGoal, setDailyHourGoal] = useState(existingProfile?.dailyHourGoal || 4);
  const [firstPaperDate, setFirstPaperDate] = useState(existingProfile?.firstPaperDate || '15/02/2027');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<'all' | 'core' | 'language' | 'elective' | 'skill'>('all');
  const [isCatalogSearching, setIsCatalogSearching] = useState(false);
  const [catalogSearchData, setCatalogSearchData] = useState<{
    summary: string;
    pdfLinks: Array<{ title: string; url: string; isPdf?: boolean }>;
  } | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarYear, setCalendarYear] = useState<number>(() => {
    const d = parseDDMMYYYY(existingProfile?.firstPaperDate || '15/02/2027');
    return d ? d.getFullYear() : 2027;
  });
  const [calendarMonth, setCalendarMonth] = useState<number>(() => {
    const d = parseDDMMYYYY(existingProfile?.firstPaperDate || '15/02/2027');
    return d ? d.getMonth() : 1; // 1 = February
  });

  // Study References / Stages Selection (Step 5)
  const [selectedStages, setSelectedStages] = useState<StageDefinition[]>(() => {
    return getProfileStages(existingProfile);
  });
  const [stagesSearchQuery, setStagesSearchQuery] = useState('');
  const [isAddCustomStageOpen, setIsAddCustomStageOpen] = useState(false);
  const [customStageName, setCustomStageName] = useState('');
  const [customStageShortLabel, setCustomStageShortLabel] = useState('');
  const [customStageEmoji, setCustomStageEmoji] = useState('📌');
  const [customStageDesc, setCustomStageDesc] = useState('');
  const [customStagesList, setCustomStagesList] = useState<StageDefinition[]>(() => {
    if (existingProfile?.selectedStages) {
      const defaultKeys = new Set(CATALOG_STAGES_OPTIONS.map((s) => s.key));
      return existingProfile.selectedStages.filter((s) => !defaultKeys.has(s.key));
    }
    return [];
  });

  // Enrolled Subjects Selection (Step 3)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(() => {
    if (existingProfile?.selectedSubjectIds && existingProfile.selectedSubjectIds.length > 0) {
      return existingProfile.selectedSubjectIds;
    }
    return DEFAULT_SELECTED_SUBJECT_IDS;
  });

  // Exam Syllabus (subjectId -> array of chapter IDs)
  const [syllabusSelection, setSyllabusSelection] = useState<Record<string, string[]>>(() => {
    if (existingProfile?.examSyllabus) {
      return existingProfile.examSyllabus;
    }
    const initial: Record<string, string[]> = {};
    CLASS_10_SUBJECTS.forEach((sub) => {
      initial[sub.id] = [];
      sub.groups.forEach((g) => {
        g.chapters.forEach((ch) => {
          initial[sub.id].push(ch.id);
        });
      });
    });
    return initial;
  });

  // Finished Work Backfill (subjectId:chapterId -> boolean)
  const [finishedChapters, setFinishedChapters] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (existingProfile?.progress) {
      Object.entries(existingProfile.progress).forEach(([subId, chapters]) => {
        Object.entries(chapters).forEach(([chId, prog]) => {
          if (prog.completed) {
            map[`${subId}:${chId}`] = true;
          }
        });
      });
    }
    return map;
  });

  // Sync / reset form state when profile changes (e.g. after reset tracker)
  React.useEffect(() => {
    if (!existingProfile) {
      setPhase('details');
      setStudentName('');
      setTargetPercentage(95);
      setDailyHourGoal(4);
      setFirstPaperDate('15/02/2027');
      setSelectedSubjectIds(DEFAULT_SELECTED_SUBJECT_IDS);
      setSelectedStages(DEFAULT_STAGES_CONFIG);
      setSyllabusSubjectIndex(0);
      setFinishedChapters({});
    } else {
      setStudentName(existingProfile.name || '');
      setTargetPercentage(existingProfile.targetPercentage || 95);
      setDailyHourGoal(existingProfile.dailyHourGoal || 4);
      setFirstPaperDate(existingProfile.firstPaperDate || '15/02/2027');
      if (existingProfile.selectedSubjectIds && existingProfile.selectedSubjectIds.length > 0) {
        setSelectedSubjectIds(existingProfile.selectedSubjectIds);
      }
      setSelectedStages(getProfileStages(existingProfile));
    }
  }, [existingProfile?.id]);

  // Enrolled subjects filtered for syllabus step
  const enrolledSubjects = CLASS_10_SUBJECTS.filter((s) => selectedSubjectIds.includes(s.id));
  const currentSyllabusSubject = enrolledSubjects[syllabusSubjectIndex] || enrolledSubjects[0] || CLASS_10_SUBJECTS[0];

  // Milestone Suggestion Dates near Calendar
  const SUGGESTED_DATES = [
    { label: 'CBSE Board Exam 2027', date: '15/02/2027', badge: 'Official Board' },
    { label: 'Pre-Board 1 Exam', date: '05/12/2026', badge: 'School Pre-Board' },
    { label: 'Pre-Board 2 Exam', date: '10/01/2027', badge: 'Final Revision' },
    { label: 'Unit Test / Half-Yearly', date: '15/09/2026', badge: 'Term 1 Target' },
  ];

  const handleDateManualChange = (val: string) => {
    setFirstPaperDate(val);
  };

  const handleDateCalendarChange = (isoVal: string) => {
    if (isoVal) {
      setFirstPaperDate(isoToDDMMYYYY(isoVal));
    }
  };

  const parsedDate = parseDDMMYYYY(firstPaperDate);
  const daysLeft = parsedDate
    ? Math.max(0, Math.ceil((parsedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Search & Chapter Checkbox Modal states for Form Filling
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [syllabusSearchQuery, setSyllabusSearchQuery] = useState('');
  const [chapterModalSubject, setChapterModalSubject] = useState<Subject | null>(null);
  const [modalTempChapterIds, setModalTempChapterIds] = useState<string[]>([]);
  const [finishedSubjectFilter] = useState<string>('all');

  // Build official CBSE syllabus web search URL
  const getOnlineSyllabusSearchUrl = (queryText?: string, subjectObj?: Subject) => {
    const subContext = subjectObj ? `${subjectObj.name} (Code ${subjectObj.code})` : '';
    const searchTerm = (queryText || subjectSearchQuery || syllabusSearchQuery || '').trim();
    const fullQuery = encodeURIComponent(
      `${selectedBoard} Class 10 ${subContext} ${searchTerm || 'Official Rationalized Syllabus Curriculum PDF'} site:cbseacademic.nic.in OR site:ncert.nic.in`
    );
    return `https://www.google.com/search?q=${fullQuery}`;
  };

  const handleCatalogGoogleSearch = async (type: 'subjects' | 'languages', customQuery?: string) => {
    setIsCatalogSearching(true);
    try {
      const res = await fetch('/api/search-education-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          board: 'CBSE',
          query: customQuery || '',
        }),
      });
      const data = await res.json();
      setCatalogSearchData({
        summary: data.summary || '',
        pdfLinks: Array.isArray(data.pdfLinks) ? data.pdfLinks : [],
      });
    } catch {
      setCatalogSearchData({
        summary: 'Verified CBSE Class 10 official academic syllabus & NCERT curriculum portal.',
        pdfLinks: [
          { title: 'CBSE Class 10 Official Curriculum Portal', url: 'https://cbseacademic.nic.in/curriculum_2027.html', isPdf: false },
          { title: 'NCERT Official Class 10 Textbooks Portal', url: 'https://ncert.nic.in/textbook.php', isPdf: false },
        ],
      });
    } finally {
      setIsCatalogSearching(false);
    }
  };

  // Subject Enrollment Click:
  // If subject is OFF -> opens chapter list with checkboxes so student selects exam chapters & clicks Next.
  // If subject is ON -> clicking again turns it OFF and removes its chapters.
  const handleSubjectCardClick = (sub: Subject) => {
    const isChecked = selectedSubjectIds.includes(sub.id);
    if (isChecked) {
      if (selectedSubjectIds.length <= 1) return; // Keep at least 1 subject
      setSelectedSubjectIds((prev) => prev.filter((id) => id !== sub.id));
      setSyllabusSelection((prev) => ({ ...prev, [sub.id]: [] }));
    } else {
      const allChIds = sub.groups.flatMap((g) => g.chapters.map((c) => c.id));
      const existing = syllabusSelection[sub.id];
      setModalTempChapterIds(existing && existing.length > 0 ? existing : allChIds);
      setChapterModalSubject(sub);
    }
  };

  const handleEditSubjectChaptersInModal = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    const allChIds = sub.groups.flatMap((g) => g.chapters.map((c) => c.id));
    const existing = syllabusSelection[sub.id];
    setModalTempChapterIds(existing && existing.length > 0 ? existing : allChIds);
    setChapterModalSubject(sub);
  };

  const handleConfirmSubjectChaptersModal = () => {
    if (!chapterModalSubject) return;
    if (modalTempChapterIds.length === 0) return;
    const subId = chapterModalSubject.id;
    setSelectedSubjectIds((prev) => (prev.includes(subId) ? prev : [...prev, subId]));
    setSyllabusSelection((prev) => ({ ...prev, [subId]: modalTempChapterIds }));
    setChapterModalSubject(null);
  };

  // Syllabus selection toggles
  const toggleChapterInSyllabus = (subjectId: string, chapterId: string) => {
    setSyllabusSelection((prev) => {
      const current = prev[subjectId] || [];
      const updated = current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId];
      return { ...prev, [subjectId]: updated };
    });
  };

  const selectAllChaptersForSubject = (subjectId: string, selectAll: boolean) => {
    setSyllabusSelection((prev) => {
      const subject = CLASS_10_SUBJECTS.find((s) => s.id === subjectId);
      if (!subject) return prev;
      const allIds: string[] = [];
      if (selectAll) {
        subject.groups.forEach((g) => g.chapters.forEach((ch) => allIds.push(ch.id)));
      }
      return { ...prev, [subjectId]: allIds };
    });
  };

  // Toggle finished chapter backfill
  const toggleFinished = (subjectId: string, chapterId: string) => {
    const key = `${subjectId}:${chapterId}`;
    setFinishedChapters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFinish = async () => {
    // Request system notification permission and record active visit
    await requestNotificationPermission().catch(() => {});
    recordUserVisit();

    if (studentName && studentName.trim()) {
      try {
        localStorage.setItem('zenith_student_name', studentName.trim());
      } catch {}
    }

    const profile = createInitialProfile(
      studentName,
      firstPaperDate,
      targetPercentage,
      dailyHourGoal,
      'Board Exam (Finals)',
      existingProfile?.pomodoroMinutes || 25,
      selectedSubjectIds,
      selectedBoard
    );
    profile.board = selectedBoard;
    profile.examSyllabus = syllabusSelection;
    profile.selectedStages = selectedStages;

    if (preserveProgress && existingProfile) {
      Object.assign(profile, {
        id: existingProfile.id,
        createdAt: existingProfile.createdAt,
        streak: existingProfile.streak,
        xp: existingProfile.xp,
        focusPoints: existingProfile.focusPoints,
        totalFocusMinutes: existingProfile.totalFocusMinutes,
        treesGrown: existingProfile.treesGrown,
        examDateSheet: existingProfile.examDateSheet,
        dailyTimetable: existingProfile.dailyTimetable,
        flashcardProgress: existingProfile.flashcardProgress,
        customFlashcards: existingProfile.customFlashcards,
        quizHistory: existingProfile.quizHistory,
        notificationSettings: existingProfile.notificationSettings || {
          enabled: true,
          morningReminderTime: '05:00',
          soundType: 'zenith-symphony',
        },
      });
      // Preserve existing chapter progress while adding any new subjects/chapters
      Object.keys(existingProfile.progress || {}).forEach((subId) => {
        profile.progress[subId] = {
          ...(profile.progress[subId] || {}),
          ...existingProfile.progress[subId],
        };
      });
    } else {
      profile.notificationSettings = {
        enabled: true,
        morningReminderTime: '05:00',
        soundType: 'zenith-symphony',
      };
    }

    // Apply backfilled finished chapters
    Object.keys(finishedChapters).forEach((key) => {
      if (finishedChapters[key]) {
        const [subId, chId] = key.split(':');
        if (profile.progress[subId] && profile.progress[subId][chId]) {
          profile.progress[subId][chId].completed = true;
          selectedStages.forEach((st) => {
            profile.progress[subId][chId].stages[st.key] = 'done';
          });
        }
      }
    });

    // Automatically dispatch today's target to mobile & desktop notification tray
    sendMorningStudyReminder(profile, currentLanguage).catch(() => {});

    onComplete(profile);
  };

  const totalSelectedChapters = Object.values(syllabusSelection).reduce(
    (acc, arr) => acc + (arr?.length || 0),
    0
  );

  // Dynamically re-arrange small background logos across the screen on every step transition
  const currentStepKey = `${phase}-${syllabusSubjectIndex}`;
  const dynamicBackgroundLogos = React.useMemo(() => {
    return generateStepLogos(currentStepKey, 36);
  }, [currentStepKey]);

  return (
    <div className="w-full h-full min-h-0 flex flex-col items-center justify-center bg-[var(--bg-main)] relative overflow-hidden">
      {/* Background scattered small floating logos with dynamic random arrangement on each step */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Soft background central watermark emblem */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 opacity-[0.09] rounded-full overflow-hidden blur-[1px]">
          <img
            src={logoImg256}
            alt="Watermark"
            className="w-full h-full object-cover filter contrast-125 brightness-110"
          />
        </div>

        {dynamicBackgroundLogos.map((item) => (
          <div
            key={item.id}
            className="absolute transition-all duration-1000 ease-out select-none rounded-full overflow-hidden border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.45)] bg-slate-950/50"
            style={{
              top: item.top,
              left: item.left,
              width: `${item.size}px`,
              height: `${item.size}px`,
              opacity: item.opacity,
              transform: `rotate(${item.rotate}deg)`,
            }}
          >
            <img
              src={logoImg256}
              alt="Floating Logo"
              loading="eager"
              decoding="sync"
              className="w-full h-full object-cover filter contrast-125 brightness-110"
            />
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl h-full max-h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-3 sm:p-5 transition-all relative z-10 flex flex-col min-h-0 overflow-hidden">
        {/* Compact Top Logo & CBSE Branding (Zero scroll overhead) */}
        <div className="shrink-0 flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[var(--border-color)]/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size="sm" className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-xl flex items-center gap-1 leading-none">
                  <span className="brand-wordmark">GOALBEAM</span>
                  <span className="text-amber-400 select-none">⚡</span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] truncate mt-0.5">
                {CLASS_10_SUBJECTS.length} CBSE Course Subjects • {SUPPORTED_LANGUAGES.length} Study Mediums
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--badge-bg)] text-[var(--badge-text)] text-[10px] font-bold shrink-0">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Goal + Beam</span>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="shrink-0 mb-2.5 sm:mb-3">
          <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-bold text-[var(--text-secondary)] mb-1.5">
            <span className="truncate">
              {phase === 'details' && 'STEP 1 OF 6: Student Details'}
              {phase === 'date' && 'STEP 2 OF 6: 1st Paper Target Date'}
              {phase === 'subjects' && `STEP 3 OF 6: Enrolled Subjects (${selectedSubjectIds.length} Selected)`}
              {phase === 'syllabus' && `STEP 4 OF 6: Syllabus (${syllabusSubjectIndex + 1}/${enrolledSubjects.length}: ${currentSyllabusSubject.name})`}
              {phase === 'stages' && `STEP 5 OF 6: References (${selectedStages.length} Selected • Min 4)`}
              {phase === 'finished' && 'STEP 6 OF 6: Record Completed Work'}
              {phase === 'videotour' && 'Interactive Video Manual & Guide'}
            </span>
            <span className="text-[var(--accent-primary)] font-mono shrink-0">
              {phase === 'stages' ? `${selectedStages.length} Active` : `${totalSelectedChapters} Ch`}
            </span>
          </div>

          <div className="flex gap-1.5">
            <div className={`h-1.5 flex-1 rounded-full ${phase === 'details' ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 'bg-emerald-500'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${phase === 'details' ? 'bg-[var(--bg-elevated)]' : phase === 'date' ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 'bg-emerald-500'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${['details', 'date'].includes(phase) ? 'bg-[var(--bg-elevated)]' : phase === 'subjects' ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 'bg-emerald-500'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${['details', 'date', 'subjects'].includes(phase) ? 'bg-[var(--bg-elevated)]' : phase === 'syllabus' ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 'bg-emerald-500'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${['details', 'date', 'subjects', 'syllabus'].includes(phase) ? 'bg-[var(--bg-elevated)]' : phase === 'stages' ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 'bg-emerald-500'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${phase === 'finished' ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : phase === 'videotour' ? 'bg-emerald-500' : 'bg-[var(--bg-elevated)]'}`} />
          </div>
        </div>

        {/* STEP 1: Student Details (Zero whole-screen scroll on mobile & PC) */}
        {phase === 'details' && (
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 sm:gap-3 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex-1 min-h-0 flex flex-col justify-evenly sm:justify-start gap-2.5 sm:gap-3.5 overflow-hidden">
              <div className="border-b border-[var(--border-color)] pb-2 shrink-0">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-primary)] shrink-0" />
                  <span>Step 1: CBSE Class 10 Scholar Details</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">
                  Personalize your CBSE Class 10 board preparation targets.
                </p>
              </div>

              <div className="shrink-0">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name (e.g. Aarav Sharma)"
                  className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs sm:text-sm font-medium focus:border-[var(--accent-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 shrink-0">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 truncate">
                    Target Score
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl px-2.5 sm:px-3.5 py-2">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <input
                      type="range"
                      min="75"
                      max="100"
                      step="1"
                      value={targetPercentage}
                      onChange={(e) => setTargetPercentage(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer min-w-0"
                    />
                    <span className="font-extrabold text-xs sm:text-sm text-[var(--accent-primary)] shrink-0">
                      {targetPercentage}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 truncate">
                    Daily Goal
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl px-2.5 sm:px-3.5 py-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="0.5"
                      value={dailyHourGoal}
                      onChange={(e) => setDailyHourGoal(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer min-w-0"
                    />
                    <span className="font-extrabold text-xs sm:text-sm text-[var(--accent-primary)] shrink-0 whitespace-nowrap">
                      {dailyHourGoal}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Chapter & Textbook Study Medium (All 25 CBSE Languages) */}
              <div className="pt-2 border-t border-[var(--border-color)]/60 space-y-1.5 sm:space-y-2 shrink-0">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Select Study Medium</span>
                    <InfoTooltip text="Website UI stays in English; displays chapter names in your chosen NCERT medium." />
                  </label>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {SUPPORTED_LANGUAGES.length} Languages
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="relative min-w-0">
                    <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={mediumSearchQuery}
                      onChange={(e) => setMediumSearchQuery(e.target.value)}
                      placeholder="Filter language..."
                      aria-label="Filter study medium language"
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-cyan-400 text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="relative sm:col-span-2">
                    <select
                      value={currentLanguage || 'en'}
                      onChange={(e) => {
                        if (onLanguageChange) onLanguageChange(e.target.value as LanguageMode);
                      }}
                      className="w-full appearance-none px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-color)] hover:border-cyan-400 focus:border-cyan-400 text-xs sm:text-sm font-bold text-[var(--text-primary)] cursor-pointer transition-all shadow-sm pr-8 focus:outline-none"
                    >
                      {SUPPORTED_LANGUAGES.filter((lang) => {
                        if (!mediumSearchQuery.trim()) return true;
                        const q = mediumSearchQuery.toLowerCase();
                        return (
                          lang.name.toLowerCase().includes(q) ||
                          lang.nativeName.toLowerCase().includes(q) ||
                          lang.code.toLowerCase().includes(q)
                        );
                      }).map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-[var(--bg-card)] text-[var(--text-primary)] py-1.5">
                          {lang.flag} {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400 flex items-center">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] bg-[var(--bg-elevated)]/60 px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
                  <span className="text-sm">{SUPPORTED_LANGUAGES.find((l) => l.code === (currentLanguage || 'en'))?.flag}</span>
                  <span className="font-bold text-[var(--text-primary)] truncate">
                    {SUPPORTED_LANGUAGES.find((l) => l.code === (currentLanguage || 'en'))?.name}
                  </span>
                  <span className="truncate">({SUPPORTED_LANGUAGES.find((l) => l.code === (currentLanguage || 'en'))?.nativeName})</span>
                  <span className="ml-auto text-[9px] font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded shrink-0">
                    CBSE • English UI
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-1">
              {onSkipToExplore && (
                <button
                  type="button"
                  onClick={onSkipToExplore}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-[var(--bg-elevated)] hover:border-cyan-400/50 border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs sm:text-sm cursor-pointer transition-all shrink-0"
                >
                  Skip Setup
                </button>
              )}
              <button
                onClick={() => setPhase('date')}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[var(--accent-primary)] hover:opacity-95 text-[var(--text-inverse)] font-black text-xs sm:text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <span>Next: Target Exam Date</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 1st Paper Target Exam Date (Zero whole-screen scroll) */}
        {phase === 'date' && (
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 sm:gap-3 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex-1 min-h-0 flex flex-col justify-evenly sm:justify-start gap-2.5 sm:gap-3.5 overflow-hidden">
              <div className="border-b border-[var(--border-color)] pb-2 shrink-0">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="inline-flex">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </span>
                  <span>Step 2: 1st Paper Target Date</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">
                  Type date, pick on calendar, or tap a milestone below.
                </p>
              </div>

              {/* Target Date Box */}
              <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-elevated)] border-2 border-amber-500/30 space-y-2 shadow-md shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                    <span className="inline-flex">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    </span>
                    <span>Target Date (DD/MM/YYYY):</span>
                  </label>
                  {daysLeft !== null && (
                    <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                      {daysLeft} Days Left ⚡
                    </span>
                  )}
                </div>

                {/* Date Input with integrated interactive calendar icon */}
                <div className="relative w-full">
                  <input
                    type="text"
                    value={firstPaperDate}
                    onChange={(e) => handleDateManualChange(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full pl-3.5 pr-11 py-2.5 sm:py-3 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] text-sm font-mono font-bold text-[var(--text-primary)] focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const d = parseDDMMYYYY(firstPaperDate);
                      if (d) {
                        setCalendarYear(d.getFullYear());
                        setCalendarMonth(d.getMonth());
                      }
                      setShowCalendarModal(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 p-1 cursor-pointer transition-colors"
                    title="Open Calendar"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Interactive Calendar Picker Modal */}
              {showCalendarModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
                  <div className="w-full max-w-sm max-h-[88dvh] overflow-y-auto rounded-2xl bg-[var(--bg-card)] border-2 border-amber-500/60 shadow-2xl p-4 sm:p-5 space-y-3.5">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex">
                          <Calendar className="w-5 h-5 text-amber-400" />
                        </span>
                        <span className="text-sm font-extrabold text-[var(--text-primary)]">
                          Select 1st Paper Target Date
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCalendarModal(false)}
                        className="p-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Month & Year Navigation */}
                    <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-color)]">
                      <button
                        type="button"
                        onClick={() => {
                          if (calendarMonth === 0) {
                            setCalendarMonth(11);
                            setCalendarYear((y) => y - 1);
                          } else {
                            setCalendarMonth((m) => m - 1);
                          }
                        }}
                        className="p-1.5 px-2.5 rounded-lg bg-[var(--bg-card)] hover:bg-amber-500/20 text-amber-300 font-bold text-xs cursor-pointer"
                        title="Previous Month"
                      >
                        ‹
                      </button>

                      <div className="text-xs font-black text-amber-300 flex items-center gap-2">
                        <select
                          value={calendarMonth}
                          onChange={(e) => setCalendarMonth(Number(e.target.value))}
                          className="bg-[var(--bg-card)] text-amber-300 font-bold border border-amber-500/40 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer"
                        >
                          {[
                            'January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'
                          ].map((m, idx) => (
                            <option key={m} value={idx}>{m}</option>
                          ))}
                        </select>

                        <select
                          value={calendarYear}
                          onChange={(e) => setCalendarYear(Number(e.target.value))}
                          className="bg-[var(--bg-card)] text-amber-300 font-bold border border-amber-500/40 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer"
                        >
                          {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (calendarMonth === 11) {
                            setCalendarMonth(0);
                            setCalendarYear((y) => y + 1);
                          } else {
                            setCalendarMonth((m) => m + 1);
                          }
                        }}
                        className="p-1.5 px-2.5 rounded-lg bg-[var(--bg-card)] hover:bg-amber-500/20 text-amber-300 font-bold text-xs cursor-pointer"
                        title="Next Month"
                      >
                        ›
                      </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-[var(--text-secondary)]">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
                        <div key={w} className="py-1">
                          {w}
                        </div>
                      ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                        const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
                        const currentSelected = parseDDMMYYYY(firstPaperDate);

                        const blanks = Array.from({ length: firstDayIndex }, (_, i) => (
                          <div key={`blank-${i}`} className="p-2" />
                        ));

                        const days = Array.from({ length: daysInMonth }, (_, i) => {
                          const dayNum = i + 1;
                          const isSelected =
                            currentSelected &&
                            currentSelected.getDate() === dayNum &&
                            currentSelected.getMonth() === calendarMonth &&
                            currentSelected.getFullYear() === calendarYear;

                          return (
                            <button
                              key={dayNum}
                              type="button"
                              onClick={() => {
                                const picked = new Date(calendarYear, calendarMonth, dayNum, 23, 59, 59);
                                setFirstPaperDate(formatToDDMMYYYY(picked));
                                setShowCalendarModal(false);
                              }}
                              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                                  : 'hover:bg-amber-500/20 text-[var(--text-primary)] hover:text-amber-300'
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        });

                        return [...blanks, ...days];
                      })()}
                    </div>

                    {/* Native Device Picker Option */}
                    <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Device Native Calendar:</span>
                      </span>
                      <input
                        type="date"
                        value={ddmmyyyyToIso(firstPaperDate)}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDateCalendarChange(e.target.value);
                            setShowCalendarModal(false);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-amber-500/40 text-amber-300 text-xs font-mono font-bold cursor-pointer"
                      />
                    </div>

                    {/* Quick Milestone Selection within Modal */}
                    <div className="border-t border-[var(--border-color)] pt-2.5 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Quick Official Exam Milestones:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setFirstPaperDate('15/02/2027');
                            setShowCalendarModal(false);
                          }}
                          className="px-2 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold hover:bg-amber-500/25 cursor-pointer"
                        >
                          ⚡ CBSE Board Exam (15/02/2027)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFirstPaperDate('05/12/2026');
                            setShowCalendarModal(false);
                          }}
                          className="px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[10px] font-bold hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          Pre-Board 1 (05/12/2026)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Clickable Suggestion Dates near Calendar (2x2 Grid so zero scroll on mobile) */}
              <div className="space-y-1.5 shrink-0">
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Suggested Milestone Dates (Tap to select):
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_DATES.map((sug) => {
                    const isSelected = firstPaperDate === sug.date;
                    return (
                      <button
                        key={sug.date}
                        type="button"
                        onClick={() => setFirstPaperDate(sug.date)}
                        className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          isSelected
                            ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)] text-[var(--text-primary)] shadow-sm'
                            : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50'
                        }`}
                      >
                        <div className="text-[11px] sm:text-xs font-extrabold text-[var(--text-primary)] leading-tight">
                          {sug.label}
                        </div>
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="text-[10px] font-mono text-[var(--accent-primary)]">
                            {sug.date}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] hidden sm:inline">
                            {sug.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setPhase('details')}
                className="px-4 py-2.5 sm:py-3 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setPhase('subjects')}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[var(--accent-primary)] hover:opacity-95 text-[var(--text-inverse)] font-black text-xs sm:text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <span>Next: Select Subjects</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT ENROLLED SUBJECTS + CHAPTER CHECKBOX MODAL (Only list scrolls internally) */}
        {phase === 'subjects' && (
          <div className="flex-1 min-h-0 flex flex-col gap-2 sm:gap-2.5 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-[var(--border-color)] pb-2 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-primary)] shrink-0" />
                <span>Step 3: CBSE Subjects &amp; Exam Chapters</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">
                Tap a subject to select its chapters, or tap again to remove.
              </p>
            </div>

            {/* Search Subjects & Search Syllabus via Google Search Bar */}
            <div className="shrink-0 space-y-1.5 bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-3.5 h-3.5 text-[var(--accent-primary)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={subjectSearchQuery}
                    onChange={(e) => setSubjectSearchQuery(e.target.value)}
                    placeholder={`Search ${CLASS_10_SUBJECTS.length} CBSE subjects or code...`}
                    aria-label="Search CBSE subjects"
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                  {subjectSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSubjectSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleCatalogGoogleSearch('subjects', subjectSearchQuery)}
                  disabled={isCatalogSearching}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-500/40 text-cyan-300 font-extrabold text-[11px] flex items-center justify-center gap-1 shrink-0 cursor-pointer transition-colors disabled:opacity-50"
                  title="Search official CBSE subjects & syllabus PDFs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isCatalogSearching ? 'Searching...' : 'Google Syllabus'}</span>
                  <span className="sm:hidden">{isCatalogSearching ? '...' : 'PDFs'}</span>
                </button>
              </div>

              {/* Subject Stream Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {([
                  { id: 'all', label: `All (${CLASS_10_SUBJECTS.length})` },
                  { id: 'core', label: 'Core' },
                  { id: 'language', label: 'Languages' },
                  { id: 'elective', label: 'Electives' },
                  { id: 'skill', label: 'Skill (401+)' },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubjectCategoryFilter(tab.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                      subjectCategoryFilter === tab.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {catalogSearchData && phase === 'subjects' && (
                <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-cyan-500/30 space-y-1 text-[10px] max-h-24 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-cyan-400 uppercase">Verified CBSE Search PDFs</span>
                    <button
                      type="button"
                      onClick={() => setCatalogSearchData(null)}
                      className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-snug">{catalogSearchData.summary}</p>
                  {catalogSearchData.pdfLinks.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {catalogSearchData.pdfLinks.slice(0, 4).map((lnk, idx) => (
                        <a
                          key={idx}
                          href={lnk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border max-w-full ${
                            lnk.isPdf
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          <span className="break-words [overflow-wrap:anywhere]">{lnk.isPdf ? '📄 ' : ''}{lnk.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Strictly Internally Scrollable Subject List */}
            <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden">
              <div className="shrink-0 flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] gap-1">
                <span>CBSE Subjects ({selectedSubjectIds.length} Selected)</span>
                <span className="text-emerald-400 font-extrabold truncate">
                  Tap ✏️ for Chapters
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                {CLASS_10_SUBJECTS.filter((sub) => {
                  const codeNum = Number(sub.code);
                  const isSkill = codeNum >= 400;
                  const isElective = ['computer_applications', 'home_science', 'painting', 'elements_business_154', 'book_keeping_254', 'carnatic_music_031', 'hindustani_music_034', 'ncc_076'].includes(sub.id);
                  const isCore = ['science', 'maths', 'maths_basic', 'sst', 'english'].includes(sub.id);
                  if (subjectCategoryFilter === 'core' && !isCore) return false;
                  if (subjectCategoryFilter === 'skill' && !isSkill) return false;
                  if (subjectCategoryFilter === 'elective' && !isElective) return false;
                  if (subjectCategoryFilter === 'language' && (isCore || isSkill || isElective)) return false;

                  if (!subjectSearchQuery.trim()) return true;
                  const q = subjectSearchQuery.toLowerCase();
                  const locName = getLocalizedSubjectName(sub.id, sub.name, currentLanguage).toLowerCase();
                  return (
                    sub.name.toLowerCase().includes(q) ||
                    locName.includes(q) ||
                    sub.code.toLowerCase().includes(q) ||
                    sub.description.toLowerCase().includes(q) ||
                    sub.groups.some((g) => g.chapters.some((c) => c.name.toLowerCase().includes(q)))
                  );
                }).map((sub) => {
                  const isChecked = selectedSubjectIds.includes(sub.id);
                  const totalCh = sub.groups.reduce((acc, g) => acc + g.chapters.length, 0);
                  const selectedChCount = (syllabusSelection[sub.id] || []).length;
                  const displaySubName = getLocalizedSubjectName(sub.id, sub.name, currentLanguage);

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSubjectCardClick(sub)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/60 text-[var(--text-primary)] shadow-sm'
                          : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-[var(--text-muted)]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-extrabold break-words [overflow-wrap:anywhere]">
                            {displaySubName} <span className="text-[10px] font-mono opacity-75">(Code {sub.code})</span>
                          </div>
                          <div className="text-[11px] opacity-80 break-words">
                            {isChecked
                              ? `${selectedChCount} of ${totalCh} Exam Chapters Selected`
                              : `${totalCh} Chapters — Tap to select chapters`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isChecked ? (
                          <button
                            type="button"
                            onClick={(e) => handleEditSubjectChaptersInModal(e, sub)}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold hover:bg-cyan-500/25 cursor-pointer"
                          >
                            ✏️ Chapters
                          </button>
                        ) : (
                          <span
                            className="sub-accent-pill border text-[10px] px-2.5 py-1 rounded-lg font-extrabold uppercase shrink-0"
                            style={{ '--sub-hex': sub.color } as React.CSSProperties}
                          >
                            + Select
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chapter Checkbox Selection Modal inside Step 3 */}
            {chapterModalSubject && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
                <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent-primary)] shadow-2xl overflow-hidden flex flex-col max-h-[88dvh]">
                  <div className="p-3.5 sm:p-4 border-b border-[var(--border-color)] flex items-center justify-between gap-2 bg-[var(--bg-elevated)]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: chapterModalSubject.color }}
                        />
                        <h4 className="text-sm sm:text-base font-black text-[var(--text-primary)] break-words">
                          {chapterModalSubject.name} (Code {chapterModalSubject.code})
                        </h4>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Check the chapters coming in your exam, then click <strong>Next</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setChapterModalSubject(null)}
                      className="p-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="px-3.5 py-2 bg-[var(--bg-main)] border-b border-[var(--border-color)] flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-extrabold text-[var(--accent-primary)]">
                      {modalTempChapterIds.length} Chapters Checked
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setModalTempChapterIds(
                            chapterModalSubject.groups.flatMap((g) => g.chapters.map((c) => c.id))
                          )
                        }
                        className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalTempChapterIds([])}
                        className="px-2 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[11px] cursor-pointer"
                      >
                        Deselect All
                      </button>
                      <a
                        href={getOnlineSyllabusSearchUrl('', chapterModalSubject)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Web Syllabus</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 overflow-y-auto space-y-3 flex-1">
                    {chapterModalSubject.groups.map((grp) => (
                      <div key={grp.id} className="space-y-1.5">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] px-1">
                          {grp.name}
                        </div>
                        <div className="space-y-1.5">
                          {grp.chapters.map((ch) => {
                            const isChChecked = modalTempChapterIds.includes(ch.id);
                            return (
                              <label
                                key={ch.id}
                                onClick={() =>
                                  setModalTempChapterIds((prev) =>
                                    prev.includes(ch.id)
                                      ? prev.filter((id) => id !== ch.id)
                                      : [...prev, ch.id]
                                  )
                                }
                                className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  isChChecked
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-[var(--text-primary)]'
                                    : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-75'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isChChecked ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                                  )}
                                  <span className="text-xs font-bold leading-snug">
                                    {getLocalizedChapterPrefix(currentLanguage)} {ch.no}: {getLocalizedChapterName(ch.id, ch.name, currentLanguage)}
                                  </span>
                                </div>
                                {ch.highYield && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                                    High-Yield
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setChapterModalSubject(null)}
                      className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={modalTempChapterIds.length === 0}
                      onClick={handleConfirmSubjectChaptersModal}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <span>Next: Save & Add Subject ({modalTempChapterIds.length} Ch)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="shrink-0 flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setPhase('date')}
                className="px-4 py-2.5 sm:py-3 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                disabled={selectedSubjectIds.length === 0}
                onClick={() => {
                  setSyllabusSubjectIndex(0);
                  setPhase('syllabus');
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[var(--accent-primary)] hover:opacity-95 text-[var(--text-inverse)] font-black text-xs sm:text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>Next: Review Chapters ({selectedSubjectIds.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Syllabus Selection (Zero whole-screen scroll; only chapter list scrolls) */}
        {phase === 'syllabus' && (
          <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-[var(--border-color)] pb-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 min-w-0 truncate">
                  <span
                    className="w-3 h-3 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: currentSyllabusSubject.color }}
                  />
                  <span className="truncate">
                    {currentSyllabusSubject.name} ({syllabusSubjectIndex + 1}/{enrolledSubjects.length})
                  </span>
                </h2>
                <span className="text-[11px] font-mono font-bold text-[var(--accent-primary)] shrink-0">
                  Code {currentSyllabusSubject.code}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Check chapters included in your CBSE exam syllabus (scroll list below).
              </p>
            </div>

            {/* Subject Pills (Horizontal / compact scrollable) */}
            <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto bg-[var(--bg-elevated)] p-1.5 rounded-xl border border-[var(--border-color)]">
              {enrolledSubjects.map((sub, idx) => {
                const isCurr = idx === syllabusSubjectIndex;
                const chCount = (syllabusSelection[sub.id] || []).length;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSyllabusSubjectIndex(idx)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      isCurr
                        ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)] font-black shadow-sm'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                    }`}
                  >
                    <span>{getLocalizedSubjectName(sub.id, sub.name, currentLanguage)}</span>
                    <span className="text-[10px] opacity-80">({chCount})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Chapters & Online Web Syllabus Search */}
            <div className="shrink-0 flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-[var(--accent-primary)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={syllabusSearchQuery}
                  onChange={(e) => setSyllabusSearchQuery(e.target.value)}
                  placeholder={`Search chapters in ${currentSyllabusSubject.name}...`}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
                {syllabusSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSyllabusSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              <a
                href={getOnlineSyllabusSearchUrl(syllabusSearchQuery, currentSyllabusSubject)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-500/40 text-cyan-300 font-extrabold text-[11px] flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                title="Search official CBSE syllabus & curriculum on the web"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">Search Syllabus Online</span>
                <span className="sm:hidden">Web PDF</span>
              </a>
            </div>

            {/* Select / Deselect All */}
            <div className="shrink-0 flex items-center justify-between bg-[var(--bg-elevated)] px-2.5 py-1.5 rounded-xl text-[11px]">
              <span className="font-semibold text-[var(--text-secondary)]">
                {syllabusSelection[currentSyllabusSubject.id]?.length || 0} Chapters Selected
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => selectAllChaptersForSubject(currentSyllabusSubject.id, true)}
                  className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] font-bold text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => selectAllChaptersForSubject(currentSyllabusSubject.id, false)}
                  className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Strictly Internally Scrollable Chapters Checkboxes */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {currentSyllabusSubject.groups.map((group) => {
                const filteredChapters = group.chapters.filter((ch) => {
                  if (!syllabusSearchQuery.trim()) return true;
                  const q = syllabusSearchQuery.toLowerCase();
                  return ch.name.toLowerCase().includes(q) || String(ch.no).includes(q);
                });
                if (filteredChapters.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-1.5">
                    {group.name && (
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] px-1 pt-1">
                        {group.name}
                      </div>
                    )}
                    {filteredChapters.map((ch) => {
                      const isSelected = (syllabusSelection[currentSyllabusSubject.id] || []).includes(ch.id);
                      return (
                        <div
                          key={ch.id}
                          onClick={() => toggleChapterInSyllabus(currentSyllabusSubject.id, ch.id)}
                          className={`p-2.5 rounded-xl border text-xs flex items-start sm:items-center justify-between gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-[var(--text-primary)]'
                              : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-color)]/80'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                            ) : (
                              <Square className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5 sm:mt-0" />
                            )}
                            <span className="font-bold leading-snug break-words flex-1 min-w-0">
                              {getLocalizedChapterPrefix(currentLanguage)} {ch.no}: {getLocalizedChapterName(ch.id, ch.name, currentLanguage)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {ch.highYield && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold shrink-0">
                                High-Yield
                              </span>
                            )}
                            <a
                              href={getOnlineSyllabusSearchUrl(ch.name, currentSyllabusSubject)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-cyan-400 hover:border-cyan-400 cursor-pointer inline-flex items-center"
                              title={`Search "${ch.name}" syllabus online`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Syllabus Navigation Controls */}
            <div className="shrink-0 flex items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (syllabusSubjectIndex > 0) {
                    setSyllabusSubjectIndex(syllabusSubjectIndex - 1);
                  } else {
                    setPhase('subjects');
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold cursor-pointer shrink-0"
              >
                {syllabusSubjectIndex === 0 ? '← Subjects' : '← Prev'}
              </button>

              {syllabusSubjectIndex < enrolledSubjects.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setSyllabusSubjectIndex(syllabusSubjectIndex + 1)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-[var(--text-inverse)] text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-md min-w-0"
                >
                  <span className="truncate">Next ({enrolledSubjects[syllabusSubjectIndex + 1]?.name})</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhase('stages')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Next: Study References ({selectedStages.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Select Study References & Milestones (Zero whole-screen scroll) */}
        {phase === 'stages' && (
          <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-[var(--border-color)] pb-2 shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-primary)] shrink-0" />
                  <span>Step 5: Study References</span>
                </h2>
                <span
                  className={`text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedStages.length >= 4
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
                  }`}
                >
                  {selectedStages.length} Selected • {selectedStages.length >= 4 ? '✓ Ready' : `Need ${4 - selectedStages.length} more`}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                <strong>NCERT is compulsory.</strong> Pick at least 4 study references.
              </p>
            </div>

            {/* Search Catalog & Add Custom Button */}
            <div className="shrink-0 flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-[var(--accent-primary)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={stagesSearchQuery}
                  onChange={(e) => setStagesSearchQuery(e.target.value)}
                  placeholder="Search references (NCERT, PYQ, Exemplar...)"
                  aria-label="Search study references"
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
                {stagesSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setStagesSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomStageOpen(!isAddCustomStageOpen)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/40 text-cyan-300 font-extrabold text-[11px] flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Add Custom</span>
                <span className="sm:hidden">Custom</span>
              </button>
            </div>

            {/* Custom Reference Drawer / Form */}
            {isAddCustomStageOpen && (
              <div className="shrink-0 max-h-[45%] overflow-y-auto p-3 rounded-xl bg-[var(--bg-elevated)] border-2 border-cyan-400/50 shadow-md space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Create Your Own Reference / Study Stage</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomStageOpen(false)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Reference / Stage Name
                    </label>
                    <AutoGrowPromptInput
                      value={customStageName}
                      onValueChange={setCustomStageName}
                      placeholder="e.g. Topper Handwritten Notes, PW Udaan, Educart 100"
                      maxHeightPx={88}
                      ariaLabel="Custom reference stage name"
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Short Badge (Tab)
                    </label>
                    <AutoGrowPromptInput
                      value={customStageShortLabel}
                      onValueChange={setCustomStageShortLabel}
                      placeholder="e.g. Notes ✍️"
                      maxHeightPx={72}
                      ariaLabel="Short badge"
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Select Stage Logo / Emoji
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                    {STAGE_EMOJI_OPTIONS.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setCustomStageEmoji(emo)}
                        className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all cursor-pointer ${
                          customStageEmoji === emo
                            ? 'bg-cyan-500/25 border-2 border-cyan-400 scale-110 shadow-sm'
                            : 'hover:bg-[var(--bg-elevated)] border border-transparent'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Brief Description
                  </label>
                  <AutoGrowPromptInput
                    value={customStageDesc}
                    onValueChange={setCustomStageDesc}
                    placeholder="e.g. Solving and revising coaching summary notes"
                    maxHeightPx={110}
                    ariaLabel="Brief description"
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomStageOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!customStageName.trim()) return;
                      const newKey = `custom_${Date.now()}`;
                      const newStage: StageDefinition = {
                        key: newKey,
                        label: customStageName.trim(),
                        shortLabel: customStageShortLabel.trim() || customStageName.trim().slice(0, 10),
                        description: customStageDesc.trim() || customStageName.trim(),
                        emoji: customStageEmoji || '📌',
                        icon: 'Bookmark',
                      };
                      setCustomStagesList((prev) => [...prev, newStage]);
                      setSelectedStages((prev) => [...prev, newStage]);
                      setCustomStageName('');
                      setCustomStageShortLabel('');
                      setCustomStageDesc('');
                      setIsAddCustomStageOpen(false);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                  >
                    + Add Reference
                  </button>
                </div>
              </div>
            )}

            {/* Strictly Internally Scrollable List of Catalog & Custom Stages */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {[...CATALOG_STAGES_OPTIONS, ...customStagesList].filter((st, index, self) => {
                if (self.findIndex((s) => s.key === st.key) !== index) return false;
                if (!stagesSearchQuery.trim()) return true;
                const q = stagesSearchQuery.toLowerCase();
                return (
                  st.label.toLowerCase().includes(q) ||
                  st.shortLabel.toLowerCase().includes(q) ||
                  (st.description && st.description.toLowerCase().includes(q))
                );
              }).map((st) => {
                const isSelected = selectedStages.some((s) => s.key === st.key);
                const isCompulsory = st.isCompulsory || st.key === 'ncert';

                return (
                  <div
                    key={st.key}
                    onClick={() => {
                      if (isCompulsory) return;
                      if (isSelected) {
                        setSelectedStages((prev) => prev.filter((s) => s.key !== st.key));
                      } else {
                        setSelectedStages((prev) => [...prev, st]);
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isCompulsory
                        ? 'bg-emerald-500/10 border-emerald-500/60 text-[var(--text-primary)] cursor-default'
                        : isSelected
                        ? 'bg-cyan-500/10 border-cyan-400/60 text-[var(--text-primary)] shadow-sm'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 border ${
                          isCompulsory
                            ? 'bg-emerald-500/20 border-emerald-500/40 shadow-sm'
                            : isSelected
                            ? 'bg-cyan-500/20 border-cyan-400/40 shadow-sm'
                            : 'bg-[var(--bg-card)] border-[var(--border-color)]'
                        }`}
                      >
                        {st.emoji || '📖'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs sm:text-sm text-[var(--text-primary)]">
                            {st.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                            {st.shortLabel}
                          </span>
                          {isCompulsory && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                              Compulsory ✓
                            </span>
                          )}
                        </div>
                        {st.description && (
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            <ExpandableText text={st.description} maxChars={80} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isCompulsory ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <Check className="w-5 h-5 text-emerald-400" />
                        </div>
                      ) : isSelected ? (
                        <CheckSquare className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Square className="w-5 h-5 text-[var(--text-muted)]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stage Validation Hint & Navigation Controls */}
            {selectedStages.length < 4 && (
              <div className="shrink-0 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-2 animate-pulse">
                <span>⚠️</span>
                <span>
                  Select at least 4 study references ({selectedStages.length}/4 chosen).
                </span>
              </div>
            )}

            <div className="shrink-0 flex items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPhase('syllabus')}
                className="px-3.5 py-2.5 sm:py-3 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={selectedStages.length < 4}
                onClick={() => {
                  if (selectedStages.length >= 4) {
                    setPhase('finished');
                  }
                }}
                className={`flex-1 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md ${
                  selectedStages.length >= 4
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-color)] cursor-not-allowed opacity-60'
                }`}
              >
                <span>Next: Completed Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Record Completed Work (Zero whole-screen scroll; only chapter list scrolls) */}
        {phase === 'finished' && (
          <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-[var(--border-color)] pb-2 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <span>Step 6: Record Previously Completed Work</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">
                Tap chapters you have already completed (scroll list below).
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
              {enrolledSubjects
                .filter((sub) => finishedSubjectFilter === 'all' || sub.id === finishedSubjectFilter)
                .map((sub) => {
                const subSyllabus = syllabusSelection[sub.id] || [];
                if (subSyllabus.length === 0) return null;

                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {getLocalizedSubjectName(sub.id, sub.name, currentLanguage)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sub.groups.flatMap((g) => g.chapters).filter((ch) => subSyllabus.includes(ch.id)).map((ch) => {
                        const isDone = finishedChapters[`${sub.id}:${ch.id}`];
                        return (
                          <div
                            key={ch.id}
                            onClick={() => toggleFinished(sub.id, ch.id)}
                            className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isDone
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-color)]/80'
                            }`}
                          >
                            <span className="break-words [overflow-wrap:anywhere] pr-1 flex-1">{getLocalizedChapterPrefix(currentLanguage)} {ch.no}: {getLocalizedChapterName(ch.id, ch.name, currentLanguage)}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${isDone ? 'bg-emerald-500 text-slate-950' : 'bg-[var(--bg-card)]'}`}>
                              {isDone ? 'Done ✓' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPhase('stages')}
                className="px-3 py-2.5 sm:py-3 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold cursor-pointer shrink-0"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setPhase('videotour')}
                className="px-3 py-2.5 sm:py-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-300" />
                <span>Guide</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[var(--accent-primary)] hover:opacity-95 text-[var(--text-inverse)] font-black text-xs sm:text-sm cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>Launch Dashboard 🚀</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Interactive Video Tour */}
        {phase === 'videotour' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
              <ManualVideoTour onProceedToDashboard={handleFinish} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
