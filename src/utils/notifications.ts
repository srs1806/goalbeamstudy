import { Profile, LanguageMode, MorningSoundType, StageKey } from '../types/tracker';
export type { MorningSoundType };
import { getDaysUntilFirstPaper, getOverallStats, getTodaysFocus } from './planner';
import {
  getLocalizedSubjectName,
  getLocalizedGroupName,
  getLocalizedChapterName,
  getLocalizedChapterPrefix,
} from './chapterTranslations';
import { playSoftStartupChime } from './audio';
import { getSubjectColorTheme as getRegistryTheme } from './subjectColors';
import { DEPLOY_BASE_PREFIX, getAppAssetUrl } from './seoMetadata';

export interface NotificationSettings {
  enabled: boolean;
  morningReminderTime: string; // "05:00"
  studyStartTime?: string; // "05:00"
  studyEndTime?: string; // "22:00"
  lastNotifiedDate?: string; // "YYYY-MM-DD"
  soundType?: MorningSoundType;
}

export interface MorningSoundOption {
  id: MorningSoundType;
  name: string;
  badge: string;
  description: string;
}

export const MORNING_SOUND_OPTIONS: MorningSoundOption[] = [
  {
    id: 'zenith-symphony',
    name: '🔔 Normal Small Beep (Startup Chime)',
    badge: 'Soft & Gentle',
    description: 'Normal small acoustic beep (identical to website loading sound)',
  },
  {
    id: 'himalayan-chimes',
    name: '🎐 Soft Dawn Ping',
    badge: 'Gentle Ping',
    description: 'Subtle soft crystal harmonic ping',
  },
  {
    id: 'marimba-sunrise',
    name: '🎹 Soft Acoustic Ping',
    badge: 'Gentle Ping',
    description: 'Gentle acoustic ping note',
  },
  {
    id: 'cyber-awakening',
    name: '🚀 Clean Digital Ping',
    badge: 'Short Tone',
    description: 'Crisp, gentle digital blip',
  },
];

export interface SectionTargetCard {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  sectionName: string;
  chapterId: string;
  chapterNo: number;
  chapterPrefix: string;
  chapterName: string;
  nextStageKey: StageKey;
  nextStageLabel: string;
  completedStagesCount: number;
  totalStagesCount: number;
  highYield: boolean;
  subjectPercentComplete: number;
  stagesPerDayNeeded: number;
  // Vibrant distinct colour theme per subject
  colorName: string;
  colorEmoji: string;
  hexPrimary: string;
  hexSecondary: string;
  gradientClass: string;
  borderClass: string;
  badgeBgClass: string;
  textAccentClass: string;
}

export interface ScheduleSlotItem {
  slotId: string;
  timeRange: string;
  title: string;
  subtitle: string;
  taskSummary: string;
  badge: string;
  gradientClass: string;
  borderClass: string;
  textClass: string;
}

export interface MorningNotificationPayload {
  id: string;
  triggeredAt: string;
  studentName: string;
  cycleDateKey: string;
  cycleDateFormatted: string;
  reminderTime: string;
  daysLeft: number;
  firstPaperDate: string;
  streakCount: number;
  overallPercent: number;
  targetPercentage: number;
  dailyHourGoal: number;
  dailyStageGoal: number;
  stagesRemaining: number;
  soundType: MorningSoundType;
  soundName: string;
  sectionTargets: SectionTargetCard[];
  scheduleSlots: ScheduleSlotItem[];
  previewMode?: 'screens' | 'targets';
}

export const MORNING_NOTIFICATION_EVENT = 'zenith:morning-notification';

export const LAST_VISIT_STORAGE_KEY = 'zenith_last_visit_timestamp';
export const NOTIFS_PAUSED_INACTIVITY_KEY = 'zenith_notifs_paused_inactivity';
export const VISIT_COUNT_STORAGE_KEY = 'zenith_user_visit_count';
export const NOTIF_PROMPT_DISMISSED_KEY = 'zenith_morning_notif_prompt_dismissed';

/**
 * Returns total recorded visits across sessions.
 */
export function getUserVisitCount(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const val = localStorage.getItem(VISIT_COUNT_STORAGE_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 1;
  }
}

/**
 * Records and increments user visit count on website visit.
 * Only increments once per browser session.
 */
