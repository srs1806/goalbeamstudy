import React, { useState, useEffect, useRef } from 'react';
import {
  Profile,
  FontMode,
  LanguageMode,
  TrackerState,
  Subject,
  Chapter,
  ChapterGroup,
  MorningSoundType,
  StageDefinition,
} from '../types/tracker';
import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import {
  CATALOG_STAGES_OPTIONS,
  STAGE_EMOJI_OPTIONS,
  getProfileStages,
} from '../data/stagesCatalog';
import { getDynamicAcademicYear } from '../utils/academicYear';
import {
  Type,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckSquare,
  Square,
  Search,
  Globe,
  Bell,
  BellRing,
  User,
  Film,
  Save,
  Volume2,
  ExternalLink,
  X,
  Bookmark,
  Plus,
  RotateCcw,
  Users,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/translations';
import {
  getLocalizedSubjectName,
  getLocalizedGroupName,
  getLocalizedChapterName,
  getLocalizedChapterPrefix,
} from '../utils/chapterTranslations';
import { DEFAULT_SELECTED_SUBJECT_IDS } from '../utils/storage';
import {
  requestNotificationPermission,
  sendMorningStudyReminder,
  MORNING_SOUND_OPTIONS,
  playCustomMorningNotificationSound,
} from '../utils/notifications';
import { AutoGrowPromptInput, ExpandableText } from './ui/ResponsiveTextControls';
import { InfoTooltip } from './InfoTooltip';
import { YouTubeChannelButton } from './YouTubeChannelButton';
import { PWAInstallButton } from './PWAInstallButton';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';
import { ScholarBoyAvatar } from './ScholarBoyAvatar';

interface SettingsViewProps {
  profile: Profile;
  profiles?: Profile[];
  onSelectProfile?: (profileId: string) => void;
  onNewProfile?: () => void;
  currentFont: FontMode;
  onFontChange: (font: FontMode) => void;
  currentLanguage: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  onResetTracker: () => void;
  onOpenVideoTour?: () => void;
  onSimulateAutoReset?: () => void;
  onUpdatePomodoroMinutes?: (minutes: number) => void;
  onUpdateSelectedSubjects?: (subjectIds: string[]) => void;
  onUpdateProfile?: (profile: Profile) => void;
  onTriggerLaunchTransition?: () => void;
  onOpenSubjectChapters?: (subjectId: string) => void;
  onNavigateToFocus?: () => void;
  isIncompleteProfile?: boolean;
  onCompleteProfile?: () => void;
  trackerState?: TrackerState;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  profiles = [],
  onSelectProfile,
  onNewProfile,
  currentFont,
  onFontChange,
  currentLanguage,
  onLanguageChange,
  onResetTracker,
  onOpenVideoTour,
  onSimulateAutoReset,
  onUpdateSelectedSubjects,
  onUpdateProfile,
  isIncompleteProfile = false,
  onCompleteProfile,
}) => {
  const isGuestLocked = isIncompleteProfile || !profile?.id || profile.id === 'guest-preview';
  const [showProfileResetConfirm, setShowProfileResetConfirm] = useState(false);
  const triggerCompleteProfile = () => {
    onCompleteProfile?.();
  };

  // Toast alert notification
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setNotificationToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setNotificationToast(null);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Compact Profile Row / Drawer states (1 row desktop, 2 rows mobile + More dropdown)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeFeatureDrawer, setActiveFeatureDrawer] = useState<'goals' | 'alerts' | 'subjects' | 'more' | null>(null);
  const [subjectsSubTab, setSubjectsSubTab] = useState<'subjects' | 'stages'>('subjects');
  const [isMediumMenuOpen, setIsMediumMenuOpen] = useState(false);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ========================================================
  // 1. Scholar Profile Form State (Strictly CBSE Class 10)
  // ========================================================
  const [name, setName] = useState(profile.name || '');
  const board = 'CBSE';
  const [targetPercentage, setTargetPercentage] = useState(profile.targetPercentage || 95);
  const [firstPaperDate, setFirstPaperDate] = useState(profile.firstPaperDate || '15/02/2027');
  const [dailyHourGoal, setDailyHourGoal] = useState(profile.dailyHourGoal || 4);

  useEffect(() => {
    setName(profile.name || '');
    setTargetPercentage(profile.targetPercentage || 95);
    setFirstPaperDate(profile.firstPaperDate || '15/02/2027');
    setDailyHourGoal(profile.dailyHourGoal || 4);
  }, [profile.id, profile.name, profile.targetPercentage, profile.firstPaperDate, profile.dailyHourGoal]);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onUpdateProfile) return;

    const trimmedName = name.trim() || 'Class 10 Scholar';
    try {
      localStorage.setItem('zenith_student_name', trimmedName);
    } catch {}
    const updated: Profile = {
      ...profile,
      name: trimmedName,
      board: 'CBSE',
      targetPercentage: Math.max(50, Math.min(100, Number(targetPercentage) || 95)),
      firstPaperDate: firstPaperDate.trim() || '15/02/2027',
      dailyHourGoal: Math.max(1, Math.min(16, Number(dailyHourGoal) || 4)),
    };

    onUpdateProfile(updated);
    setActiveFeatureDrawer(null);
    showToast('Scholar profile saved ✓');
  };

  // ========================================================
  // 2. Daily Study Target Notifications & Custom Sound
  // ========================================================
  const [reminderEnabled, setReminderEnabled] = useState(
    profile.notificationSettings?.enabled !== false
  );
  const [reminderSound, setReminderSound] = useState<MorningSoundType>(
    profile.notificationSettings?.soundType || 'zenith-symphony'
  );

  useEffect(() => {
    setReminderEnabled(profile.notificationSettings?.enabled !== false);
    setReminderSound(profile.notificationSettings?.soundType || 'zenith-symphony');
  }, [
    profile.notificationSettings?.enabled,
    profile.notificationSettings?.soundType,
  ]);

  const handleToggleReminder = async (newEnabled: boolean) => {
    setReminderEnabled(newEnabled);
    if (newEnabled) {
      await requestNotificationPermission();
      playCustomMorningNotificationSound(reminderSound);
      showToast('Daily study notifications active 🔔');
    } else {
      showToast('Daily study notifications turned off.');
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        notificationSettings: {
          ...profile.notificationSettings,
          enabled: newEnabled,
          morningReminderTime: profile.notificationSettings?.morningReminderTime || '05:00',
          soundType: reminderSound,
        },
      });
    }
  };

  const handleReminderSoundChange = (newSound: MorningSoundType) => {
    setReminderSound(newSound);
    playCustomMorningNotificationSound(newSound);
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        notificationSettings: {
          ...profile.notificationSettings,
          enabled: reminderEnabled,
          morningReminderTime: profile.notificationSettings?.morningReminderTime || '05:00',
          soundType: newSound,
        },
      });
    }
    const label = MORNING_SOUND_OPTIONS.find((o) => o.id === newSound)?.name || newSound;
    showToast(`Notification sound set to ${label} 🔊`);
  };

  const handleTestMorningReminder = async () => {
    await sendMorningStudyReminder(profile, currentLanguage, true, 'screens');
    showToast('Notification preview launched 🔔');
  };

  // ========================================================
  // 3. Enrolled CBSE Subjects & Chapter Checkbox Picker
  // ========================================================
  const enrolledSubjectIds = Array.isArray(profile.selectedSubjectIds)
    ? profile.selectedSubjectIds
    : DEFAULT_SELECTED_SUBJECT_IDS;

  const [chapterPickerSubject, setChapterPickerSubject] = useState<Subject | null>(null);
  const [tempSelectedChapterIds, setTempSelectedChapterIds] = useState<string[]>([]);
  const [settingsSubjectSearch, setSettingsSubjectSearch] = useState('');
  const [settingsMediumSearch, setSettingsMediumSearch] = useState('');
  const [subjectStreamTab, setSubjectStreamTab] = useState<'all' | 'core' | 'language' | 'elective' | 'skill'>('all');
  const [modalChapterSearch, setModalChapterSearch] = useState('');
  const [catalogSearchLoading, setCatalogSearchLoading] = useState(false);
  const [catalogSearchPanel, setCatalogSearchPanel] = useState<{
    section: 'subjects' | 'boards' | 'languages';
    summary: string;
    pdfLinks: Array<{ title: string; url: string; isPdf?: boolean }>;
  } | null>(null);

  const handleSettingsGoogleCatalogSearch = async (
    section: 'subjects' | 'boards' | 'languages',
    customQuery?: string
  ) => {
    setCatalogSearchLoading(true);
    try {
      const res = await fetch('/api/search-education-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: section,
          board,
          query: customQuery || '',
        }),
      });
      const data = await res.json();
      setCatalogSearchPanel({
        section,
        summary: data.summary || '',
        pdfLinks: Array.isArray(data.pdfLinks) ? data.pdfLinks : [],
      });
    } catch {
      setCatalogSearchPanel({
        section,
        summary: 'Verified CBSE Class 10 official syllabus & NCERT academic portals.',
        pdfLinks: [
          { title: 'CBSE Class 10 Official Curriculum Portal', url: 'https://cbseacademic.nic.in/curriculum_2027.html', isPdf: false },
          { title: 'NCERT Official Textbooks Portal', url: 'https://ncert.nic.in/textbook.php', isPdf: false },
        ],
      });
    } finally {
      setCatalogSearchLoading(false);
    }
  };

  const getWebSyllabusSearchUrl = (queryText?: string, subjectObj?: Subject) => {
    const subContext = subjectObj ? `${subjectObj.name} (Code ${subjectObj.code})` : '';
    const searchTerm = (queryText || settingsSubjectSearch || modalChapterSearch || '').trim();
    const fullQuery = encodeURIComponent(
      `${board} Class 10 ${subContext} ${searchTerm || 'Official Rationalized Syllabus Curriculum PDF'} site:cbseacademic.nic.in OR site:ncert.nic.in`
    );
    return `https://www.google.com/search?q=${fullQuery}`;
  };

  const handleSubjectClick = (sub: Subject) => {
    const isEnrolled = enrolledSubjectIds.includes(sub.id);

    if (isEnrolled) {
      if (enrolledSubjectIds.length <= 1) {
        showToast('At least 1 CBSE subject must remain active.');
        return;
      }
      const updatedSubjectIds = enrolledSubjectIds.filter((id) => id !== sub.id);
      const updatedSyllabus = { ...profile.examSyllabus, [sub.id]: [] };

      if (onUpdateProfile) {
        onUpdateProfile({
          ...profile,
          selectedSubjectIds: updatedSubjectIds,
          examSyllabus: updatedSyllabus,
        });
      } else {
        onUpdateSelectedSubjects?.(updatedSubjectIds);
      }
      showToast(`${sub.name} turned OFF.`);
    } else {
      const allChIds = sub.groups.flatMap((g) => g.chapters.map((c) => c.id));
      const existing = profile.examSyllabus[sub.id];
      const initialSelection = existing && existing.length > 0 ? existing : allChIds;
      setTempSelectedChapterIds(initialSelection);
      setChapterPickerSubject(sub);
    }
  };

  const handleEditChaptersOnly = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    const allChIds = sub.groups.flatMap((g) => g.chapters.map((c) => c.id));
    const existing = profile.examSyllabus[sub.id];
    setTempSelectedChapterIds(existing && existing.length > 0 ? existing : allChIds);
    setChapterPickerSubject(sub);
  };

  const handleToggleChapterCheckbox = (chId: string) => {
    setTempSelectedChapterIds((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId]
    );
  };

  const handleSelectAllChaptersInModal = () => {
    if (!chapterPickerSubject) return;
    const allIds = chapterPickerSubject.groups.flatMap((g) => g.chapters.map((c) => c.id));
    setTempSelectedChapterIds(allIds);
  };

  const handleDeselectAllChaptersInModal = () => {
    setTempSelectedChapterIds([]);
  };

  const handleSaveChaptersAndEnable = () => {
    if (!chapterPickerSubject) return;
    if (tempSelectedChapterIds.length === 0) {
      showToast('Please select at least 1 chapter.');
      return;
    }

    const updatedSubjectIds = Array.from(new Set([...enrolledSubjectIds, chapterPickerSubject.id]));
    const updatedSyllabus = {
      ...profile.examSyllabus,
      [chapterPickerSubject.id]: tempSelectedChapterIds,
    };

    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        selectedSubjectIds: updatedSubjectIds,
        examSyllabus: updatedSyllabus,
      });
    } else {
      onUpdateSelectedSubjects?.(updatedSubjectIds);
    }

    const subName = chapterPickerSubject.name;
    const count = tempSelectedChapterIds.length;
    setChapterPickerSubject(null);
    showToast(`${subName} saved with ${count} chapters ✓`);
  };

  const handleSelectCoreSubjects = () => {
    const core = DEFAULT_SELECTED_SUBJECT_IDS;
    const updatedSyllabus = { ...profile.examSyllabus };
    CLASS_10_SUBJECTS.forEach((sub) => {
      if (core.includes(sub.id) && (!updatedSyllabus[sub.id] || updatedSyllabus[sub.id].length === 0)) {
        updatedSyllabus[sub.id] = sub.groups.flatMap((g) => g.chapters.map((c) => c.id));
      }
    });
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        selectedSubjectIds: core,
        examSyllabus: updatedSyllabus,
      });
    } else {
      onUpdateSelectedSubjects?.(core);
    }
    showToast('Reset to 5 core subjects ✓');
  };

  const handleSelectAllSubjects = () => {
    const all = CLASS_10_SUBJECTS.map((s) => s.id);
    const updatedSyllabus = { ...profile.examSyllabus };
    CLASS_10_SUBJECTS.forEach((sub) => {
      if (!updatedSyllabus[sub.id] || updatedSyllabus[sub.id].length === 0) {
        updatedSyllabus[sub.id] = sub.groups.flatMap((g) => g.chapters.map((c) => c.id));
      }
    });
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        selectedSubjectIds: all,
        examSyllabus: updatedSyllabus,
      });
    } else {
      onUpdateSelectedSubjects?.(all);
    }
    showToast(`All ${all.length} subjects selected ✓`);
  };

  // ========================================================
  // 4. Font Options
  // ========================================================
  const fontOptions: Array<{ key: FontMode; name: string; tag: string; sample: string; fontFamily: string }> = [
    { key: 'sans', name: 'Inter Clean', tag: 'Modern Sans', sample: 'Class 10 CBSE Board Mastery', fontFamily: 'Inter, sans-serif' },
    { key: 'cursive', name: 'Caveat Notes', tag: 'Topper Notes', sample: 'CBSE 10th Handwriting Formulae', fontFamily: 'Caveat, cursive' },
    { key: 'dancing', name: 'Dancing Script', tag: 'Calligraphy', sample: 'Toppers Vault Signature 100%', fontFamily: '"Dancing Script", cursive' },
    { key: 'serif', name: 'Lora Classical', tag: 'NCERT Textbook', sample: 'Theorem 1.1 Fundamental Arithmetic', fontFamily: 'Lora, serif' },
    { key: 'mono', name: 'JetBrains Code', tag: 'STEM / Coding', sample: 'def cbse_target(): return 100', fontFamily: '"JetBrains Mono", monospace' },
    { key: 'rounded', name: 'Quicksand Rounded', tag: 'Youth Focus', sample: 'Daily 4-Hour Focused Study Habit', fontFamily: 'Quicksand, sans-serif' },
    { key: 'display', name: 'Outfit Editorial', tag: 'Syllabus Matrix', sample: '7 Stages Milestones Completed', fontFamily: 'Outfit, sans-serif' },
  ];

  const handleFontSelect = (key: FontMode) => {
    onFontChange(key);
    setIsFontMenuOpen(false);
    const label = fontOptions.find((f) => f.key === key)?.name || key;
    showToast(`Font updated to ${label} ✓`);
  };

  // ========================================================
  // 5. Language Selection
  // ========================================================
  const handleLanguageSelect = (lang: LanguageMode) => {
    onLanguageChange(lang);
    setIsMediumMenuOpen(false);
    showToast(`Study medium set to ${SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.name} ✓`);
  };

  // ========================================================
  // 6. Study References & Completion Stages Management
  // ========================================================
  const [selectedStages, setSelectedStages] = useState<StageDefinition[]>(() => {
    return getProfileStages(profile);
  });
  const [stagesSearchQuery, setStagesSearchQuery] = useState('');
  const [isAddCustomStageOpen, setIsAddCustomStageOpen] = useState(false);
  const [customStageName, setCustomStageName] = useState('');
  const [customStageShortLabel, setCustomStageShortLabel] = useState('');
  const [customStageEmoji, setCustomStageEmoji] = useState('📌');
  const [customStageDesc, setCustomStageDesc] = useState('');
  const [customStagesList, setCustomStagesList] = useState<StageDefinition[]>(() => {
    if (profile?.selectedStages) {
      const defaultKeys = new Set(CATALOG_STAGES_OPTIONS.map((s) => s.key));
      return profile.selectedStages.filter((s) => !defaultKeys.has(s.key));
    }
    return [];
  });

  useEffect(() => {
    setSelectedStages(getProfileStages(profile));
  }, [profile.id, profile.selectedStages]);

  const handleToggleStage = (st: StageDefinition) => {
    if (st.isCompulsory || st.key === 'ncert') {
      showToast('NCERT is compulsory and cannot be removed.');
      return;
    }
    const isSelected = selectedStages.some((s) => s.key === st.key);
    if (isSelected) {
      if (selectedStages.length <= 4) {
        showToast('Minimum 4 study references are required.');
        return;
      }
      const updated = selectedStages.filter((s) => s.key !== st.key);
      setSelectedStages(updated);
      if (onUpdateProfile) {
        onUpdateProfile({ ...profile, selectedStages: updated });
      }
      showToast(`Removed "${st.shortLabel}"`);
    } else {
      const updated = [...selectedStages, st];
      setSelectedStages(updated);
      if (onUpdateProfile) {
        onUpdateProfile({ ...profile, selectedStages: updated });
      }
      showToast(`Added "${st.shortLabel}" ✓`);
    }
  };

  const handleAddCustomStage = () => {
    if (!customStageName.trim()) {
      showToast('Please enter a name for your custom reference.');
      return;
    }
    const newKey = `custom_${Date.now()}`;
    const newStage: StageDefinition = {
      key: newKey,
      label: customStageName.trim(),
      shortLabel: customStageShortLabel.trim() || customStageName.trim().slice(0, 10),
      description: customStageDesc.trim() || customStageName.trim(),
      emoji: customStageEmoji || '📌',
      icon: 'Bookmark',
    };
    const updatedCustom = [...customStagesList, newStage];
    const updatedSelected = [...selectedStages, newStage];
    setCustomStagesList(updatedCustom);
    setSelectedStages(updatedSelected);
    if (onUpdateProfile) {
      onUpdateProfile({ ...profile, selectedStages: updatedSelected });
    }
    setCustomStageName('');
    setCustomStageShortLabel('');
    setCustomStageDesc('');
    setIsAddCustomStageOpen(false);
    showToast(`Added "${newStage.shortLabel}" ✓`);
  };

  // Derived concise summaries for compact triggers
  const enrolledSubjects = CLASS_10_SUBJECTS.filter((s) => enrolledSubjectIds.includes(s.id));
  const totalActiveChapters = enrolledSubjects.reduce(
    (sum, s) => sum + (profile.examSyllabus[s.id]?.length || 0),
    0
  );
  const activeLanguageObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const activeFontObj = fontOptions.find((f) => f.key === currentFont) || fontOptions[0];
  const activeSoundName =
    MORNING_SOUND_OPTIONS.find((o) => o.id === reminderSound)?.name || 'Custom Chime';

  return (
    <div className="space-y-3 pb-16 animate-in fade-in min-w-0 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {notificationToast && (
        <div className="fixed top-16 right-3 left-3 sm:left-auto sm:right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 text-xs font-bold max-w-sm sm:max-w-md ml-auto animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-100 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* ========================================================
          1. COMPACT PROFILE HERO & ACCOUNT ACTION BAR
         ======================================================== */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Identity Summary */}
          <div className="flex items-center gap-3 min-w-0">
            <ScholarBoyAvatar size="md" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] truncate leading-tight">
                  {isGuestLocked ? 'Edit Profile' : profile.name}
                </h1>
                <InfoTooltip text="Switch scholar profiles, add a new profile, or open any dropdown below to update your goals, subjects, study medium & alerts." />
              </div>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                {isGuestLocked ? (
                  <span>Complete setup to unlock personalized goals, switching &amp; sync</span>
                ) : (
                  <>
                    <span className="font-semibold text-[var(--text-primary)]">Target {profile.targetPercentage}%</span>
                    <span aria-hidden="true">·</span>
                    <span>{profile.dailyHourGoal || 4}h/day</span>
                    <span aria-hidden="true">·</span>
                    <span>{enrolledSubjectIds.length} Subjects</span>
                    <span aria-hidden="true">·</span>
                    <span>1st Paper {profile.firstPaperDate || '15/02/2027'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Compact Action Strip: Profile Switcher Dropdown + Add New + Reset */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {profiles.length > 1 && onSelectProfile && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:border-cyan-400 border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Switch ({profiles.length})</span>
                  {isProfileMenuOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                  )}
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute left-0 md:left-auto md:right-0 top-full mt-1.5 w-60 max-w-[calc(100vw-2.5rem)] max-h-[60dvh] overflow-y-auto rounded-xl bg-[var(--bg-card)] border border-[var(--accent-primary)] shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95">
                    {profiles.map((p) => {
                      const isActive = !isGuestLocked && p.id === profile.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSelectProfile(p.id);
                            setIsProfileMenuOpen(false);
                            showToast(`Switched profile to ${p.name} ✓`);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-extrabold'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-semibold'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="block truncate">{p.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-normal tabular-nums block">
                              Target {p.targetPercentage}% · {p.dailyHourGoal || 4}h/day
                            </span>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {onNewProfile && (
              <button
                type="button"
                onClick={onNewProfile}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Add Profile</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowProfileResetConfirm(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Tracker Confirmation Modal */}
      {showProfileResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[var(--bg-card)] border-2 border-rose-500/60 rounded-2xl shadow-2xl p-5 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-400">
              <RotateCcw className="w-5 h-5 shrink-0 text-rose-400" />
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                Reset Study Tracker?
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              This will clear completed milestones and return directly to <strong>Step 1</strong> of setup.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowProfileResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileResetConfirm(false);
                  onResetTracker();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-95 text-white text-xs font-extrabold cursor-pointer shadow-md"
              >
                Yes, Reset to Step 1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. 1-ROW (DESKTOP) / 2-ROW (MOBILE) FEATURE BAR + DROPDOWN
         ======================================================== */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Slot 1: Profile & Goals */}
          <button
            type="button"
            onClick={() => {
              if (isGuestLocked) {
                triggerCompleteProfile();
                return;
              }
              setActiveFeatureDrawer((prev) => (prev === 'goals' ? null : 'goals'));
            }}
            aria-expanded={activeFeatureDrawer === 'goals'}
            className={`px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border text-left transition-colors shadow-sm flex items-center justify-between gap-2 cursor-pointer min-w-0 ${
              activeFeatureDrawer === 'goals'
                ? 'border-cyan-400/80 ring-1 ring-cyan-400/30'
                : 'border-[var(--border-color)] hover:border-cyan-400/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                  Profile &amp; Goals
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block truncate tabular-nums">
                  {targetPercentage}% · {dailyHourGoal}h/day
                </span>
              </div>
            </div>
            <span className="text-cyan-400 shrink-0">
              {activeFeatureDrawer === 'goals' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {/* Slot 2: Study Notifications & Sound */}
          <div
            className={`px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border transition-colors shadow-sm flex items-center justify-between gap-1.5 min-w-0 ${
              activeFeatureDrawer === 'alerts'
                ? 'border-amber-400/80 ring-1 ring-amber-400/30'
                : 'border-[var(--border-color)] hover:border-amber-400/50'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (isGuestLocked) {
                  triggerCompleteProfile();
                  return;
                }
                setActiveFeatureDrawer((prev) => (prev === 'alerts' ? null : 'alerts'));
              }}
              aria-expanded={activeFeatureDrawer === 'alerts'}
              className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                {reminderEnabled ? <BellRing className="w-4 h-4 text-emerald-400" /> : <Bell className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                  Alerts &amp; Chime
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block truncate">
                  {reminderEnabled ? 'Active' : 'Paused'} · {activeSoundName}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isGuestLocked) {
                  triggerCompleteProfile();
                  return;
                }
                void handleToggleReminder(!reminderEnabled);
              }}
              className={`w-8 h-4.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 ${
                reminderEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
              title={reminderEnabled ? 'Turn notifications off' : 'Turn notifications on'}
              aria-label="Toggle study notifications"
            >
              <div className="bg-white w-3.5 h-3.5 rounded-full shadow-sm" />
            </button>
          </div>

          {/* Slot 3: CBSE Subjects & Study Stages */}
          <button
            type="button"
            onClick={() => {
              if (isGuestLocked) {
                triggerCompleteProfile();
                return;
              }
              setActiveFeatureDrawer((prev) => (prev === 'subjects' ? null : 'subjects'));
            }}
            aria-expanded={activeFeatureDrawer === 'subjects'}
            className={`px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border text-left transition-colors shadow-sm flex items-center justify-between gap-2 cursor-pointer min-w-0 ${
              activeFeatureDrawer === 'subjects'
                ? 'border-indigo-400/80 ring-1 ring-indigo-400/30'
                : 'border-[var(--border-color)] hover:border-indigo-400/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                  Subjects &amp; Stages
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block truncate tabular-nums">
                  {enrolledSubjectIds.length} Subj · {selectedStages.length} Stages
                </span>
              </div>
            </div>
            <span className="text-indigo-400 shrink-0">
              {activeFeatureDrawer === 'subjects' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {/* Slot 4: Dropdown Option for All Exceeding Features */}
          <button
            type="button"
            onClick={() => setActiveFeatureDrawer((prev) => (prev === 'more' ? null : 'more'))}
            aria-expanded={activeFeatureDrawer === 'more'}
            className={`px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border text-left transition-colors shadow-sm flex items-center justify-between gap-2 cursor-pointer min-w-0 ${
              activeFeatureDrawer === 'more'
                ? 'border-emerald-400/80 ring-1 ring-emerald-400/30'
                : 'border-[var(--border-color)] hover:border-emerald-400/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                  More Options
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block truncate">
                  Language · Fonts · Guide · App
                </span>
              </div>
            </div>
            <span className="text-emerald-400 shrink-0">
              {activeFeatureDrawer === 'more' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>
        </div>

        {/* ========================================================
            EXPANDED DRAWER AREA FOR SELECTED SLOT
           ======================================================== */}
        {activeFeatureDrawer === 'goals' && (() => {
          const goalsPanel = (
            <form
              onSubmit={handleSaveProfile}
              className="rounded-xl bg-[var(--bg-card)] border border-cyan-400/60 p-4 space-y-3 shadow-md animate-in fade-in"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                  Scholar Profile &amp; Board Goals
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFeatureDrawer(null)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Close Profile & Goals"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">
                    Scholar Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-cyan-400 text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">
                    Target Score (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-cyan-400 text-xs font-semibold text-[var(--text-primary)] tabular-nums focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">
                    1st Paper (DD/MM/YYYY)
                  </label>
                  <input
                    type="text"
                    value={firstPaperDate}
                    onChange={(e) => setFirstPaperDate(e.target.value)}
                    placeholder="15/02/2027"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-cyan-400 text-xs font-mono font-semibold text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">
                    Daily Goal (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={dailyHourGoal}
                    onChange={(e) => setDailyHourGoal(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-cyan-400 text-xs font-semibold text-[var(--text-primary)] tabular-nums focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:opacity-90 text-[var(--text-inverse)] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm whitespace-nowrap shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          );

          return isGuestLocked ? (
            <LockedFeatureOverlay
              variant="compact"
              featureLabel="Scholar Profile"
              onCompleteProfile={triggerCompleteProfile}
            >
              {goalsPanel}
            </LockedFeatureOverlay>
          ) : (
            goalsPanel
          );
        })()}

        {activeFeatureDrawer === 'alerts' && (() => {
          const alertsPanel = (
            <div className="rounded-xl bg-[var(--bg-card)] border border-amber-400/60 p-4 space-y-3 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                  Study Notifications &amp; Sound Chime
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFeatureDrawer(null)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Close Notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-[var(--border-color)]">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] whitespace-nowrap shrink-0">
                    Sound Chime
                  </label>
                  <select
                    value={reminderSound}
                    onChange={(e) => handleReminderSoundChange(e.target.value as MorningSoundType)}
                    className="flex-1 min-w-0 bg-transparent text-xs font-bold text-cyan-300 cursor-pointer focus:outline-none"
                  >
                    {MORNING_SOUND_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => playCustomMorningNotificationSound(reminderSound)}
                    className="p-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 cursor-pointer shrink-0"
                    title="Test notification sound"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Daily targets at 5:00 AM
                  </span>
                  <button
                    type="button"
                    onClick={handleTestMorningReminder}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 hover:opacity-95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Preview Alert</span>
                  </button>
                </div>
              </div>
            </div>
          );

          return isGuestLocked ? (
            <LockedFeatureOverlay
              variant="compact"
              featureLabel="Notifications"
              onCompleteProfile={triggerCompleteProfile}
            >
              {alertsPanel}
            </LockedFeatureOverlay>
          ) : (
            alertsPanel
          );
        })()}

        {activeFeatureDrawer === 'subjects' && (() => {
          const subjectsPanel = (
            <div className="rounded-xl bg-[var(--bg-card)] border border-indigo-400/60 p-4 space-y-3 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setSubjectsSubTab('subjects')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      subjectsSubTab === 'subjects'
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    CBSE Subjects ({enrolledSubjectIds.length}/{CLASS_10_SUBJECTS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectsSubTab('stages')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      subjectsSubTab === 'stages'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Study References ({selectedStages.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFeatureDrawer(null)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Close Subjects & Stages"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {subjectsSubTab === 'subjects' ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSelectCoreSubjects}
                        className="text-[10px] font-bold text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 px-2 py-1 rounded-md border border-indigo-500/30 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        5 Core
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectAllSubjects}
                        className="text-[10px] font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-500/15 px-2 py-1 rounded-md border border-cyan-500/30 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        All {CLASS_10_SUBJECTS.length}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">
                        {totalActiveChapters} Exam Chapters
                      </span>
                      <a
                        href={getWebSyllabusSearchUrl(settingsSubjectSearch)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 px-2 py-1 rounded-md border border-cyan-500/30 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Web Syllabus</span>
                      </a>
                    </div>
                  </div>

                  {/* Active Enrolled Subjects Compact Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {enrolledSubjects.map((sub) => {
                      const chCount = (profile.examSyllabus[sub.id] || []).length;
                      return (
                        <div
                          key={sub.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/35 text-[11px]"
                        >
                          <button
                            type="button"
                            onClick={() => handleSubjectClick(sub)}
                            className="flex items-center gap-1 font-bold text-[var(--text-primary)] hover:text-rose-300 cursor-pointer"
                            title={`Click to turn OFF ${sub.name}`}
                          >
                            <CheckSquare className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{getLocalizedSubjectName(sub.id, sub.name, currentLanguage)}</span>
                            <span className="text-[10px] text-emerald-400 font-mono tabular-nums">({chCount})</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              setModalChapterSearch('');
                              handleEditChaptersOnly(e, sub);
                            }}
                            className="text-[10px] px-1 rounded bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 font-bold cursor-pointer"
                            title={`Edit exam chapters for ${sub.name}`}
                          >
                            ✏️
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Search + Google Search PDFs */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1 min-w-0">
                      <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2 pointer-events-none" />
                      <AutoGrowPromptInput
                        value={settingsSubjectSearch}
                        onValueChange={setSettingsSubjectSearch}
                        placeholder={`Search ${CLASS_10_SUBJECTS.length} subjects or code (086, 041)...`}
                        maxHeightPx={80}
                        ariaLabel="Search CBSE subjects"
                        className="w-full pl-8 pr-6 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                      />
                      {settingsSubjectSearch && (
                        <button
                          type="button"
                          onClick={() => setSettingsSubjectSearch('')}
                          className="absolute right-2 top-1.5 text-[10px] text-[var(--text-secondary)] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSettingsGoogleCatalogSearch('subjects', settingsSubjectSearch)}
                      disabled={catalogSearchLoading}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{catalogSearchLoading ? '...' : 'PDFs'}</span>
                    </button>
                  </div>

                  {/* Stream Tabs */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {([
                      { id: 'all', label: `All (${CLASS_10_SUBJECTS.length})` },
                      { id: 'core', label: 'Core' },
                      { id: 'language', label: 'Languages' },
                      { id: 'elective', label: 'Electives' },
                      { id: 'skill', label: 'Skill' },
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSubjectStreamTab(tab.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer border whitespace-nowrap ${
                          subjectStreamTab === tab.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {catalogSearchPanel?.section === 'subjects' && (
                    <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-cyan-500/30 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400 text-[10px]">Verified Syllabus PDFs</span>
                        <button
                          type="button"
                          onClick={() => setCatalogSearchPanel(null)}
                          className="text-[10px] text-[var(--text-muted)] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[var(--text-secondary)]">{catalogSearchPanel.summary}</p>
                      {catalogSearchPanel.pdfLinks.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {catalogSearchPanel.pdfLinks.slice(0, 4).map((lnk, idx) => (
                            <a
                              key={idx}
                              href={lnk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 border bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                            >
                              <span className="truncate max-w-[180px]">{lnk.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scrollable Subjects List */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {CLASS_10_SUBJECTS.filter((sub) => {
                      const codeNum = Number(sub.code);
                      const isSkill = codeNum >= 400;
                      const isElective = [
                        'computer_applications',
                        'home_science',
                        'painting',
                        'elements_business_154',
                        'book_keeping_254',
                        'carnatic_music_031',
                        'hindustani_music_034',
                        'ncc_076',
                      ].includes(sub.id);
                      const isCore = ['science', 'maths', 'maths_basic', 'sst', 'english'].includes(sub.id);
                      if (subjectStreamTab === 'core' && !isCore) return false;
                      if (subjectStreamTab === 'skill' && !isSkill) return false;
                      if (subjectStreamTab === 'elective' && !isElective) return false;
                      if (subjectStreamTab === 'language' && (isCore || isSkill || isElective)) return false;

                      if (!settingsSubjectSearch.trim()) return true;
                      const q = settingsSubjectSearch.toLowerCase();
                      return (
                        sub.name.toLowerCase().includes(q) ||
                        sub.code.toLowerCase().includes(q) ||
                        sub.description.toLowerCase().includes(q) ||
                        sub.groups.some((g) => g.chapters.some((c) => c.name.toLowerCase().includes(q)))
                      );
                    }).map((sub) => {
                      const isEnrolled = enrolledSubjectIds.includes(sub.id);
                      const selectedChaptersCount = (profile.examSyllabus[sub.id] || []).length;
                      const totalCh = sub.groups.reduce((acc, g) => acc + g.chapters.length, 0);

                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setModalChapterSearch('');
                            handleSubjectClick(sub);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isEnrolled
                              ? 'bg-emerald-500/10 border-emerald-500/45 text-[var(--text-primary)]'
                              : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isEnrolled ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold block truncate">
                                {getLocalizedSubjectName(sub.id, sub.name, currentLanguage)}{' '}
                                <span className="text-[10px] font-mono opacity-75">({sub.code})</span>
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] block tabular-nums">
                                {isEnrolled ? `${selectedChaptersCount}/${totalCh} Ch Active` : `${totalCh} Ch`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isEnrolled ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  setModalChapterSearch('');
                                  handleEditChaptersOnly(e, sub);
                                }}
                                className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 px-1.5 py-0.5 rounded border border-cyan-500/30 cursor-pointer whitespace-nowrap"
                              >
                                Edit Ch
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-cyan-400 whitespace-nowrap">+ Select</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Search & Add Custom Trigger */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1 min-w-0">
                      <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2 pointer-events-none" />
                      <AutoGrowPromptInput
                        value={stagesSearchQuery}
                        onValueChange={setStagesSearchQuery}
                        placeholder="Search NCERT, PYQ, Exemplar..."
                        maxHeightPx={80}
                        ariaLabel="Search study references"
                        className="w-full pl-8 pr-6 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                      />
                      {stagesSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setStagesSearchQuery('')}
                          className="absolute right-2 top-1.5 text-[10px] text-[var(--text-secondary)] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomStageOpen((v) => !v)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Custom</span>
                    </button>
                  </div>

                  {/* Custom Reference Form */}
                  {isAddCustomStageOpen && (
                    <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-cyan-400/50 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-cyan-300">Add Custom Reference</span>
                        <button
                          type="button"
                          onClick={() => setIsAddCustomStageOpen(false)}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <AutoGrowPromptInput
                          value={customStageName}
                          onValueChange={setCustomStageName}
                          placeholder="Full name (e.g. Topper Notes)"
                          maxHeightPx={72}
                          ariaLabel="Custom reference name"
                          className="w-full px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                        />
                        <AutoGrowPromptInput
                          value={customStageShortLabel}
                          onValueChange={setCustomStageShortLabel}
                          placeholder="Short badge (e.g. Notes)"
                          maxHeightPx={72}
                          ariaLabel="Custom reference short badge"
                          className="w-full px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-wrap max-h-16 overflow-y-auto p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)]">
                        {STAGE_EMOJI_OPTIONS.map((emo) => (
                          <button
                            key={emo}
                            type="button"
                            onClick={() => setCustomStageEmoji(emo)}
                            className={`w-6 h-6 rounded text-sm flex items-center justify-center cursor-pointer ${
                              customStageEmoji === emo ? 'bg-cyan-500/25 border border-cyan-400' : 'hover:bg-[var(--bg-elevated)]'
                            }`}
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                      <AutoGrowPromptInput
                        value={customStageDesc}
                        onValueChange={setCustomStageDesc}
                        placeholder="Brief description (optional)..."
                        maxHeightPx={72}
                        ariaLabel="Brief description"
                        className="w-full px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={handleAddCustomStage}
                          className="px-3 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                        >
                          Add Reference
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scrollable References List */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {[...CATALOG_STAGES_OPTIONS, ...customStagesList]
                      .filter((st, index, self) => {
                        if (self.findIndex((s) => s.key === st.key) !== index) return false;
                        if (!stagesSearchQuery.trim()) return true;
                        const q = stagesSearchQuery.toLowerCase();
                        return (
                          st.label.toLowerCase().includes(q) ||
                          st.shortLabel.toLowerCase().includes(q) ||
                          (st.description && st.description.toLowerCase().includes(q))
                        );
                      })
                      .map((st) => {
                        const isSelected = selectedStages.some((s) => s.key === st.key);
                        const isCompulsory = st.isCompulsory || st.key === 'ncert';

                        return (
                          <div
                            key={st.key}
                            onClick={() => handleToggleStage(st)}
                            className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isCompulsory
                                ? 'bg-emerald-500/10 border-emerald-500/45 text-[var(--text-primary)] cursor-default'
                                : isSelected
                                ? 'bg-cyan-500/10 border-cyan-400/50 text-[var(--text-primary)]'
                                : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-sm shrink-0">{st.emoji || '📖'}</span>
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-xs text-[var(--text-primary)] block truncate">
                                  {st.label}{' '}
                                  <span className="text-[10px] font-mono text-[var(--text-muted)]">({st.shortLabel})</span>
                                </span>
                                {st.description && (
                                  <div className="text-[10px] text-[var(--text-muted)]">
                                    <ExpandableText text={st.description} maxChars={64} />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                              {isCompulsory ? (
                                <span className="text-[10px] font-bold text-emerald-400">Required</span>
                              ) : isSelected ? (
                                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );

          return isGuestLocked ? (
            <LockedFeatureOverlay
              variant="compact"
              featureLabel="Subjects & Study Stages"
              onCompleteProfile={triggerCompleteProfile}
            >
              {subjectsPanel}
            </LockedFeatureOverlay>
          ) : (
            subjectsPanel
          );
        })()}

        {/* DROPDOWN PANEL FOR EXCEEDING FEATURES: Language, Fonts, Guide, YouTube, Offline App & Session */}
        {activeFeatureDrawer === 'more' && (
          <div className="rounded-xl bg-[var(--bg-card)] border border-emerald-400/60 p-4 space-y-3 shadow-md animate-in fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                Additional Preferences &amp; Tools
              </span>
              <button
                type="button"
                onClick={() => setActiveFeatureDrawer(null)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Close More Options"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 items-start">
              {/* Study Medium (Textbook Language) */}
              <div
                className={`rounded-xl bg-[var(--bg-elevated)] border transition-colors ${
                  isMediumMenuOpen ? 'border-cyan-400/70' : 'border-[var(--border-color)] hover:border-cyan-400/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsMediumMenuOpen((v) => !v)}
                  aria-expanded={isMediumMenuOpen}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] block truncate">
                        Study Medium (Textbook Language)
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)] block truncate tabular-nums">
                        {activeLanguageObj.flag} {activeLanguageObj.name} · {SUPPORTED_LANGUAGES.length} Languages
                      </span>
                    </div>
                  </div>
                  <span className="text-sky-400 shrink-0">
                    {isMediumMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isMediumMenuOpen && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-[var(--border-color)] space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1 min-w-0">
                        <Search className="w-3.5 h-3.5 text-sky-400 absolute left-2.5 top-2 pointer-events-none" />
                        <AutoGrowPromptInput
                          value={settingsMediumSearch}
                          onValueChange={setSettingsMediumSearch}
                          placeholder="Filter language..."
                          maxHeightPx={80}
                          ariaLabel="Filter study medium language"
                          className="w-full pl-8 pr-6 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-cyan-400 text-xs text-[var(--text-primary)] focus:outline-none"
                        />
                        {settingsMediumSearch && (
                          <button
                            type="button"
                            onClick={() => setSettingsMediumSearch('')}
                            className="absolute right-2 top-1.5 text-[10px] text-[var(--text-secondary)] cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSettingsGoogleCatalogSearch('languages')}
                        disabled={catalogSearchLoading}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 font-bold text-[11px] cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                      >
                        {catalogSearchLoading ? '...' : 'Verify'}
                      </button>
                    </div>

                    {catalogSearchPanel?.section === 'languages' && (
                      <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-cyan-500/30 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-400 text-[10px]">Verified Textbook Mediums</span>
                          <button
                            type="button"
                            onClick={() => setCatalogSearchPanel(null)}
                            className="text-[10px] text-[var(--text-muted)] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[var(--text-secondary)]">{catalogSearchPanel.summary}</p>
                      </div>
                    )}

                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                      {SUPPORTED_LANGUAGES.filter((lang) => {
                        if (!settingsMediumSearch.trim()) return true;
                        const q = settingsMediumSearch.toLowerCase();
                        return (
                          lang.name.toLowerCase().includes(q) ||
                          lang.nativeName.toLowerCase().includes(q) ||
                          lang.code.toLowerCase().includes(q)
                        );
                      }).map((lang) => {
                        const isSelected = currentLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleLanguageSelect(lang.code as LanguageMode)}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-400/40'
                                : 'bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-cyan-400/30 border border-transparent'
                            }`}
                          >
                            <span className="truncate">
                              {lang.flag} {lang.name}{' '}
                              <span className="text-[10px] text-[var(--text-muted)]">({lang.nativeName})</span>
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Font Style & Typography */}
              <div
                className={`rounded-xl bg-[var(--bg-elevated)] border transition-colors ${
                  isFontMenuOpen ? 'border-[var(--accent-primary)]/70' : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsFontMenuOpen((v) => !v)}
                  aria-expanded={isFontMenuOpen}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      style={{ fontFamily: activeFontObj.fontFamily }}
                      className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] flex items-center justify-center font-bold text-xs shrink-0"
                    >
                      Aa
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] block truncate">
                        Font Style &amp; Typography
                      </span>
                      <span
                        style={{ fontFamily: activeFontObj.fontFamily }}
                        className="text-[11px] text-[var(--text-secondary)] block truncate"
                      >
                        {activeFontObj.name} · {activeFontObj.tag}
                      </span>
                    </div>
                  </div>
                  <span className="text-[var(--accent-primary)] shrink-0">
                    {isFontMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isFontMenuOpen && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-[var(--border-color)] space-y-1 max-h-56 overflow-y-auto animate-in fade-in">
                    {fontOptions.map((font) => {
                      const isSelected = currentFont === font.key;
                      return (
                        <button
                          key={font.key}
                          type="button"
                          onClick={() => handleFontSelect(font.key)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold border border-[var(--accent-primary)]/40'
                              : 'bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/30 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span style={{ fontFamily: font.fontFamily }} className="text-xs block truncate">
                              {font.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block truncate">
                              {font.tag} · {font.sample}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Utility Row Inside More Options Dropdown */}
            <div className={`grid grid-cols-1 gap-2.5 items-stretch ${onOpenVideoTour ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {onOpenVideoTour && (
                <button
                  type="button"
                  onClick={onOpenVideoTour}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-cyan-400 text-left cursor-pointer transition-colors flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <Film className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        Master Guide Video &amp; Handbook
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        Watch interactive 02:40 walkthrough
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-400 whitespace-nowrap shrink-0">Watch</span>
                </button>
              )}

              <YouTubeChannelButton variant="card" />

              <PWAInstallButton variant="card" />
            </div>

            {/* Compact Academic Session Strip */}
            <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                  CBSE Academic Session {getDynamicAcademicYear()}
                </span>
              </div>
              {onSimulateAutoReset && (
                <button
                  type="button"
                  onClick={onSimulateAutoReset}
                  className="text-[11px] font-semibold text-emerald-400 hover:underline cursor-pointer whitespace-nowrap"
                >
                  Test Rollover (+5 Days)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chapter Checkbox Picker Modal (Visible When Selecting or Editing a Subject) */}
      {chapterPickerSubject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl bg-[var(--bg-card)] border-2 border-cyan-400 shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] break-words">
                    {chapterPickerSubject.name} — Exam Chapters
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold shrink-0">
                    Code {chapterPickerSubject.code}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Check chapters coming in your exam, then click <strong>Save</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChapterPickerSubject(null)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Online Web Syllabus Lookup Bar inside Modal */}
            <div className="px-3.5 py-2 bg-[var(--bg-main)] border-b border-[var(--border-color)] space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <AutoGrowPromptInput
                    value={modalChapterSearch}
                    onValueChange={setModalChapterSearch}
                    placeholder={`Filter chapters in ${chapterPickerSubject.name}...`}
                    maxHeightPx={96}
                    ariaLabel="Filter subject chapters"
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                  />
                  {modalChapterSearch && (
                    <button
                      type="button"
                      onClick={() => setModalChapterSearch('')}
                      className="absolute right-2 top-2 text-[10px] text-[var(--text-secondary)] cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <a
                  href={getWebSyllabusSearchUrl(modalChapterSearch, chapterPickerSubject)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Search official CBSE syllabus on the web"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Web Syllabus</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-xs tabular-nums">
                <span className="font-extrabold text-cyan-400">
                  {tempSelectedChapterIds.length} of{' '}
                  {chapterPickerSubject.groups.reduce((acc, g) => acc + g.chapters.length, 0)} Chapters Checked
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllChaptersInModal}
                    className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-[var(--text-muted)]">·</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllChaptersInModal}
                    className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body: Chapter Checkbox List */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {chapterPickerSubject.groups.map((group: ChapterGroup) => {
                const visibleChapters = group.chapters.filter((ch: Chapter) => {
                  if (!modalChapterSearch.trim()) return true;
                  const q = modalChapterSearch.toLowerCase();
                  return ch.name.toLowerCase().includes(q) || String(ch.no).includes(q);
                });
                if (visibleChapters.length === 0) return null;

                return (
                  <div key={group.name || group.id} className="space-y-1.5">
                    <div className="font-extrabold text-[11px] uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md">
                      {getLocalizedGroupName(group.name, currentLanguage) || 'Core Chapters'} ({visibleChapters.length})
                    </div>
                    <div className="space-y-1">
                      {visibleChapters.map((ch: Chapter) => {
                        const isChecked = tempSelectedChapterIds.includes(ch.id);
                        return (
                          <div
                            key={ch.id}
                            onClick={() => handleToggleChapterCheckbox(ch.id)}
                            className={`p-2.5 rounded-xl border flex items-start sm:items-center justify-between gap-2.5 cursor-pointer transition-colors select-none ${
                              isChecked
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-[var(--text-primary)]'
                                : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-500'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                              ) : (
                                <Square className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5 sm:mt-0" />
                              )}
                              <span className="font-bold leading-snug break-words flex-1 min-w-0 text-xs sm:text-sm">
                                {getLocalizedChapterPrefix(currentLanguage)} {ch.no}:{' '}
                                {getLocalizedChapterName(ch.id, ch.name, currentLanguage)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {ch.highYield && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-extrabold shrink-0 border border-rose-500/30">
                                  High-Yield
                                </span>
                              )}
                              <a
                                href={getWebSyllabusSearchUrl(ch.name, chapterPickerSubject)}
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
                  </div>
                );
              })}
            </div>

            {/* Modal Footer: Cancel and Save button */}
            <div className="p-3 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setChapterPickerSubject(null)}
                className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChaptersAndEnable}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <span>Save &amp; Enable ({tempSelectedChapterIds.length})</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
