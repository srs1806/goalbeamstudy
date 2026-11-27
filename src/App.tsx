/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useRef, Suspense, lazy } from 'react';
import { flushSync } from 'react-dom';
import { 
  Profile, 
  TrackerState, 
  ActiveScreen, 
  ThemeMode, 
  FontMode,
  LanguageMode,
  StageKey, 
  StageStatus 
} from './types/tracker';
import { 
  loadTrackerState, 
  saveTrackerState, 
  applyThemeToDOM, 
  saveTheme, 
  applyFontToDOM,
  saveFont,
  resetTrackerState, 
  updateStreak,
  syncStreakOnRollover,
  checkAndApplyMonthlyAutoSync,
  saveLanguage 
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { LockedFeatureOverlay } from './components/LockedFeatureOverlay';
import { YouTubeChannelButton } from './components/YouTubeChannelButton';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SEOContent } from './components/SEOContent';
import { BlinkingHeart } from './components/BlinkingHeart';
import { LaunchPortalTransition, LaunchTransitionMode } from './components/LaunchPortalTransition';
import { MorningNotificationModal } from './components/MorningNotificationModal';
import { AppUpdateModal } from './components/AppUpdateModal';
import { ThemeTransitionOverlay, ActiveModeTransition } from './components/ThemeTransitionOverlay';
import { attachScrollChoreography } from './utils/scrollChoreography';

const Onboarding = lazy(() =>
  import('./components/Onboarding').then((m) => ({ default: m.Onboarding }))
);
const ChaptersView = lazy(() =>
  import('./components/ChaptersView').then((m) => ({ default: m.ChaptersView }))
);
const PracticeView = lazy(() =>
  import('./components/PracticeView').then((m) => ({ default: m.PracticeView }))
);
const PlannerView = lazy(() =>
  import('./components/PlannerView').then((m) => ({ default: m.PlannerView }))
);
const InsightsView = lazy(() =>
  import('./components/InsightsView').then((m) => ({ default: m.InsightsView }))
);
const ResourcesView = lazy(() =>
  import('./components/ResourcesView').then((m) => ({ default: m.ResourcesView }))
);
const FocusTimerView = lazy(() =>
  import('./components/FocusTimerView').then((m) => ({ default: m.FocusTimerView }))
);
const LeaderboardView = lazy(() =>
  import('./components/LeaderboardView').then((m) => ({ default: m.LeaderboardView }))
);
const SettingsView = lazy(() =>
  import('./components/SettingsView').then((m) => ({ default: m.SettingsView }))
);
const AuraAIStudio = lazy(() =>
  import('./components/AuraAIStudio').then((m) => ({ default: m.AuraAIStudio }))
);
const ManualVideoTour = lazy(() =>
  import('./components/ManualVideoTour').then((m) => ({ default: m.ManualVideoTour }))
);
import { CLASS_10_SUBJECTS, STAGES_CONFIG } from './data/chaptersData';
import { getProfileStages } from './data/stagesCatalog';
import { ResourceCategory } from './data/resourcesData';
import { checkExamOverAndAutoReset } from './utils/academicYear';
import {
  resolveScreenFromPath,
  applyRouteSEOMetadata,
  getScreenHref,
  SCREEN_SEO_MAP,
} from './utils/seoMetadata';
import { BellRing, Sunrise, ArrowLeft } from 'lucide-react';
import {
  checkAndTriggerMorningReminder,
  MORNING_NOTIFICATION_EVENT,
  MorningNotificationPayload,
  sendMorningStudyReminder,
  showStudyNotification,
  recordUserVisit,
  isNotificationsPausedForInactivity,
  resumeNotificationsAfterInactivity,
  pauseNotificationsAfterInactivity,
  buildSectionWiseMorningPayload,
  recordAndIncrementUserVisit,
  shouldPromptMorningNotification,
  dismissMorningNotificationPrompt,
  requestNotificationPermission,
} from './utils/notifications';
import {
  computeRealSyllabusMetrics,
  syncProfileToRealLeaderboard,
} from './utils/leaderboardSync';
import {
  APP_RELEASES,
  AppReleaseEntry,
  AppUpdateChangeItem,
  CURRENT_APP_VERSION,
  NOTIFIED_APP_VERSION_KEY,
  PendingAppUpdateSummary,
  SEEN_APP_VERSION_KEY,
  collectPendingQualifyingUpdate,
} from './data/appUpdates';
import { playSoftStartupChime, playModeSwitchHarmonic } from './utils/audio';

const GUEST_DEFAULT_SUBJECT_IDS = ['maths', 'science', 'sst', 'english', 'hindi_b', 'it_402'];

const GUEST_EXAM_SYLLABUS: Record<string, string[]> = CLASS_10_SUBJECTS.reduce(
  (acc, sub) => {
    if (GUEST_DEFAULT_SUBJECT_IDS.includes(sub.id)) {
      acc[sub.id] = sub.groups.flatMap((g) => g.chapters.map((c) => c.id));
    }
    return acc;
  },
  {} as Record<string, string[]>
);