export function recordAndIncrementUserVisit(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const sessionMark = sessionStorage.getItem('zenith_session_visit_counted');
    const current = getUserVisitCount();
    if (!sessionMark) {
      const next = current + 1;
      localStorage.setItem(VISIT_COUNT_STORAGE_KEY, String(next));
      sessionStorage.setItem('zenith_session_visit_counted', 'true');
      return next;
    }
    return current;
  } catch {
    return 1;
  }
}

/**
 * Determines whether the 5:00 AM notification prompt modal should be shown:
 * Strictly suppressed on 1st-ever visit. Triggers on 2nd visit onwards until answered.
 */
export function shouldPromptMorningNotification(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dismissed = localStorage.getItem(NOTIF_PROMPT_DISMISSED_KEY);
    if (dismissed === 'true') return false;
    const visits = getUserVisitCount();
    // Do NOT display on user's first-ever visit (visits < 2). Show only on visit 2 or later.
    return visits >= 2;
  } catch {
    return false;
  }
}

/**
 * Dismisses the morning notification prompt and records preference.
 */
export function dismissMorningNotificationPrompt(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIF_PROMPT_DISMISSED_KEY, 'true');
  } catch {}
}

/**
 * Check if the browser supports the Web Notification API
 */
export function isNotificationSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 'Notification' in window && typeof Notification !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Get current notification permission safely from the browser.
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !isNotificationSupported()) return 'default';
  try {
    return Notification.permission;
  } catch {
    return 'default';
  }
}

/**
 * Request real notification permission from the student's operating system/browser.
 * Also registers the service worker so background & lockscreen notifications work.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !isNotificationSupported()) return 'default';

  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }

    const currentPerm = getNotificationPermission();
    if (currentPerm === 'default' && typeof Notification.requestPermission === 'function') {
      const perm = await Notification.requestPermission();
      return perm;
    }
    return getNotificationPermission();
  } catch (err) {
    console.warn('Notification permission request:', err);
    return getNotificationPermission();
  }
}

/**
 * Records student visit timestamp and checks if 3 consecutive days passed without visiting
 */
export function recordUserVisit(): { wasAwayFor3Days: boolean; isPaused: boolean } {
  if (typeof window === 'undefined') return { wasAwayFor3Days: false, isPaused: false };
  try {
    const lastVisitStr = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
    const isPausedAlready = localStorage.getItem(NOTIFS_PAUSED_INACTIVITY_KEY) === 'true';
    const now = Date.now();
    const lastVisit = lastVisitStr ? parseInt(lastVisitStr, 10) : 0;

    // 3 days = 72 hours
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const wasAwayFor3Days = lastVisit > 0 && (now - lastVisit) >= threeDaysMs;

    if (wasAwayFor3Days && !isPausedAlready) {
      localStorage.setItem(NOTIFS_PAUSED_INACTIVITY_KEY, 'true');
      return { wasAwayFor3Days: true, isPaused: true };
    }

    if (isPausedAlready) {
      return { wasAwayFor3Days: true, isPaused: true };
    }

    // Active continuous visit
    localStorage.setItem(LAST_VISIT_STORAGE_KEY, String(now));
    return { wasAwayFor3Days: false, isPaused: false };
  } catch {
    return { wasAwayFor3Days: false, isPaused: false };
  }
}

export function isNotificationsPausedForInactivity(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(NOTIFS_PAUSED_INACTIVITY_KEY) === 'true';
  } catch {
    return false;
  }
}

export function resumeNotificationsAfterInactivity(profile: Profile, lang: LanguageMode = 'en'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(NOTIFS_PAUSED_INACTIVITY_KEY);
    localStorage.setItem(LAST_VISIT_STORAGE_KEY, String(Date.now()));
  } catch {}
  // Immediately dispatch today's target to device notification tray
  sendMorningStudyReminder(profile, lang);
}

export function pauseNotificationsAfterInactivity(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFS_PAUSED_INACTIVITY_KEY, 'true');
    localStorage.setItem(LAST_VISIT_STORAGE_KEY, String(Date.now()));
  } catch {}
}

/**
 * Distinct Colour Palette Mapper so every subject/section in the notification has a different vibrant colour
 */
