// Shared memoized page loaders so LaunchPortalTransition and React.lazy()
// share the exact same in-flight/resolved module promises — zero duplicate fetches
// and zero Suspense loading delay when switching tabs.

let onboardingPromise: Promise<typeof import('../components/Onboarding')> | null = null;
let chaptersPromise: Promise<typeof import('../components/ChaptersView')> | null = null;
let practicePromise: Promise<typeof import('../components/PracticeView')> | null = null;
let plannerPromise: Promise<typeof import('../components/PlannerView')> | null = null;
let insightsPromise: Promise<typeof import('../components/InsightsView')> | null = null;
let resourcesPromise: Promise<typeof import('../components/ResourcesView')> | null = null;
let focusPromise: Promise<typeof import('../components/FocusTimerView')> | null = null;
let leaderboardPromise: Promise<typeof import('../components/LeaderboardView')> | null = null;
let settingsPromise: Promise<typeof import('../components/SettingsView')> | null = null;
let auraAIPromise: Promise<typeof import('../components/AuraAIStudio')> | null = null;
let tourPromise: Promise<typeof import('../components/ManualVideoTour')> | null = null;

export const loadOnboarding = () =>
  (onboardingPromise ??= import('../components/Onboarding'));

export const loadChaptersView = () =>
  (chaptersPromise ??= import('../components/ChaptersView'));

export const loadPracticeView = () =>
  (practicePromise ??= import('../components/PracticeView'));

export const loadPlannerView = () =>
  (plannerPromise ??= import('../components/PlannerView'));

export const loadInsightsView = () =>
  (insightsPromise ??= import('../components/InsightsView'));

export const loadResourcesView = () =>
  (resourcesPromise ??= import('../components/ResourcesView'));

export const loadFocusTimerView = () =>
  (focusPromise ??= import('../components/FocusTimerView'));

export const loadLeaderboardView = () =>
  (leaderboardPromise ??= import('../components/LeaderboardView'));

export const loadSettingsView = () =>
  (settingsPromise ??= import('../components/SettingsView'));

export const loadAuraAIStudio = () =>
  (auraAIPromise ??= import('../components/AuraAIStudio'));

export const loadManualVideoTour = () =>
  (tourPromise ??= import('../components/ManualVideoTour'));

export interface PreloadProgressUpdate {
  loaded: number;
  total: number;
  percent: number;
  label: string;
}

let allPreloadPromise: Promise<void> | null = null;

export function preloadAllWorkspacePages(
  onProgress?: (update: PreloadProgressUpdate) => void
): Promise<void> {
  const tasks: Array<{ label: string; run: () => Promise<unknown> }> = [
    { label: 'Loading Chapters & 54 CBSE Subjects...', run: loadChaptersView },
    { label: 'Loading NCERT, PYQ & Resources Vault...', run: loadResourcesView },
    { label: 'Loading Study Insights & Analytics...', run: loadInsightsView },
    { label: 'Loading 10-MCQ Quizzes & Flashcards...', run: loadPracticeView },
    { label: 'Loading Goalbeam Master AI Studio...', run: loadAuraAIStudio },
    { label: 'Loading Timetable & Exam Planner...', run: loadPlannerView },
    { label: 'Loading 3D Focus Garden & Timer...', run: loadFocusTimerView },
    { label: 'Loading Live Syllabus Leaderboard...', run: loadLeaderboardView },
    { label: 'Loading Profile & Preferences...', run: loadSettingsView },
    { label: 'Loading Website Master Guide...', run: loadManualVideoTour },
    { label: 'Loading Student Setup Engine...', run: loadOnboarding },
    {
      label: 'Syncing Typography & UI Ready...',
      run: () =>
        typeof document !== 'undefined' && document.fonts?.ready
          ? document.fonts.ready.catch(() => undefined)
          : Promise.resolve(),
    },
  ];

  const total = tasks.length;

  if (allPreloadPromise) {
    onProgress?.({
      loaded: total,
      total,
      percent: 100,
      label: 'All Workspace Pages Ready! Instant Tab Switch Active 🚀',
    });
    return allPreloadPromise;
  }

  let completed = 0;

  allPreloadPromise = Promise.all(
    tasks.map((task) =>
      task
        .run()
        .catch(() => undefined)
        .finally(() => {
          completed += 1;
          const percent = Math.round((completed / total) * 100);
          onProgress?.({
            loaded: completed,
            total,
            percent,
            label:
              completed >= total
                ? 'All Workspace Pages Loaded — Instant Switching Ready! 🚀'
                : task.label,
          });
        })
    )
  ).then(() => undefined);

  return allPreloadPromise;
}
