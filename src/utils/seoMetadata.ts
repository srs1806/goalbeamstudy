import { ActiveScreen } from '../types/tracker';

export const FALLBACK_SITE_ORIGIN =
  'https://ais-pre-6w7glvhulcqoh47lsmotwo-231466351973.asia-east1.run.app';

export function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return FALLBACK_SITE_ORIGIN;
}

export interface RouteSEOConfig {
  path: string;
  pageName: string;
  shortName: string;
  title: string;
  description: string;
  keywords: string;
}

export const SCREEN_SEO_MAP: Record<ActiveScreen, RouteSEOConfig> = {
  dashboard: {
    path: '/',
    pageName: 'Home Dashboard',
    shortName: 'Home',
    title: 'Goalbeam — CBSE Class 10 Course, Syllabus Tracker, Notes, PYQs & MCQs',
    description:
      'Goalbeam: Free CBSE Class 10 course & syllabus tracker, NCERT notes PDF, PYQs, sample papers, 10-MCQ quizzes & live student leaderboard. Instant access — no login wall.',
    keywords: 'goalbeam, cbse class 10 course, syllabus tracker, notes pdf, pyq, sample papers, mcq, ncert',
  },
  chapters: {
    path: '/chapters',
    pageName: 'CBSE Class 10 Course Chapters Checklist',
    shortName: 'Chapters',
    title: 'CBSE Class 10 Course Chapters Checklist (54 Subjects) — Goalbeam',
    description:
      'Track every CBSE Class 10 course chapter across Maths, Science, SST, English & Hindi on Goalbeam with NCERT milestones, PYQ progress bars, and personal revision notes.',
    keywords: 'goalbeam chapters, class 10 course, cbse checklist, ncert tracker, maths, science, sst',
  },
  practice: {
    path: '/practice',
    pageName: '10-MCQ Quizzes & Flashcards',
    shortName: 'Practice MCQs',
    title: 'Class 10 Course 10-MCQ Quizzes & Formula Flashcards — Goalbeam',
    description:
      'Practice chapter-wise 10-question CBSE Class 10 MCQ sprints anytime on Goalbeam with instant answers, Google Search grounding, and formula flashcards.',
    keywords: 'goalbeam quiz, class 10 mcq quiz, cbse mock test, chapter quiz, flashcards, formulas',
  },
  planner: {
    path: '/planner',
    pageName: 'Timetable & Exam Date-Sheet',
    shortName: 'Timetable',
    title: 'Class 10 Board Exam Date-Sheet & Study Timetable — Goalbeam',
    description:
      'Organize your Class 10 course daily study blocks on Goalbeam with automatic subject-wise exam countdowns and board preparation targets.',
    keywords: 'class 10 timetable, exam datesheet, board study planner, countdown, goalbeam',
  },
  resources: {
    path: '/resources',
    pageName: 'Notes, PYQs & Sample Papers',
    shortName: 'Resources',
    title: 'Class 10 Notes PDF, PYQs & Sample Papers (Free) — Goalbeam',
    description:
      'Download free CBSE Class 10 course revision notes, SST map work guides, PYQs, official Sample Question Papers, Marking Schemes & NCERT PDFs on Goalbeam.',
    keywords: 'class 10 notes pdf, cbse pyq, sample papers sqp, ncert pdf, sst map work, goalbeam',
  },
  'aura-ai': {
    path: '/aura-ai-studio',
    pageName: 'Goalbeam AI Study Studio',
    shortName: 'Goalbeam AI',
    title: 'Class 10 AI Doubt Solver & Concept Visualizer — Goalbeam Studio',
    description:
      'Solve Class 10 Science, Maths, and SST course doubts step by step with Goalbeam AI diagrams, concept motion explainers, live voice tutor & focus audio.',
    keywords: 'goalbeam ai, class 10 doubt solver, ai tutor, science diagrams, cbse course ai',
  },
  focus: {
    path: '/focus-garden',
    pageName: 'Pomodoro Focus Timer',
    shortName: 'Focus Timer',
    title: 'Class 10 Study Pomodoro Timer & 3D Focus Garden — Goalbeam',
    description:
      'Stay locked in during Class 10 course prep using timed Pomodoro study sessions, deep focus tracking, and a 3D study forest on Goalbeam.',
    keywords: 'study pomodoro timer, focus garden, deep study timer, class 10 focus, goalbeam',
  },
  insights: {
    path: '/insights',
    pageName: 'Study Progress Analytics',
    shortName: 'Analytics',
    title: 'Class 10 Course Syllabus Analytics & Subject Matrix — Goalbeam',
    description:
      'Measure overall CBSE Class 10 course completion percentage, subject-by-subject mastery pace, and daily exam readiness on Goalbeam.',
    keywords: 'syllabus analytics, subject progress, exam readiness, class 10 stats, goalbeam',
  },
  leaderboard: {
    path: '/leaderboard',
    pageName: 'Live Leaderboard of Syllabus',
    shortName: 'Leaderboard',
    title: 'Live Class 10 Syllabus Leaderboard — Real Student Ranks | Goalbeam',
    description:
      'See 100% real live rankings of Class 10 students across Goalbeam ranked by overall syllabus completed percentage and all-subject average.',
    keywords: 'syllabus leaderboard, real student ranks, class 10 leaderboard, goalbeam',
  },
  settings: {
    path: '/settings',
    pageName: 'Edit Profile & Settings',
    shortName: 'Profile',
    title: 'Edit Profile, Languages, Themes & Offline Backup — Goalbeam',
    description:
      'Edit your Goalbeam scholar profile, switch profiles, manage CBSE Class 10 subjects, 25 textbook mediums, themes, study reminders, and offline backups.',
    keywords: 'edit profile, profile settings, languages, cbse class 10, offline backup, goalbeam',
  },
  onboarding: {
    path: '/setup',
    pageName: 'CBSE Class 10 Course Setup',
    shortName: 'Setup',
    title: 'Personalize Your CBSE Class 10 Course & Target — Goalbeam Setup',
    description:
      'Select your CBSE Class 10 course subjects, target percentage, and study medium in seconds on Goalbeam to track progress and join the live leaderboard.',
    keywords: 'cbse class 10 setup, select subjects, syllabus setup, goalbeam',
  },
};