function getSubjectColorTheme(subjectId: string, _index: number): {
  colorName: string;
  colorEmoji: string;
  hexPrimary: string;
  hexSecondary: string;
  gradientClass: string;
  borderClass: string;
  badgeBgClass: string;
  textAccentClass: string;
} {
  const theme = getRegistryTheme(subjectId);
  return {
    colorName: theme.colorName,
    colorEmoji: theme.colorEmoji,
    hexPrimary: theme.color,
    hexSecondary: theme.secondaryHex,
    gradientClass: theme.gradientClass,
    borderClass: theme.borderClass,
    badgeBgClass: theme.badgeBgClass,
    textAccentClass: theme.textAccentClass,
  };
}

export function playCustomMorningNotificationSound(
  _soundType: MorningSoundType = 'zenith-symphony'
): void {
  if (typeof window === 'undefined') return;

  // Gentle small vibration pulse (35ms) if supported
  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(35);
    }
  } catch {
    // ignore vibration errors
  }

  // Play normal small beep which is there while loading the website
  playSoftStartupChime();
}

/**
 * Backward-compatible alias for gentle study chime
 */
export function playGentleStudyChime(): void {
  playCustomMorningNotificationSound('zenith-symphony');
}

/**
 * Builds the comprehensive, Section-Wise, Multi-Colour Morning Notification Payload
 */
export function buildSectionWiseMorningPayload(
  profile: Profile,
  language: LanguageMode = 'en'
): MorningNotificationPayload {
  const stats = getOverallStats(profile);
  const daysLeft = getDaysUntilFirstPaper(profile.firstPaperDate);
  const streakCount = profile.streak?.count ?? 0;
  const focusItems = getTodaysFocus(profile, 6);
  const chPrefix = getLocalizedChapterPrefix(language);

  const now = new Date();
  const cycleDate = new Date(now);
  if (now.getHours() < 5) {
    cycleDate.setDate(cycleDate.getDate() - 1);
  }
  const year = cycleDate.getFullYear();
  const month = String(cycleDate.getMonth() + 1).padStart(2, '0');
  const day = String(cycleDate.getDate()).padStart(2, '0');
  const cycleDateKey = `${year}-${month}-${day}`;

  const cycleDateFormatted = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const sectionTargets: SectionTargetCard[] = focusItems.map((item, idx) => {
    const colorTheme = getSubjectColorTheme(item.subjectId, idx);
    const subjectPace = stats.paces.find((p) => p.subjectId === item.subjectId);
    const localizedSubName = getLocalizedSubjectName(item.subjectId, item.subjectName, language);
    const localizedSecName = getLocalizedGroupName(
      item.groupName,
      language
    );
    const localizedChName = getLocalizedChapterName(
      item.chapterId,
      item.chapterName,
      language
    );

    return {
      subjectId: item.subjectId,
      subjectCode: item.subjectCode,
      subjectName: localizedSubName,
      sectionName: localizedSecName || 'Core Syllabus Section',
      chapterId: item.chapterId,
      chapterNo: item.chapterNo,
      chapterPrefix: chPrefix,
      chapterName: localizedChName,
      nextStageKey: item.nextStage,
      nextStageLabel: item.stageLabel,
      completedStagesCount: item.completedStagesCount,
      totalStagesCount: item.totalStagesCount,
      highYield: Boolean(item.highYield),
      subjectPercentComplete: subjectPace?.percentComplete || 0,
      stagesPerDayNeeded: subjectPace?.stagesPerDayNeeded || 0.5,
      ...colorTheme,
    };
  });

  const topTarget1 = sectionTargets[0];
  const topTarget2 = sectionTargets[1] || sectionTargets[0];
  const topTarget3 = sectionTargets[2] || sectionTargets[0];

  const scheduleSlots: ScheduleSlotItem[] = [
    {
      slotId: 'dawn-block',
      timeRange: 'Priority Session',
      title: '🌅 Section 1: High-Yield Concept & NCERT Mastery',
      subtitle: 'Peak Brain Retention Slot',
      taskSummary: topTarget1
        ? `${topTarget1.subjectName} (${topTarget1.sectionName}) — ${topTarget1.chapterPrefix} ${topTarget1.chapterNo}: ${topTarget1.chapterName} [${topTarget1.nextStageLabel}]`
        : 'Read High-Yield NCERT Concepts & Highlight Key Definitions',
      badge: 'Priority #1',
      gradientClass: 'from-amber-500/25 via-orange-500/15 to-rose-500/20',
      borderClass: 'border-amber-400/60',
      textClass: 'text-amber-300',
    },
    {
      slotId: 'practice-block',
      timeRange: 'Afternoon Sprint',
      title: '⚡ Section 2: Problem Solving, Theorems & Reference Practice',
      subtitle: 'Application & Analytical Slot',
      taskSummary: topTarget2
        ? `${topTarget2.subjectName} (${topTarget2.sectionName}) — ${topTarget2.chapterPrefix} ${topTarget2.chapterNo}: ${topTarget2.chapterName} [${topTarget2.nextStageLabel}]`
        : 'Solve Reference Book Questions, Derivations & Numericals',
      badge: 'Priority #2',
      gradientClass: 'from-cyan-500/25 via-sky-500/15 to-indigo-500/20',
      borderClass: 'border-cyan-400/60',
      textClass: 'text-cyan-300',
    },
    {
      slotId: 'pyq-block',
      timeRange: 'Evening Revision',
      title: '🎯 Section 3: Board PYQs, CBQs & Daily Target Wrap-Up',
      subtitle: `Target Pace: ${stats.dailyTotalStageGoal} Stages / Day (${profile.dailyHourGoal || 4} Hrs)`,
      taskSummary: topTarget3
        ? `${topTarget3.subjectName} (${topTarget3.sectionName}) — ${topTarget3.chapterPrefix} ${topTarget3.chapterNo}: ${topTarget3.chapterName} [${topTarget3.nextStageLabel}]`
        : 'Complete Past 10-Year CBSE Board PYQs & Self-Evaluation Worksheet',
      badge: 'Board Lock-In',
      gradientClass: 'from-emerald-500/25 via-teal-500/15 to-cyan-500/20',
      borderClass: 'border-emerald-400/60',
      textClass: 'text-emerald-300',
    },
  ];

  const soundType: MorningSoundType =
    profile.notificationSettings?.soundType || 'zenith-symphony';
  const soundObj =
    MORNING_SOUND_OPTIONS.find((s) => s.id === soundType) || MORNING_SOUND_OPTIONS[0];

  return {
    id: 'notif_' + Date.now(),
    triggeredAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    studentName: profile.name || 'Class 10 Scholar',
    cycleDateKey,
    cycleDateFormatted,
    reminderTime: profile.notificationSettings?.morningReminderTime || '05:00',
    daysLeft,
    firstPaperDate: profile.firstPaperDate,
    streakCount,
    overallPercent: stats.overallPercent,
    targetPercentage: profile.targetPercentage || 95,
    dailyHourGoal: profile.dailyHourGoal || 4,
    dailyStageGoal: stats.dailyTotalStageGoal,
    stagesRemaining: stats.stagesRemaining,
    soundType,
    soundName: soundObj.name,
    sectionTargets,
    scheduleSlots,
  };
}