const GUEST_PREVIEW_PROFILE: Profile = {
  id: 'guest-preview',
  name: 'Class 10 Scholar',
  grade: 10,
  board: 'CBSE',
  targetPercentage: 95,
  firstPaperDate: '15/02/2027',
  targetExamName: 'Board Exam (Finals)',
  pomodoroMinutes: 25,
  dailyHourGoal: 4,
  selectedSubjectIds: GUEST_DEFAULT_SUBJECT_IDS,
  selectedStages: STAGES_CONFIG,
  examSyllabus: GUEST_EXAM_SYLLABUS,
  progress: {},
  streak: { count: 0, lastActiveDate: '' },
  xp: 0,
  focusPoints: 0,
  totalFocusMinutes: 0,
  treesGrown: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export default function App() {
  const [trackerState, setTrackerState] = useState<TrackerState>(() => {
    const loaded = loadTrackerState();
    applyThemeToDOM(loaded.theme);
    applyFontToDOM(loaded.fontFamily);
    const { state: autoSynced } = checkAndApplyMonthlyAutoSync(loaded);
    const syncedProfiles = autoSynced.profiles.map((p) =>
      p.id === (autoSynced.activeProfileId || autoSynced.profiles[0]?.id) ? syncStreakOnRollover(p) : p
    );
    return {
      ...autoSynced,
      profiles: syncedProfiles,
    };
  });

  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>(() => {
    if (typeof window !== 'undefined') {
      const resolved = resolveScreenFromPath(window.location.pathname);
      if (resolved) return resolved;
    }
    return 'dashboard';
  });

  // Launch & Onboarding transition state (plays when opening app, registering profile, or finishing guide)
  const [transitionState, setTransitionState] = useState<{
    isOpen: boolean;
    mode: LaunchTransitionMode;
    studentName: string;
    targetPercentage: number;
    firstPaperDate: string;
    streakDays: number;
    selectedSubjectsCount: number;
  } | null>(() => {
    const prof = trackerState.profiles.find((p) => p.id === trackerState.activeProfileId) || trackerState.profiles[0];
    if (prof && trackerState.profiles.length > 0) {
      return {
        isOpen: true,
        mode: 'welcome-launch',
        studentName: prof.name,
        targetPercentage: prof.targetPercentage,
        firstPaperDate: prof.firstPaperDate,
        streakDays: prof.streak?.count ?? 0,
        selectedSubjectsCount: (prof.selectedSubjectIds || []).length || 5,
      };
    }
    return null;
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(CLASS_10_SUBJECTS[0].id);
  const [showVideoTourModal, setShowVideoTourModal] = useState<boolean>(false);
  const [autoResetNotification, setAutoResetNotification] = useState<string | null>(null);
  const [morningNotificationPayload, setMorningNotificationPayload] =
    useState<MorningNotificationPayload | null>(null);
  const [showInactivityModal, setShowInactivityModal] = useState<boolean>(false);
  const [showSecondVisitPromptModal, setShowSecondVisitPromptModal] = useState<boolean>(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'about' | 'privacy' | 'disclaimer' | null>(null);
  const [pendingAppUpdate, setPendingAppUpdate] = useState<PendingAppUpdateSummary | null>(null);
  const [isUpdatingFormInPlace, setIsUpdatingFormInPlace] = useState<boolean>(false);
  const [modeTransition, setModeTransition] = useState<ActiveModeTransition | null>(null);
  const modeTransitionTimerRef = useRef<number | null>(null);

  // Resource View Filter Props (passed when jumping from Chapters)
  const [resourcesSubjectFilter, setResourcesSubjectFilter] = useState<string>('all');
  const [resourcesCategoryFilter, setResourcesCategoryFilter] = useState<ResourceCategory | 'all'>('all');
  const [resourcesSearchQuery, setResourcesSearchQuery] = useState<string>('');

  // Target Chapter Focus state for app-native view transition redirect
  const [targetChapterFocus, setTargetChapterFocus] = useState<{
    subjectId: string;
    chapterId: string;
    stageKey?: string;
    timestamp: number;
  } | null>(null);

  const handleNavigateToChapterTarget = (
    subjectId: string,
    chapterId: string,
    stageKey?: string
  ) => {
    const performTransition = () => {
      setSelectedSubjectId(subjectId);
      setTargetChapterFocus({
        subjectId,
        chapterId,
        stageKey,
        timestamp: Date.now(),
      });
      setCurrentScreen('chapters');
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        performTransition();
      });
    } else {
      performTransition();
    }
  };

  const mainScrollRef = useRef<HTMLElement>(null);

  const resetScrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
      mainScrollRef.current.scrollLeft = 0;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Always open every new section/screen from the very top (never preserve prior screen's bottom scroll)
  useLayoutEffect(() => {
    resetScrollToTop();
    const rafId = window.requestAnimationFrame(() => {
      resetScrollToTop();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [currentScreen]);

  // Sync clean SEO URLs, browser back/forward history, and dynamic route metadata
  useEffect(() => {
    applyRouteSEOMetadata(currentScreen);
    if (typeof window === 'undefined') return;
    const targetPath = getScreenHref(currentScreen);
    const normCurrent = window.location.pathname.replace(/\/+$/, '') || '/';
    const normTarget = targetPath.replace(/\/+$/, '') || '/';
    if (normCurrent !== normTarget) {
      const keepSearch =
        currentScreen === 'resources' && window.location.search.includes('q=')
          ? window.location.search
          : '';
      window.history.pushState({ screen: currentScreen }, '', targetPath + keepSearch);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const resolved = resolveScreenFromPath(window.location.pathname);
      if (resolved) {
        setCurrentScreen(resolved);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state changes to LocalStorage
  useEffect(() => {
    saveTrackerState(trackerState);
  }, [trackerState]);

  // Check if exams are over + 5 days have passed -> automatic reset for new academic year
  useEffect(() => {
    const result = checkExamOverAndAutoReset(trackerState);
    if (result.hasAutoReset) {
      setTrackerState(result.state);
      setAutoResetNotification(result.message);
    }
  }, []);

  const handleSimulateAutoReset = () => {
    const result = checkExamOverAndAutoReset(trackerState, true);
    setTrackerState(result.state);
    setAutoResetNotification(result.message);
  };

  // Apply theme whenever it changes
  useEffect(() => {
    applyThemeToDOM(trackerState.theme);
  }, [trackerState.theme]);

  // Apply font whenever it changes
  useEffect(() => {
    applyFontToDOM(trackerState.fontFamily);
  }, [trackerState.fontFamily]);

  // Active profile
  const activeProfile = trackerState.profiles.find(
    (p) => p.id === trackerState.activeProfileId
  ) || trackerState.profiles[0] || null;

  // Bidirectional staggered one-by-one scroll choreography (left, right, bottom, fade; entrance & exit up/down)
  useEffect(() => {
    if (currentScreen === 'onboarding') return;
    const scrollEl = mainScrollRef.current;
    if (!scrollEl) return;
    return attachScrollChoreography(scrollEl, currentScreen);
  }, [currentScreen, activeProfile?.id]);

  // Keep active profile streak synced on mount, window focus, tab visibility return, and across 5:00 AM rollover
  useEffect(() => {
    if (!activeProfile?.id) return;

    const syncActiveProfileStreak = () => {
      setTrackerState((prev) => {
        const current = prev.profiles.find((p) => p.id === prev.activeProfileId) || prev.profiles[0];
        if (!current) return prev;
        const updated = syncStreakOnRollover(current);
        if (
          updated === current &&
          updated.streak?.count === current.streak?.count &&
          updated.streak?.lastActiveDate === current.streak?.lastActiveDate
        ) {
          return prev;
        }
        return {
          ...prev,
          profiles: prev.profiles.map((p) => (p.id === updated.id ? updated : p)),
        };
      });
    };

    syncActiveProfileStreak();
    const interval = window.setInterval(syncActiveProfileStreak, 60000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncActiveProfileStreak();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [activeProfile?.id]);

  // Live 100% Real Syllabus Leaderboard Sync whenever real profile syllabus metrics change
  const leaderboardMetricsSignature = React.useMemo(() => {
    if (!activeProfile?.id || activeProfile.id === 'guest-preview') return '';
    const metrics = computeRealSyllabusMetrics(activeProfile);
    return JSON.stringify({
      profileId: metrics.profileId,
      name: metrics.name,
      board: metrics.board,
      overallPercentExact: metrics.overallPercentExact,
      avgSubjectPercent: metrics.avgSubjectPercent,
      completedChapters: metrics.completedChapters,
      totalChapters: metrics.totalChapters,
      completedStages: metrics.completedStages,
      totalStages: metrics.totalStages,
      subjectCount: metrics.subjectCount,
      streakDays: metrics.streakDays,
    });
  }, [activeProfile]);

  useEffect(() => {
    if (!activeProfile?.id || activeProfile.id === 'guest-preview' || !leaderboardMetricsSignature) {
      return;
    }
    const timer = window.setTimeout(() => {
      void syncProfileToRealLeaderboard(activeProfile);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [activeProfile, leaderboardMetricsSignature]);

  // Check 3-day inactivity: If student ignored website for 3 days continuously, notifications are stopped.
  // Next time they open the website, ask them with a Yes or No dialog to resume or keep off.
  useEffect(() => {
    if (activeProfile) {
      const visitResult = recordUserVisit();
      if (visitResult.wasAwayFor3Days || isNotificationsPausedForInactivity()) {
        setShowInactivityModal(true);
      }
    }
  }, [activeProfile?.id]);

  // User Visit Tracking: Record session visits & trigger 5:00 AM notification prompt strictly on 2nd visit
  useEffect(() => {
    if (activeProfile) {
      recordAndIncrementUserVisit();
      if (shouldPromptMorningNotification()) {
        setShowSecondVisitPromptModal(true);
      }
    }
  }, [activeProfile?.id]);

  // Handle URL action (?action=mark_done) and Google/Chrome SearchAction (?q=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const searchQ = params.get('q');
      if (action === 'mark_done' && activeProfile) {
        const payload = buildSectionWiseMorningPayload(activeProfile, trackerState.language || 'en');
        if (payload.sectionTargets && payload.sectionTargets.length > 0) {
          const top = payload.sectionTargets[0];
          handleUpdateStage(top.subjectId, top.chapterId, top.nextStageKey, 'done');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (searchQ && searchQ.trim()) {
        setResourcesSubjectFilter('all');
        setResourcesCategoryFilter('all');
        setResourcesSearchQuery(searchQ.trim());
        setCurrentScreen('resources');
      }
    }
  }, [activeProfile?.id]);

  // Listen for global Morning Notification events & Service Worker notification clicks across Mobile, Tablet & Laptop
  useEffect(() => {
    const handleMorningEvent = (e: Event) => {
      const customEvt = e as CustomEvent<MorningNotificationPayload>;
      if (customEvt.detail) {
        setMorningNotificationPayload(customEvt.detail);
      }
    };

    const handleSwMessage = (event: MessageEvent) => {
      if (
        event.data &&
        (event.data.type === 'AURA_NOTIFICATION_CLICKED' ||
          event.data.type === 'ZENITH_NOTIFICATION_CLICKED')
      ) {
        if (event.data.action === 'open-update') {
          window.focus();
          return;
        }
        if (activeProfile) {
          if (event.data.action === 'mark_done') {
            const payload = buildSectionWiseMorningPayload(activeProfile, trackerState.language || 'en');
            if (payload.sectionTargets && payload.sectionTargets.length > 0) {
              const top = payload.sectionTargets[0];
              handleUpdateStage(top.subjectId, top.chapterId, top.nextStageKey, 'done');
            }
          }
          sendMorningStudyReminder(activeProfile, trackerState.language || 'en');
        }
      }
    };

    window.addEventListener(MORNING_NOTIFICATION_EVENT, handleMorningEvent);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      window.removeEventListener(MORNING_NOTIFICATION_EVENT, handleMorningEvent);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, [activeProfile, trackerState.language]);

  // Check and trigger daily scheduled study notifications (including on device wake-up / focus across Laptop, Mobile, Tablet)
  useEffect(() => {
    if (!activeProfile) return;

    const triggerReminder = async () => {
      await checkAndTriggerMorningReminder(
        activeProfile,
        (dateKey, _payload) => {
          // Do not pop up modal automatically on the main interface when the website starts
          const updatedProfile: Profile = {
            ...activeProfile,
            notificationSettings: {
              ...activeProfile.notificationSettings,
              enabled: true,
              morningReminderTime:
                activeProfile.notificationSettings?.morningReminderTime || '05:00',
              soundType:
                activeProfile.notificationSettings?.soundType || 'zenith-symphony',
              lastNotifiedDate: dateKey,
            },
          };
          setTrackerState((prev) => ({
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === updatedProfile.id ? updatedProfile : p
            ),
          }));
        },
        trackerState.language || 'en'
      );
    };

    triggerReminder();
    const interval = setInterval(triggerReminder, 20000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        triggerReminder();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [
    activeProfile?.id,
    activeProfile?.notificationSettings?.enabled,
    activeProfile?.notificationSettings?.lastNotifiedDate,
    activeProfile?.notificationSettings?.morningReminderTime,
    trackerState.language,
  ]);

  // Monitor qualifying website updates (form changes & new features ONLY):
  // - Returning user opening site sees the Update Screen automatically.
  // - Active user currently using the site receives a live notification + Update Screen when a qualifying update deploys.
  // - Main-screen-only edits or tweaks in sections accessible without resetting NEVER appear in this banner/notification.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (transitionState?.isOpen) return;

    const evaluateReleases = async (isLivePoll: boolean) => {
      let releases: AppReleaseEntry[] = APP_RELEASES;
      let latestVersion = CURRENT_APP_VERSION;

      try {
        const res = await fetch('/api/app-updates', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.releases) && data.releases.length > 0) {
            releases = data.releases;
            latestVersion = String(data.version || data.releases[data.releases.length - 1].version);
          }
        }
      } catch {
        // Offline / local fallback cleanly uses bundled APP_RELEASES
      }

      let storedSeen: string | null = null;
      try {
        storedSeen = localStorage.getItem(SEEN_APP_VERSION_KEY);
      } catch {}

      // First-time visitor without any existing saved profile: silently record baseline without interrupting onboarding
      const hasSavedProfile = trackerState.profiles.length > 0;
      if (!storedSeen && !hasSavedProfile) {
        try {
          localStorage.setItem(SEEN_APP_VERSION_KEY, latestVersion);
        } catch {}
        return;
      }

      const { pending, shouldAdvanceSeenTo } = collectPendingQualifyingUpdate(storedSeen, releases);

      if (shouldAdvanceSeenTo) {
        try {
          localStorage.setItem(SEEN_APP_VERSION_KEY, shouldAdvanceSeenTo);
        } catch {}
        return;
      }

      if (!pending || pending.changes.length === 0) return;

      const isFromLiveServer = pending.latestVersion !== CURRENT_APP_VERSION;
      setPendingAppUpdate({
        ...pending,
        isLiveServerUpdate: isFromLiveServer,
      });

      // Notify active user immediately if they are using the website when a qualifying update is detected
      let alreadyNotifiedVersion: string | null = null;
      try {
        alreadyNotifiedVersion = localStorage.getItem(NOTIFIED_APP_VERSION_KEY);
      } catch {}

      if ((isLivePoll || isFromLiveServer || document.visibilityState === 'visible') && alreadyNotifiedVersion !== pending.latestVersion) {
        try {
          localStorage.setItem(NOTIFIED_APP_VERSION_KEY, pending.latestVersion);
        } catch {}
        playSoftStartupChime();
        const topSummary = pending.changes
          .slice(0, 2)
          .map((c) => `• ${c.title}`)
          .join('\n');
        void showStudyNotification(`✨ Goalbeam Updated: ${pending.headline}`, {
          body: topSummary || 'New form updates or features are now ready!',
          tag: `aura-app-update-${pending.latestVersion}`,
          actions: [{ action: 'open-update', title: '✨ View Changes' }],
        } as any);
      }
    };

    void evaluateReleases(false);
    const pollInterval = window.setInterval(() => {
      void evaluateReleases(true);
    }, 45000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        void evaluateReleases(true);
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    let swReg: ServiceWorkerRegistration | null = null;
    const handleSwUpdate = () => {
      void evaluateReleases(true);
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (reg) {
            swReg = reg;
            reg.addEventListener('updatefound', handleSwUpdate);
          }
        })
        .catch(() => {});
      navigator.serviceWorker.addEventListener('controllerchange', handleSwUpdate);
    }

    return () => {
      window.clearInterval(pollInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (swReg) {
        swReg.removeEventListener('updatefound', handleSwUpdate);
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSwUpdate);
      }
    };
  }, [transitionState?.isOpen, trackerState.profiles.length]);

  // Silky 5-Mode Optical Morph & Ambient Veil Transition handler
  const handleThemeChange = (newTheme: ThemeMode, origin?: { x: number; y: number }) => {
    if (newTheme === trackerState.theme) return;

    const x = origin?.x ?? (typeof window !== 'undefined' ? window.innerWidth - 72 : 300);
    const y = origin?.y ?? 28;
    const prefersReduced =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

    if (modeTransitionTimerRef.current) {
      window.clearTimeout(modeTransitionTimerRef.current);
      modeTransitionTimerRef.current = null;
    }

    if (prefersReduced || typeof document === 'undefined') {
      saveTheme(newTheme);
      setTrackerState((prev) => ({ ...prev, theme: newTheme }));
      return;
    }

    playModeSwitchHarmonic(newTheme);

    const root = document.documentElement;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${Math.ceil(maxRadius)}px`);

    const transitionPayload: ActiveModeTransition = {
      key: Date.now(),
      targetTheme: newTheme,
      x,
      y,
      usesFallback: false,
    };

    const vtClasses = [
      'theme-transitioning',
      'theme-vt-dark',
      'theme-vt-light',
      'theme-vt-gold',
      'theme-vt-matrix',
      'theme-vt-cyberpunk',
    ];
    root.classList.remove(...vtClasses);
    root.classList.add('theme-transitioning', `theme-vt-${newTheme}`);

    if ('startViewTransition' in document && typeof (document as any).startViewTransition === 'function') {
      try {
        const vt = (document as any).startViewTransition(() => {
          flushSync(() => {
            saveTheme(newTheme);
            setTrackerState((prev) => ({ ...prev, theme: newTheme }));
            setModeTransition(transitionPayload);
          });
        });
        Promise.resolve(vt?.finished)
          .catch(() => {})
          .finally(() => {
            flushSync(() => {
              setModeTransition(null);
            });
            root.classList.remove(...vtClasses);
          });
        return;
      } catch {
        root.classList.remove(...vtClasses);
      }
    }

    // Fallback for browsers without native View Transitions API
    saveTheme(newTheme);
    setTrackerState((prev) => ({ ...prev, theme: newTheme }));
    setModeTransition({ ...transitionPayload, usesFallback: true });
    root.classList.remove(...vtClasses);
    modeTransitionTimerRef.current = window.setTimeout(() => {
      setModeTransition(null);
    }, 620);
  };

  // Font change handler
  const handleFontChange = (newFont: FontMode) => {
    saveFont(newFont);
    setTrackerState((prev) => ({ ...prev, fontFamily: newFont }));
  };

  // Language change handler
  const handleLanguageChange = (newLang: LanguageMode) => {
    saveLanguage(newLang);
    setTrackerState((prev) => ({ ...prev, language: newLang }));
  };

  // Onboarding completion
  const handleOnboardingComplete = (newProfile: Profile) => {
    setTrackerState((prev) => {
      const existingIndex = prev.profiles.findIndex((p) => p.id === newProfile.id);
      let updatedProfiles = [...prev.profiles];
      if (existingIndex >= 0) {
        updatedProfiles[existingIndex] = newProfile;
      } else {
        updatedProfiles.push(newProfile);
      }
      return {
        ...prev,
        activeProfileId: newProfile.id,
        profiles: updatedProfiles,
      };
    });
    setIsUpdatingFormInPlace(false);
    setCurrentScreen('dashboard');
    setTransitionState({
      isOpen: true,
      mode: 'onboarding-complete',
      studentName: newProfile.name,
      targetPercentage: newProfile.targetPercentage,
      firstPaperDate: newProfile.firstPaperDate,
      streakDays: newProfile.streak?.count ?? 0,
      selectedSubjectsCount: (newProfile.selectedSubjectIds || []).length || 5,
    });
  };

  // Switch profile
  const handleSelectProfile = (profileId: string) => {
    setTrackerState((prev) => ({ ...prev, activeProfileId: profileId }));
  };

  // Add new profile
  const handleNewProfile = () => {
    setCurrentScreen('onboarding');
  };

  // Reset tracker completely back to Step 1
  const handleResetTracker = () => {
    const freshState = resetTrackerState();
    setTrackerState(freshState);
    setCurrentScreen('onboarding');
    setTransitionState(null);
    setShowVideoTourModal(false);
  };

  // Record qualifying study activity (Chapters started/in-progress/done, Resources PDF opened, Test/Quiz taken)
  const handleRecordQualifyingStudyActivity = () => {
    setTrackerState((prev) => {
      const current = prev.profiles.find((p) => p.id === prev.activeProfileId) || prev.profiles[0];
      if (!current) return prev;
      const updated = updateStreak(current);
      if (
        updated === current &&
        updated.streak?.count === current.streak?.count &&
        updated.streak?.lastActiveDate === current.streak?.lastActiveDate
      ) {
        return prev;
      }
      return {
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === updated.id ? updated : p)),
      };
    });
  };

  // Update a single stage for a chapter
  const handleUpdateStage = (
    subjectId: string,
    chapterId: string,
    stageKey: StageKey,
    status: StageStatus
  ) => {
    setTrackerState((prev) => {
      const currentActive = prev.profiles.find((p) => p.id === prev.activeProfileId) || prev.profiles[0];
      if (!currentActive) return prev;

      const currentSubProg = currentActive.progress[subjectId] || {};
      const currentChProg = currentSubProg[chapterId] || { stages: {}, completed: false };
      const prevStatus: StageStatus = currentChProg.stages?.[stageKey] || 'none';
      const wasCompleted = Boolean(currentChProg.completed);

      const updatedStages = {
        ...currentChProg.stages,
        [stageKey]: status,
      };

      const activeStages = getProfileStages(currentActive);
      const doneCount = activeStages.filter((s) => updatedStages[s.key] === 'done').length;
      const isCompleted = doneCount === activeStages.length;

      let pointsGained = 0;
      let treesGained = 0;
      if (status === 'done' && prevStatus !== 'done') {
        if (isCompleted && !wasCompleted) {
          pointsGained = 100;
          treesGained = 1;
        } else {
          pointsGained = 25;
        }
      }

      const nextProfile: Profile = {
        ...currentActive,
        focusPoints: (currentActive.focusPoints || 0) + pointsGained,
        treesGrown: (currentActive.treesGrown || 0) + treesGained,
        progress: {
          ...currentActive.progress,
          [subjectId]: {
            ...currentSubProg,
            [chapterId]: {
              ...currentChProg,
              stages: updatedStages,
              completed: isCompleted,
              lastUpdated: new Date().toISOString(),
            },
          },
        },
      };

      // Only marking as in_progress (started/doing) or done (completed) qualifies for daily streak
      const qualifiesForStreak = status === 'in_progress' || status === 'done';
      const updatedProfile = qualifiesForStreak ? updateStreak(nextProfile) : nextProfile;

      return {
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
      };
    });
  };

  // Batch update multiple stages across chapters atomically
  const handleBatchUpdateStages = (
    updates: { subjectId: string; chapterId: string; stageKey: StageKey; status?: StageStatus }[]
  ) => {
    if (!updates.length) return;

    setTrackerState((prev) => {
      const currentActive = prev.profiles.find((p) => p.id === prev.activeProfileId);
      if (!currentActive) return prev;

      // Deep clone current progress
      const newProgress = JSON.parse(JSON.stringify(currentActive.progress || {}));
      const activeStages = getProfileStages(currentActive);
      let pointsGained = 0;
      let newlyCompletedChapters = 0;

      const distinctChapters = new Set<string>();
      const hasQualifyingStatus = updates.some(
        (u) => (u.status || 'done') === 'done' || u.status === 'in_progress'
      );

      updates.forEach(({ subjectId, chapterId, stageKey, status = 'done' }) => {
        if (!newProgress[subjectId]) newProgress[subjectId] = {};
        if (!newProgress[subjectId][chapterId]) {
          newProgress[subjectId][chapterId] = { stages: {}, completed: false };
        }
        if (!newProgress[subjectId][chapterId].stages) {
          newProgress[subjectId][chapterId].stages = {};
        }

        const prevStatus = newProgress[subjectId][chapterId].stages[stageKey];
        if (prevStatus !== status) {
          if (status === 'done' && prevStatus !== 'done') {
            pointsGained += 25;
          }
          newProgress[subjectId][chapterId].stages[stageKey] = status;
          newProgress[subjectId][chapterId].lastUpdated = new Date().toISOString();
        }

        distinctChapters.add(`${subjectId}:::${chapterId}`);
      });

      // Check each affected chapter for 100% completion
      distinctChapters.forEach((key) => {
        const [subId, chId] = key.split(':::');
        const chProg = newProgress[subId]?.[chId];
        if (chProg) {
          const wasCompleted = !!chProg.completed;
          const isNowCompleted = activeStages.every(
            (st) => chProg.stages?.[st.key] === 'done'
          );
          chProg.completed = isNowCompleted;
          if (isNowCompleted && !wasCompleted) {
            newlyCompletedChapters += 1;
            pointsGained += 100;
          }
        }
      });

      const nextProfile: Profile = {
        ...currentActive,
        progress: newProgress,
        focusPoints: (currentActive.focusPoints || 0) + pointsGained,
        treesGrown: (currentActive.treesGrown || 0) + newlyCompletedChapters,
      };

      const updatedProfile = hasQualifyingStatus ? updateStreak(nextProfile) : nextProfile;

      return {
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
      };
    });
  };

  // Mark all selected stages of a chapter as done
  const handleMarkChapterAllDone = (subjectId: string, chapterId: string) => {
    setTrackerState((prev) => {
      const currentActive = prev.profiles.find((p) => p.id === prev.activeProfileId) || prev.profiles[0];
      if (!currentActive) return prev;

      const currentSubProg = currentActive.progress[subjectId] || {};
      const currentChProg = currentSubProg[chapterId] || { stages: {}, completed: false };
      const wasCompleted = Boolean(currentChProg.completed);

      const activeStages = getProfileStages(currentActive);
      const doneStages: any = {};
      activeStages.forEach((s) => {
        doneStages[s.key] = 'done';
      });

      const updatedProfile = updateStreak({
        ...currentActive,
        focusPoints: (currentActive.focusPoints || 0) + (wasCompleted ? 0 : 100),
        treesGrown: (currentActive.treesGrown || 0) + (wasCompleted ? 0 : 1),
        progress: {
          ...currentActive.progress,
          [subjectId]: {
            ...currentSubProg,
            [chapterId]: {
              ...currentChProg,
              stages: doneStages,
              completed: true,
              lastUpdated: new Date().toISOString(),
            },
          },
        },
      });

      return {
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
      };
    });
  };

  // Update chapter personal notes
  const handleUpdateChapterNotes = (subjectId: string, chapterId: string, notes: string) => {
    if (!activeProfile) return;

    const currentSubProg = activeProfile.progress[subjectId] || {};
    const currentChProg = currentSubProg[chapterId] || { stages: {} };

    const updatedProfile: Profile = {
      ...activeProfile,
      progress: {
        ...activeProfile.progress,
        [subjectId]: {
          ...currentSubProg,
          [chapterId]: {
            ...currentChProg,
            notes,
          },
        },
      },
    };

    setTrackerState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
    }));
  };

  const handleUpdateSelectedSubjects = (newSubjectIds: string[]) => {
    setTrackerState((prev) => {
      const currentActive = prev.profiles.find((p) => p.id === prev.activeProfileId);
      if (!currentActive) return prev;
      const updatedProfile: Profile = {
        ...currentActive,
        selectedSubjectIds: newSubjectIds,
      };
      return {
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
      };
    });
    if (selectedSubjectId !== 'all' && !newSubjectIds.includes(selectedSubjectId)) {
      setSelectedSubjectId('all');
    }
  };

  const handleUpdateProfile = (updatedProfile: Profile) => {
    setTrackerState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
    }));
    if (
      Array.isArray(updatedProfile.selectedSubjectIds) &&
      selectedSubjectId !== 'all' &&
      !updatedProfile.selectedSubjectIds.includes(selectedSubjectId)
    ) {
      setSelectedSubjectId('all');
    }
  };

  const handleUpdatePomodoroMinutes = (minutes: number) => {
    if (!activeProfile) return;
    handleUpdateProfile({
      ...activeProfile,
      pomodoroMinutes: minutes,
    });
  };

  const isLockedViewportScreen = currentScreen === 'onboarding';

  return (
    <div className="h-dvh w-full max-w-full overflow-hidden flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] antialiased selection:bg-cyan-500 selection:text-black">
      {/* 5-Mode Quantum Aperture Portal Overlay */}
      <ThemeTransitionOverlay transition={modeTransition} />

      {/* Crawlable Semantic SEO Directory & Internal Anchor Links */}
      <SEOContent onNavigate={setCurrentScreen} />

      {/* Permanently Pinned Top Header */}
      <Header
        currentTheme={trackerState.theme}
        onThemeChange={handleThemeChange}
        onResetTracker={handleResetTracker}
        onBrandClick={() => {
          setCurrentScreen('dashboard');
          resetScrollToTop();
        }}
        onOpenVideoTour={() => setShowVideoTourModal(true)}
        currentLanguage={trackerState.language || 'en'}
        onLanguageChange={handleLanguageChange}
      />

      {/* 5-Day Post-Exam Auto-Reset & Academic Year Rollover Toast Banner */}
      {autoResetNotification && (
        <div className="shrink-0 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-slate-950 font-bold px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-5xl">
            <span className="text-base sm:text-lg">🎉</span>
            <span>{autoResetNotification}</span>
          </div>
          <button
            onClick={() => setAutoResetNotification(null)}
            className="px-3 py-1 bg-slate-950 text-white rounded-lg hover:bg-slate-900 text-xs font-black shrink-0 cursor-pointer"
          >
            Got it ✓
          </button>
        </div>
      )}

      {/* Main Screen Content: Zero whole-screen scroll on Onboarding; full section scroll on Chapters & other tabs while Header stays permanently pinned */}
      <main
        id="app-main-scroll"
        ref={mainScrollRef}
        className={
          currentScreen === 'onboarding'
            ? 'relative flex-1 min-h-0 w-full max-w-4xl mx-auto px-2 sm:px-6 py-1.5 sm:py-3 overflow-hidden flex flex-col items-center justify-center'
            : 'relative flex-1 min-h-0 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-5 pb-24 sm:pb-28 overflow-y-auto overflow-x-clip'
        }
      >
        <Suspense
          fallback={
            <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-xs font-bold tracking-wide">Loading workspace...</span>
            </div>
          }
        >
        {(() => {
          const pageProfile = activeProfile || GUEST_PREVIEW_PROFILE;
          const isIncompleteProfile = !activeProfile;
          const goCompleteProfile = () => setCurrentScreen('onboarding');

          if (currentScreen === 'onboarding') {
            return (
              <Onboarding
                key={activeProfile ? `profile-${activeProfile.id}` : `onboarding-fresh-${trackerState.profiles.length}`}
                onComplete={handleOnboardingComplete}
                onSkipToExplore={() => {
                  setIsUpdatingFormInPlace(false);
                  setCurrentScreen('dashboard');
                }}
                existingProfile={activeProfile}
                preserveProgress={isUpdatingFormInPlace}
                currentLanguage={trackerState.language || 'en'}
                onLanguageChange={handleLanguageChange}
              />
            );
          }

          if (currentScreen === 'dashboard') {
            return (
              <Dashboard
                profile={pageProfile}
                isIncompleteProfile={isIncompleteProfile}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onSelectSubject={(subId) => {
                  setSelectedSubjectId(subId);
                  setCurrentScreen('chapters');
                }}
                onNavigateToChapterTarget={handleNavigateToChapterTarget}
                onNavigateToResources={(subId) => {
                  setResourcesSubjectFilter(subId);
                  setResourcesCategoryFilter('all');
                  setResourcesSearchQuery('');
                  setCurrentScreen('resources');
                }}
                onQuickMarkStageDone={(subId, chId, stg) => {
                  handleUpdateStage(subId, chId, stg, 'done');
                }}
                onUpdateProfile={handleUpdateProfile}
                onOpenGuide={() => setShowVideoTourModal(true)}
                language={trackerState.language || 'en'}
              />
            );
          }

          if (currentScreen === 'chapters') {
            return (
              <ChaptersView
                profile={pageProfile}
                selectedSubjectId={selectedSubjectId}
                targetChapterFocus={targetChapterFocus}
                onSelectSubject={setSelectedSubjectId}
                onUpdateStage={handleUpdateStage}
                onMarkChapterAllDone={handleMarkChapterAllDone}
                onUpdateChapterNotes={handleUpdateChapterNotes}
                onNavigateToResources={(subId: string, cat: ResourceCategory | 'all', chapterName: string) => {
                  setResourcesSubjectFilter(subId);
                  setResourcesCategoryFilter(cat);
                  setResourcesSearchQuery(chapterName);
                  setCurrentScreen('resources');
                }}
                onUpdateSelectedSubjects={handleUpdateSelectedSubjects}
                onUpdateProfile={handleUpdateProfile}
                onBatchUpdateStages={handleBatchUpdateStages}
                isIncompleteProfile={isIncompleteProfile}
                onCompleteProfile={goCompleteProfile}
                language={trackerState.language || 'en'}
              />
            );
          }

          if (currentScreen === 'practice') {
            return (
              <PracticeView
                profile={pageProfile}
                isGuestPreview={isIncompleteProfile}
                onUpdateProfile={handleUpdateProfile}
                language={trackerState.language || 'en'}
              />
            );
          }

          if (currentScreen === 'planner') {
            const view = (
              <PlannerView
                profile={pageProfile}
                isGuestPreview={isIncompleteProfile}
                onUpdateProfile={handleUpdateProfile}
                onNavigate={setCurrentScreen}
                onOpenSubjectChapters={(subId) => {
                  setSelectedSubjectId(subId);
                  setCurrentScreen('chapters');
                }}
                language={trackerState.language || 'en'}
              />
            );
            return isIncompleteProfile ? (
              <LockedFeatureOverlay
                variant="screen"
                featureLabel="Smart Exam Planner"
                onCompleteProfile={goCompleteProfile}
              >
                {view}
              </LockedFeatureOverlay>
            ) : (
              view
            );
          }

          if (currentScreen === 'focus') {
            const view = (
              <FocusTimerView
                profile={pageProfile}
                onUpdateProfile={handleUpdateProfile}
                language={trackerState.language || 'en'}
                onNavigate={setCurrentScreen}
              />
            );
            return isIncompleteProfile ? (
              <LockedFeatureOverlay
                variant="screen"
                featureLabel="3D Pomodoro Focus Garden"
                onCompleteProfile={goCompleteProfile}
              >
                {view}
              </LockedFeatureOverlay>
            ) : (
              view
            );
          }

          if (currentScreen === 'leaderboard') {
            const view = (
              <LeaderboardView
                profile={pageProfile}
                onNavigate={setCurrentScreen}
                language={trackerState.language || 'en'}
              />
            );
            return isIncompleteProfile ? (
              <LockedFeatureOverlay
                variant="screen"
                featureLabel="Live Syllabus Leaderboard"
                onCompleteProfile={goCompleteProfile}
              >
                {view}
              </LockedFeatureOverlay>
            ) : (
              view
            );
          }

          if (currentScreen === 'insights') {
            return (
              <InsightsView
                profile={pageProfile}
                onNavigateToSubject={(subId) => {
                  setSelectedSubjectId(subId);
                  setCurrentScreen('chapters');
                }}
                isIncompleteProfile={isIncompleteProfile}
                onCompleteProfile={goCompleteProfile}
                language={trackerState.language || 'en'}
              />
            );
          }

          if (currentScreen === 'resources') {
            return (
              <ResourcesView
                profile={pageProfile}
                onUpdateProfile={handleUpdateProfile}
                onRecordStudyActivity={handleRecordQualifyingStudyActivity}
                initialSubjectFilter={resourcesSubjectFilter}
                initialCategoryFilter={resourcesCategoryFilter}
                initialSearchQuery={resourcesSearchQuery}
                enrolledSubjectIds={pageProfile.selectedSubjectIds}
                isIncompleteProfile={isIncompleteProfile}
                onCompleteProfile={goCompleteProfile}
                language={trackerState.language || 'en'}
              />
            );
          }

          if (currentScreen === 'settings') {
            return (
              <SettingsView
                profile={pageProfile}
                profiles={trackerState.profiles}
                onSelectProfile={handleSelectProfile}
                onNewProfile={handleNewProfile}
                currentFont={trackerState.fontFamily || 'sans'}
                onFontChange={handleFontChange}
                currentLanguage={trackerState.language || 'en'}
                onLanguageChange={handleLanguageChange}
                onResetTracker={handleResetTracker}
                onOpenVideoTour={() => setShowVideoTourModal(true)}
                onSimulateAutoReset={handleSimulateAutoReset}
                onUpdateSelectedSubjects={handleUpdateSelectedSubjects}
                onUpdateProfile={handleUpdateProfile}
                onUpdatePomodoroMinutes={handleUpdatePomodoroMinutes}
                trackerState={trackerState}
                onOpenSubjectChapters={(subId) => {
                  setSelectedSubjectId(subId);
                  setCurrentScreen('chapters');
                }}
                onNavigateToFocus={() => setCurrentScreen('focus')}
                isIncompleteProfile={isIncompleteProfile}
                onCompleteProfile={goCompleteProfile}
                onTriggerLaunchTransition={() => {
                  if (activeProfile) {
                    setTransitionState({
                      isOpen: true,
                      mode: 'welcome-launch',
                      studentName: activeProfile.name,
                      targetPercentage: activeProfile.targetPercentage,
                      firstPaperDate: activeProfile.firstPaperDate,
                      streakDays: activeProfile.streak?.count ?? 0,
                      selectedSubjectsCount: (activeProfile.selectedSubjectIds || []).length || 5,
                    });
                  }
                }}
              />
            );
          }

          if (currentScreen === 'aura-ai') {
            const studioView = (
              <div className="w-full max-w-7xl mx-auto space-y-4 pb-16 sm:pb-20 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('dashboard')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-xs sm:text-sm font-black text-cyan-300 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>← Back to Home</span>
                  </button>
                </div>
                <AuraAIStudio onClose={() => setCurrentScreen('dashboard')} />
              </div>
            );
            return isIncompleteProfile ? (
              <LockedFeatureOverlay
                variant="screen"
                featureLabel="Goalbeam AI Studio"
                onCompleteProfile={goCompleteProfile}
              >
                {studioView}
              </LockedFeatureOverlay>
            ) : (
              studioView
            );
          }

          return null;
        })()}
        </Suspense>

        {/* Website Footer (hidden during zero-scroll entry & chapter selection screens) */}
        {!isLockedViewportScreen && (
          <footer className="mt-8 pt-5 pb-4 border-t border-[var(--border-color)]/60 flex flex-col items-center justify-center text-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <div className="creator-signature inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-rose-500/30 shadow-sm text-xs sm:text-sm">
                <span className="creator-prefix">Made with</span>
                <BlinkingHeart />
                <span className="creator-author text-base sm:text-lg leading-none">by Shahid Shaikh</span>
              </div>
              <YouTubeChannelButton variant="footer" />
              <PWAInstallButton variant="footer" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium flex items-center justify-center gap-1.5 flex-wrap">
              <span className="brand-wordmark text-xs">GOALBEAM</span>
              <span aria-hidden="true">•</span>
              <span>Strictly CBSE Class 10 Course &amp; Syllabus Mastery Tracker</span>
            </p>
            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-[var(--text-secondary)] flex-wrap">
              <button
                type="button"
                onClick={() => setActiveLegalModal('about')}
                className="hover:text-cyan-400 underline-offset-2 hover:underline cursor-pointer transition-colors"
              >
                About Us
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setActiveLegalModal('privacy')}
                className="hover:text-cyan-400 underline-offset-2 hover:underline cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setActiveLegalModal('disclaimer')}
                className="hover:text-cyan-400 underline-offset-2 hover:underline cursor-pointer transition-colors"
              >
                Disclaimer
              </button>
            </div>
          </footer>
        )}
      </main>

      {/* Luminous Entrance & Exit Horizon Gate right above Bottom Navigation */}
      {currentScreen !== 'onboarding' && (
        <div
          id="app-scroll-gate"
          aria-hidden="true"
          className="scroll-horizon-gate"
        />
      )}

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Bottom Navigation visible across Dashboard & all workspaces */}
      {currentScreen !== 'onboarding' && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            if (screen === currentScreen) {
              resetScrollToTop();
            } else {
              setCurrentScreen(screen);
            }
          }}
          language={trackerState.language || 'en'}
        />
      )}

      {/* Standalone Master Video Guide Modal */}
      {showVideoTourModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-hidden">
          <div className="w-full max-w-5xl max-h-[94dvh] overflow-y-auto rounded-2xl">
            <Suspense
              fallback={
                <div className="p-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center text-xs font-bold text-[var(--text-secondary)]">
                  Loading Video Guide...
                </div>
              }
            >
              <ManualVideoTour
                isModal
                onClose={() => setShowVideoTourModal(false)}
                onProceedToDashboard={() => {
                  setShowVideoTourModal(false);
                  setCurrentScreen('dashboard');
                  if (activeProfile) {
                    setTransitionState({
                      isOpen: true,
                      mode: 'tour-complete',
                      studentName: activeProfile.name,
                      targetPercentage: activeProfile.targetPercentage,
                      firstPaperDate: activeProfile.firstPaperDate,
                      streakDays: activeProfile.streak?.count ?? 0,
                      selectedSubjectsCount: (activeProfile.selectedSubjectIds || []).length || 5,
                    });
                  }
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Full-Screen Launch & Entry Portal Transition */}
      {transitionState && transitionState.isOpen && (
        <LaunchPortalTransition
          mode={transitionState.mode}
          studentName={transitionState.studentName}
          targetPercentage={transitionState.targetPercentage}
          firstPaperDate={transitionState.firstPaperDate}
          streakDays={transitionState.streakDays}
          selectedSubjectsCount={transitionState.selectedSubjectsCount}
          onComplete={() => setTransitionState(null)}
        />
      )}

      {/* 100% Working Colourful Section-Wise 5:00 AM Morning Target Notification Modal (Laptop, Mobile & Tablet) */}
      <MorningNotificationModal
        payload={morningNotificationPayload}
        onClose={() => setMorningNotificationPayload(null)}
        onStartNotification={async () => {
          if (!activeProfile) {
            setMorningNotificationPayload(null);
            return;
          }
          dismissMorningNotificationPrompt();
          setShowSecondVisitPromptModal(false);
          setShowInactivityModal(false);
          await requestNotificationPermission().catch(() => 'default' as NotificationPermission);
          const updatedProfile: Profile = {
            ...activeProfile,
            notificationSettings: {
              ...activeProfile.notificationSettings,
              enabled: true,
              morningReminderTime:
                activeProfile.notificationSettings?.morningReminderTime || '05:00',
              studyStartTime:
                activeProfile.notificationSettings?.studyStartTime || '05:00',
              studyEndTime:
                activeProfile.notificationSettings?.studyEndTime || '22:00',
            },
          };
          handleUpdateProfile(updatedProfile);
          resumeNotificationsAfterInactivity(updatedProfile, trackerState.language || 'en');
          setMorningNotificationPayload(null);
        }}
        onMarkStageDone={(subId, chId, stg) => {
          handleUpdateStage(subId, chId, stg, 'done');
        }}
        onOpenSubjectChapter={(subId) => {
          setSelectedSubjectId(subId);
          setCurrentScreen('chapters');
        }}
        onChangeSoundType={(newSound) => {
          if (!activeProfile) return;
          const updatedProfile: Profile = {
            ...activeProfile,
            notificationSettings: {
              ...activeProfile.notificationSettings,
              enabled: activeProfile.notificationSettings?.enabled ?? true,
              morningReminderTime:
                activeProfile.notificationSettings?.morningReminderTime || '05:00',
              soundType: newSound,
            },
          };
          handleUpdateProfile(updatedProfile);
        }}
      />

      {/* 3-Day Inactivity Notification Resume / Pause Confirmation Prompt */}
      {showInactivityModal && activeProfile && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border-2 border-amber-500/60 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  Resume Daily Target Notifications?
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Welcome back, {activeProfile.name}! 🌟
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Daily target notifications were paused after 3+ days away. Resume?
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    resumeNotificationsAfterInactivity(activeProfile, trackerState.language || 'en');
                    const updatedProfile: Profile = {
                      ...activeProfile,
                      notificationSettings: {
                        ...activeProfile.notificationSettings,
                        enabled: true,
                        morningReminderTime: activeProfile.notificationSettings?.morningReminderTime || '05:00',
                      },
                    };
                    handleUpdateProfile(updatedProfile);
                    setShowInactivityModal(false);
                  }}
                  className="py-3 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer text-center"
                >
                  <span>✅ Yes, Resume Notifications</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    pauseNotificationsAfterInactivity();
                    const updatedProfile: Profile = {
                      ...activeProfile,
                      notificationSettings: {
                        ...activeProfile.notificationSettings,
                        morningReminderTime: activeProfile.notificationSettings?.morningReminderTime || '05:00',
                        enabled: false,
                      },
                    };
                    handleUpdateProfile(updatedProfile);
                    setShowInactivityModal(false);
                  }}
                  className="py-3 px-3.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 border border-[var(--border-color)] transition-colors cursor-pointer text-center"
                >
                  <span>❌ No, Keep Notifications Off</span>
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await sendMorningStudyReminder(
                    activeProfile,
                    trackerState.language || 'en',
                    true,
                    'screens'
                  );
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 hover:opacity-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <span>🌅 Preview Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2nd Visit Notification Opt-in Prompt Modal (Not shown on 1st visit) */}
      {showSecondVisitPromptModal && activeProfile && !showInactivityModal && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border-2 border-amber-400/70 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-500/20 text-amber-300 border border-amber-400/50 shrink-0">
                <Sunrise className="w-7 h-7 animate-pulse text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/40">
                    Visit 2 Prompt
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1">
                  Enable Daily Study Notifications?
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Activate daily section-wise study target notifications for <strong className="text-[var(--text-primary)]">{activeProfile.name}</strong>?
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    dismissMorningNotificationPrompt();
                    setShowSecondVisitPromptModal(false);
                    await requestNotificationPermission();
                    const updatedProfile: Profile = {
                      ...activeProfile,
                      notificationSettings: {
                        ...activeProfile.notificationSettings,
                        enabled: true,
                        morningReminderTime: activeProfile.notificationSettings?.morningReminderTime || '05:00',
                        studyStartTime: activeProfile.notificationSettings?.studyStartTime || '05:00',
                        studyEndTime: activeProfile.notificationSettings?.studyEndTime || '22:00',
                      },
                    };
                    handleUpdateProfile(updatedProfile);
                    await sendMorningStudyReminder(updatedProfile, trackerState.language || 'en');
                  }}
                  className="py-3 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer text-center"
                >
                  <span>🌅 Enable Notifications</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    dismissMorningNotificationPrompt();
                    setShowSecondVisitPromptModal(false);
                  }}
                  className="py-3 px-3.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 border border-[var(--border-color)] transition-colors cursor-pointer text-center"
                >
                  <span>Not Now / Dismiss</span>
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await sendMorningStudyReminder(
                    activeProfile,
                    trackerState.language || 'en',
                    true,
                    'screens'
                  );
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 hover:opacity-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <span>🌅 Preview Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust, Privacy & Disclaimer Modal */}
      {activeLegalModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActiveLegalModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 sm:p-6 shadow-2xl space-y-3 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2.5">
              <h3 className="text-base font-black text-[var(--text-primary)]">
                {activeLegalModal === 'about'
                  ? <>About <span className="brand-wordmark">GOALBEAM</span> ⚡ — CBSE Class 10 Course Matrix</>
                  : activeLegalModal === 'privacy'
                  ? <>Privacy Policy — <span className="brand-wordmark">GOALBEAM</span> Class 10 Course Tracker</>
                  : 'Educational Disclaimer'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            {activeLegalModal === 'about' && (
              <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  <strong className="brand-wordmark">GOALBEAM</strong> <span className="text-amber-400">⚡</span> (<em>Goal + Beam</em>) is a free, student-first CBSE Class 10 Board Course &amp; syllabus tracker, revision vault, quiz trainer, and study timer created by <strong className="text-cyan-400">Shahid Shaikh</strong>.
                </p>
                <p>
                  It organizes 54 official CBSE Class 10 course subjects, NCERT/SQP/PYQ portals, multilingual study labels, and daily consistency streaks in one distraction-free workspace.
                </p>
              </div>
            )}
            {activeLegalModal === 'privacy' && (
              <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  <strong className="text-[var(--text-primary)]">Local-First Storage:</strong> Your study profiles, chapter progress, notes, and timetable stay saved locally inside your browser storage unless you export a JSON backup or opt into the public Syllabus Leaderboard.
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">No Hidden Tracking:</strong> We do not sell personal student data. Notifications require your explicit browser permission and can be paused or reset anytime in Settings.
                </p>
              </div>
            )}
            {activeLegalModal === 'disclaimer' && (
              <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  <span className="brand-wordmark font-extrabold">GOALBEAM</span> is an independent educational study companion and is <strong className="text-[var(--text-primary)]">not officially affiliated with CBSE or NCERT</strong>.
                </p>
                <p>
                  All linked sample papers, marking schemes, and textbooks point directly to public educational portals (such as cbseacademic.nic.in, cbse.gov.in, and ncert.nic.in) for convenient student reference. Always verify final board exam circulars on official CBSE portals.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Qualifying Website Update Screen (Strictly Form Changes & New Features Only) */}
      <AppUpdateModal
        update={pendingAppUpdate}
        onDismiss={() => {
          if (pendingAppUpdate?.latestVersion) {
            try {
              localStorage.setItem(SEEN_APP_VERSION_KEY, pendingAppUpdate.latestVersion);
            } catch {}
          }
          setPendingAppUpdate(null);
        }}
        onOpenChangeTarget={(item: AppUpdateChangeItem) => {
          if (pendingAppUpdate?.latestVersion) {
            try {
              localStorage.setItem(SEEN_APP_VERSION_KEY, pendingAppUpdate.latestVersion);
            } catch {}
          }
          setPendingAppUpdate(null);
          if (item.scope === 'form-change') {
            setIsUpdatingFormInPlace(true);
            setCurrentScreen(item.actionScreen || 'onboarding');
          } else if (item.actionScreen) {
            setCurrentScreen(item.actionScreen);
          }
        }}
        onReloadToLatest={() => {
          if (pendingAppUpdate?.latestVersion) {
            try {
              localStorage.setItem(SEEN_APP_VERSION_KEY, pendingAppUpdate.latestVersion);
            } catch {}
          }
          window.location.reload();
        }}
      />
    </div>
  );
}