const KNOWN_APP_SLUGS = new Set([
  'dashboard',
  'chapters',
  'practice',
  'planner',
  'resources',
  'aura-ai-studio',
  'focus-garden',
  'insights',
  'leaderboard',
  'settings',
  'profile',
  'setup',
]);

function detectDeployBasePrefix(): string {
  if (typeof window === 'undefined') return '';
  const envBase = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL;
  if (typeof envBase === 'string' && envBase.startsWith('/') && envBase !== '/') {
    return envBase.replace(/\/+$/, '');
  }
  const parts = window.location.pathname
    .replace(/\/index\.html$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1 && KNOWN_APP_SLUGS.has(parts[0])) {
    return '';
  }
  if (parts.length >= 2 && KNOWN_APP_SLUGS.has(parts[parts.length - 1])) {
    return '/' + parts.slice(0, -1).join('/');
  }
  return '/' + parts.join('/');
}

export const DEPLOY_BASE_PREFIX = detectDeployBasePrefix();

export function getAppAssetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '');
  return DEPLOY_BASE_PREFIX ? `${DEPLOY_BASE_PREFIX}/${clean}` : `/${clean}`;
}

export function getScreenHref(screen: ActiveScreen): string {
  const cfg = SCREEN_SEO_MAP[screen] || SCREEN_SEO_MAP.dashboard;
  if (!DEPLOY_BASE_PREFIX) return cfg.path;
  return cfg.path === '/' ? `${DEPLOY_BASE_PREFIX}/` : `${DEPLOY_BASE_PREFIX}${cfg.path}`;
}

export function resolveScreenFromPath(pathname: string): ActiveScreen | null {
  let clean = pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '') || '/';
  if (DEPLOY_BASE_PREFIX && clean.startsWith(DEPLOY_BASE_PREFIX)) {
    clean = clean.slice(DEPLOY_BASE_PREFIX.length) || '/';
  }
  if (clean === '/' || clean === '/dashboard') return 'dashboard';
  if (clean === '/profile') return 'settings';
  const entry = (Object.entries(SCREEN_SEO_MAP) as Array<[ActiveScreen, RouteSEOConfig]>).find(
    ([, cfg]) => cfg.path === clean
  );
  return entry ? entry[0] : null;
}

export function applyRouteSEOMetadata(screen: ActiveScreen): void {
  if (typeof document === 'undefined') return;
  const cfg = SCREEN_SEO_MAP[screen] || SCREEN_SEO_MAP.dashboard;
  const origin = getSiteOrigin();
  const canonicalUrl = `${origin}${getScreenHref(screen)}`;
  const ogImageUrl = `${origin}${getAppAssetUrl('og-card.png')}`;

  document.title = cfg.title;

  const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('meta[name="description"]', 'name', 'description', cfg.description);
  setMeta('meta[name="keywords"]', 'name', 'keywords', cfg.keywords);
  setMeta('meta[property="og:title"]', 'property', 'og:title', cfg.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', cfg.description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[property="og:image"]', 'property', 'og:image', ogImageUrl);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', cfg.title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', cfg.description);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImageUrl);

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);
}

export function buildCleanFilenameSlug(raw: string, fallback = 'study-resource', maxLen = 48): string {
  const slug = (raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen)
    .replace(/-+$/g, '');
  return slug || fallback;
}

export function getIsoDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