/**
 * Generates a vibrant, multi-colour Section-Wise Today's Target Banner Image via HTML5 Canvas
 * so Mobile (Android/Chrome) and Laptop/Tablet native notifications render a rich colourful card!
 */
function generateColourfulNotificationBannerDataUrl(
  payload: MorningNotificationPayload
): string | undefined {
  if (typeof document === 'undefined') return undefined;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    // Deep Rich Background
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 420);
    bgGrad.addColorStop(0, '#0e1015');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 420);

    // Top Rainbow / Multi-Colour Accent Bar
    const topBarGrad = ctx.createLinearGradient(0, 0, 800, 0);
    topBarGrad.addColorStop(0, '#f59e0b');
    topBarGrad.addColorStop(0.25, '#06b6d4');
    topBarGrad.addColorStop(0.5, '#10b981');
    topBarGrad.addColorStop(0.75, '#8b5cf6');
    topBarGrad.addColorStop(1, '#f43f5e');
    ctx.fillStyle = topBarGrad;
    ctx.fillRect(0, 0, 800, 10);

    // Header Banner Box
    ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
    ctx.fillRect(20, 22, 760, 68);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 22, 760, 68);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`🌅 TODAY'S STUDY TARGET — ${payload.studentName.toUpperCase()}`, 36, 54);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(
      `🔥 ${payload.streakCount} Day Streak   •   ⏳ ${payload.daysLeft} Days to 1st Paper   •   🎯 Pace: ${payload.dailyStageGoal} Stages/Day   •   📈 ${payload.overallPercent}% Done`,
      36,
      78
    );

    // Section-Wise Colourful Target Rows (Up to 4 distinct coloured rows)
    const rows = payload.sectionTargets.slice(0, 4);
    rows.forEach((item, idx) => {
      const y = 104 + idx * 74;

      // Coloured Card Background
      ctx.fillStyle = item.hexPrimary + '26'; // 15% opacity hex
      ctx.fillRect(20, y, 760, 64);

      // Left Solid Colour Stripe
      ctx.fillStyle = item.hexPrimary;
      ctx.fillRect(20, y, 10, 64);

      // Card Border
      ctx.strokeStyle = item.hexPrimary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, y, 760, 64);

      // Subject & Section Header
      ctx.fillStyle = item.hexPrimary;
      ctx.font = 'bold 17px sans-serif';
      const subHeader = `${item.subjectName.toUpperCase()}  |  SECTION: ${item.sectionName}`;
      ctx.fillText(subHeader.slice(0, 58), 44, y + 26);

      // Stage Pill on Right
      ctx.fillStyle = item.hexPrimary;
      ctx.fillRect(610, y + 10, 154, 24);
      ctx.fillStyle = '#0e1015';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`STAGE: ${item.nextStageLabel}`, 620, y + 27);

      // Chapter Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      const chLine = `${item.chapterPrefix} ${item.chapterNo}: ${item.chapterName} (${item.completedStagesCount}/${item.totalStagesCount} Stages Done)`;
      ctx.fillText(chLine.slice(0, 72), 44, y + 51);
    });

    return canvas.toDataURL('image/png');
  } catch {
    return undefined;
  }
}

/**
 * Dispatches a native Web Notification to the student's operating system / device
 * Visible in the mobile notification bar / pull-down drawer and laptop desktop corner action center,
 * with action buttons including "Mark Done" and "View Today's Target".
 */
export async function showStudyNotification(
  title: string,
  options: NotificationOptions & { image?: string; renotify?: boolean; vibrate?: number[] } = {}
): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  // Ensure permission is granted
  let perm = getNotificationPermission();
  if (perm === 'default') {
    perm = await requestNotificationPermission();
  }
  if (perm !== 'granted') {
    return false;
  }

  const baseOptions: any = {
    icon: getAppAssetUrl('logo.png'),
    badge: getAppAssetUrl('logo.png'),
    tag: 'zenith-today-target',
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'mark_done', title: '✅ Mark Done' },
      { action: 'open-targets', title: '🎯 View Target' },
    ],
    ...options,
  };

  // 1. Dispatch via Service Worker (Strictly required for Mobile Android notification bar / PWA / Laptop Action Center)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        const swScope = DEPLOY_BASE_PREFIX ? `${DEPLOY_BASE_PREFIX}/` : '/';
        reg = await navigator.serviceWorker.register(getAppAssetUrl('sw.js'), { scope: swScope });
      }
      if (reg && typeof reg.showNotification === 'function') {
        if (reg.active) {
          reg.active.postMessage({
            type: 'SHOW_DEVICE_NOTIFICATION',
            title,
            options: baseOptions,
          });
        }
        await reg.showNotification(title, baseOptions);
        return true;
      }
    } catch (swErr) {
      console.warn('Service Worker showNotification attempt:', swErr);
    }
  }

  // 2. Desktop Window Notification fallback (omit actions/vibrate/image which throw TypeError in non-SW Notification constructors)
  try {
    const windowOptions: NotificationOptions = {
      body: baseOptions.body,
      icon: baseOptions.icon,
      badge: baseOptions.badge,
      tag: baseOptions.tag,
      silent: baseOptions.silent,
    };
    const notification = new Notification(title, windowOptions);
    notification.onclick = () => {
      try {
        window.focus();
      } catch {}
      notification.close();
    };
    return true;
  } catch (err) {
    console.warn('Native notification fallback skipped:', err);
    return false;
  }
}

/**
 * Constructs and fires the daily 5:00 AM morning study reminder:
 * 1. Plays the distinctive Custom Morning Notification Sound
 * 2. Renders the Colourful Section-Wise In-App Notification Popup/Drawer
 * 3. Sends the native Mobile/Desktop Notification to the OS Notification Tray with "Mark Done" button!
 */
export async function sendMorningStudyReminder(
  profile: Profile,
  language: LanguageMode = 'en',
  showInAppModal: boolean = false,
  previewMode: 'screens' | 'targets' = 'targets'
): Promise<MorningNotificationPayload> {
  // If paused due to 3-day inactivity, skip background scheduled alerts,
  // but still allow explicit manual previews when requested.
  if (!showInAppModal && isNotificationsPausedForInactivity()) {
    return buildSectionWiseMorningPayload(profile, language);
  }

  await requestNotificationPermission().catch(() => 'default' as NotificationPermission);

  const payload = buildSectionWiseMorningPayload(profile, language);
  if (showInAppModal) {
    payload.previewMode = previewMode;
  }

  // 1. Play distinctive custom morning notification melody if explicit modal test
  if (showInAppModal) {
    playCustomMorningNotificationSound(payload.soundType);
  }

  // 2. Dispatch in-app modal event only when explicitly requested (do not pop up on start)
  if (showInAppModal && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<MorningNotificationPayload>(MORNING_NOTIFICATION_EVENT, {
        detail: payload,
      })
    );
  }

  // 3. Build top target notification for OS notification bar (mobile pull-down & laptop corner)
  const topTarget = payload.sectionTargets[0];
  const notifTitle = topTarget
    ? `🌅 Today's Target: ${topTarget.chapterPrefix} ${topTarget.chapterNo} - ${topTarget.chapterName}`
    : `🌅 Today's Study Target: ${payload.studentName}`;

  const notifBody = topTarget
    ? `📚 ${topTarget.subjectName} (${topTarget.sectionName}) • Next: ${topTarget.nextStageLabel}\n🎯 Goal: ${payload.dailyStageGoal} Stages/Day • Tap "Mark Done" to complete milestone!`
    : `🔥 ${payload.streakCount}d Streak • ⏳ ${payload.daysLeft}d to 1st Paper • Check your Class 10 study target!`;

  const bannerImage = generateColourfulNotificationBannerDataUrl(payload);

  await showStudyNotification(notifTitle, {
    body: notifBody,
    icon: getAppAssetUrl('logo.png'),
    image: bannerImage,
  });

  return payload;
}

const DAILY_NOTIFICATION_SLOTS = [
  { id: '05am', hour: 5, minute: 0 },
  { id: '12pm', hour: 12, minute: 0 },
  { id: '04pm', hour: 16, minute: 0 },
  { id: '09pm', hour: 21, minute: 0 },
] as const;

const FIRED_SLOTS_STORAGE_KEY = 'zenith_fired_notification_slot';

/**
 * Periodic & Wake-Up check: sends daily study notifications at:
 * 1) 5:00 AM, 2) 12:00 PM, 3) 4:00 PM, 4) 9:00 PM
 * firing once per slot each day without exposing schedule timing in UI text.
 */
export async function checkAndTriggerMorningReminder(
  profile: Profile,
  onReminderSent: (dateKey: string, payload: MorningNotificationPayload) => void,
  language: LanguageMode = 'en'
): Promise<boolean> {
  const settings = profile.notificationSettings;
  const isEnabled = settings ? Boolean(settings.enabled) : false;
  if (!isEnabled) return false;
  if (isNotificationsPausedForInactivity()) return false;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

  let activeSlot: (typeof DAILY_NOTIFICATION_SLOTS)[number] | null = null;
  for (const slot of DAILY_NOTIFICATION_SLOTS) {
    if (nowTotalMinutes >= slot.hour * 60 + slot.minute) {
      activeSlot = slot;
    }
  }

  if (!activeSlot) {
    return false;
  }

  const slotKey = `${todayStr}-${activeSlot.id}`;
  if (settings?.lastNotifiedDate === slotKey) {
    return false;
  }

  try {
    const lastStored = localStorage.getItem(FIRED_SLOTS_STORAGE_KEY);
    if (lastStored === slotKey) {
      return false;
    }
    localStorage.setItem(FIRED_SLOTS_STORAGE_KEY, slotKey);
  } catch {
    // Ignore storage unavailability
  }

  const payload = await sendMorningStudyReminder(profile, language);
  onReminderSent(slotKey, payload);
  return true;
}
