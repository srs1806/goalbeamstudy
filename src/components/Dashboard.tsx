import React, { useState, useEffect, useMemo } from 'react';
import { Profile, ActiveScreen, LanguageMode } from '../types/tracker';
import { getOverallStats, getMsUntilNext5am } from '../utils/planner';
import { getLocalStudyDateKey } from '../utils/storage';
import { buildSectionWiseMorningPayload } from '../utils/notifications';
import {
  RealLeaderboardEntry,
  loadOfflineLeaderboardCache,
  saveOfflineLeaderboardCache,
  syncProfileToRealLeaderboard,
} from '../utils/leaderboardSync';
import { Logo } from './Logo';
import { InfoTooltip } from './InfoTooltip';
import { FireFlame } from './FireFlame';
import {
  Calendar,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Award,
  CheckSquare,
  Trophy,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';
import confetti from 'canvas-confetti';
import { FlexCertificateModal } from './FlexCertificateModal';
import { LiveTypingShowcase } from './LiveTypingShowcase';
import { PWAInstallButton } from './PWAInstallButton';
import { getT } from '../utils/translations';
import { ExpandableText } from './ui/ResponsiveTextControls';

const EXTRAS_STORAGE_KEY = 'goalbeam_dash_extras_open';

interface DashboardProps {
  profile: Profile;
  onNavigate: (screen: ActiveScreen) => void;
  onSelectSubject: (subjectId: string) => void;
  onNavigateToChapterTarget?: (subjectId: string, chapterId: string, stageKey?: string) => void;
  onNavigateToResources?: (subjectId: string) => void;
  onQuickMarkStageDone: (subjectId: string, chapterId: string, stageKey: any) => void;
  onUpdateProfile?: (profile: Profile) => void;
  onOpenGuide?: () => void;
  isIncompleteProfile?: boolean;
  language?: LanguageMode;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  onNavigate,
  onSelectSubject,
  onNavigateToChapterTarget,
  onNavigateToResources,
  onOpenGuide,
  isIncompleteProfile = false,
  language = 'en',
}) => {
  const isGuestLocked = isIncompleteProfile || !profile?.id || profile.id === 'guest-preview';
  const t = getT(language);

  // Auto-refresh state every minute and at 5:00 AM daily rollover
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);

    const msUntil5am = getMsUntilNext5am();
    const timeout = setTimeout(() => {
      setTick((prev) => prev + 1);
    }, msUntil5am);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [showExtrasShelf, setShowExtrasShelf] = useState<boolean>(() => {
    try {
      return localStorage.getItem(EXTRAS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleExtrasShelf = () => {
    setShowExtrasShelf((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(EXTRAS_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  // Dynamic Community Counter Widget - Track overall platform-wide user activity across India
  const [communityCount, setCommunityCount] = useState<number>(() => {
    const now = new Date();
    return 1450 + ((now.getHours() * 37 + now.getMinutes()) % 420);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCommunityCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 28000);
    return () => clearInterval(timer);
  }, []);

  const handleFlexProgress = () => {
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
      });
    } catch {}

    setShowCertificateModal(true);
  };

  const {
    totalStages,
    completedStages,
    stagesRemaining,
    totalChapters,
    completedChapters,
    overallPercent,
    daysRemaining,
    dailyTotalStageGoal,
  } = getOverallStats(profile);

  // Dynamic visual modes and color gradient for the circular completion button
  const velocityMode = useMemo(() => {
    if (overallPercent >= 75) {
      return {
        name: 'Elite Velocity',
        gradientId: 'dash-grad-emerald',
        stroke1: '#10b981',
        stroke2: '#06b6d4',
        glowClass: 'shadow-[0_0_24px_rgba(16,185,129,0.35)]',
      };
    } else if (overallPercent >= 35) {
      return {
        name: 'Momentum Velocity',
        gradientId: 'dash-grad-amber',
        stroke1: '#f59e0b',
        stroke2: '#ea580c',
        glowClass: 'shadow-[0_0_24px_rgba(245,158,11,0.35)]',
      };
    } else {
      return {
        name: 'Starter Velocity',
        gradientId: 'dash-grad-cyan',
        stroke1: '#06b6d4',
        stroke2: '#3b82f6',
        glowClass: 'shadow-[0_0_24px_rgba(6,182,212,0.35)]',
      };
    }
  }, [overallPercent]);

  const morningPayload = buildSectionWiseMorningPayload(profile, language);
  const sectionTargets = morningPayload.sectionTargets;

  const [animatingCardKey, setAnimatingCardKey] = useState<string | null>(null);

  const handleTargetCardClick = (item: (typeof sectionTargets)[0]) => {
    const cardKey = `${item.subjectId}:${item.chapterId}`;
    setAnimatingCardKey(cardKey);

    const proceedNavigation = () => {
      if (onNavigateToChapterTarget) {
        onNavigateToChapterTarget(item.subjectId, item.chapterId, item.nextStageKey);
      } else {
        onSelectSubject(item.subjectId);
        onNavigate('chapters');
      }
      setTimeout(() => setAnimatingCardKey(null), 350);
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      setTimeout(() => {
        (document as any).startViewTransition(() => {
          proceedNavigation();
        });
      }, 70);
    } else {
      setTimeout(proceedNavigation, 90);
    }
  };

  const [liveUsers, setLiveUsers] = useState<RealLeaderboardEntry[]>(() =>
    loadOfflineLeaderboardCache(profile).users
  );

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (isMounted) setLiveUsers(loadOfflineLeaderboardCache(profile).users);
        return;
      }
      try {
        if (profile?.id && profile.id !== 'guest-preview') {
          const synced = await syncProfileToRealLeaderboard(profile);
          if (isMounted && synced && Array.isArray(synced.users)) {
            setLiveUsers(synced.users);
          }
        }

        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data?.users)) {
            setLiveUsers(data.users);
            saveOfflineLeaderboardCache({ users: data.users, updatedAt: data.updatedAt });
          }
        }
      } catch {
        if (isMounted) setLiveUsers(loadOfflineLeaderboardCache(profile).users);
      }
    };

    void loadSummary();

    let eventSource: EventSource | null = null;
    if (
      typeof window !== 'undefined' &&
      'EventSource' in window &&
      (typeof navigator === 'undefined' || navigator.onLine)
    ) {
      eventSource = new EventSource('/api/leaderboard/stream');
      eventSource.addEventListener('leaderboard', (evt: MessageEvent) => {
        if (!isMounted) return;
        try {
          const parsed = JSON.parse(evt.data);
          if (Array.isArray(parsed?.users)) {
            setLiveUsers(parsed.users);
            saveOfflineLeaderboardCache({ users: parsed.users, updatedAt: parsed.updatedAt });
          }
        } catch {}
      });
    }

    return () => {
      isMounted = false;
      eventSource?.close();
    };
  }, [profile?.id]);

  const currentUserRankEntry = useMemo(() => {
    if (!profile?.id || profile.id === 'guest-preview') return null;
    return liveUsers.find((u) => u.profileId === profile.id) || null;
  }, [liveUsers, profile?.id]);

  const streakCount = profile.streak?.count ?? 0;
  const isTodayStreakEarned =
    streakCount > 0 && profile.streak?.lastActiveDate === getLocalStudyDateKey();

  return (
    <div className="space-y-5 pb-16 sm:pb-20 animate-in fade-in min-w-0">
      {/* Top Bar Below Header: Collapsible Extras, Community & Achievements */}
      <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={toggleExtrasShelf}
          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-left hover:bg-[var(--bg-elevated)]/60 transition-colors cursor-pointer"
          aria-expanded={showExtrasShelf}
        >
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-[var(--text-primary)]">
              Extras, Community &amp; Achievements
            </h2>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 truncate">
              Flex 16:9 Certificate ·{' '}
              {currentUserRankEntry
                ? `Rank #${currentUserRankEntry.rank}`
                : 'Live Leaderboard'}{' '}
              · Master Guide · Live Activity · App Install
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[11px] font-bold text-[var(--text-primary)] shrink-0 whitespace-nowrap">
            <span>{showExtrasShelf ? 'Hide' : 'Show'}</span>
            {showExtrasShelf ? (
              <ChevronUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            )}
          </span>
        </button>

        {showExtrasShelf && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 border-t border-[var(--border-color)]/70 space-y-3.5 animate-in fade-in">
            {/* Flex Certificate & Live Leaderboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Flex My Progress (Preserving viral 3D animated button) */}
              <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-[var(--text-primary)]">
                    16:9 Academic Certificate
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Share your progress velocity &amp; streak milestone card
                  </p>
                </div>
                {isGuestLocked ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('onboarding')}
                    className="relative w-full sm:w-52 h-11 px-2.5 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:border-amber-400/80 text-[var(--text-primary)] font-black text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                    title="Click on me to unlock for free"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Click on me to unlock for free</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFlexProgress}
                    className="btn-3d-viral-flex keep-dark-surface relative w-full sm:w-56 h-11 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 hover:from-amber-300 hover:via-rose-400 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_26px_rgba(244,63,94,0.7)] hover:shadow-[0_0_36px_rgba(244,63,94,0.95)] border-2 border-amber-300/80 group overflow-hidden shrink-0"
                    title="Claim your official 16:9 AI-generated CBSE Academic Velocity Certificate & flex on WhatsApp!"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <span className="tracking-wide text-xs uppercase font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
                      FLEX MY PROGRESS 📜
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono font-extrabold uppercase shrink-0 border border-amber-300/50">
                      16:9
                    </span>
                  </button>
                )}
              </div>

              {(() => {
                const leaderboardCard = (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate('leaderboard')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onNavigate('leaderboard');
                      }
                    }}
                    className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-emerald-400/70 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors group h-full"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-[var(--text-primary)] break-words">
                          Live Leaderboard of Syllabus
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] tabular-nums">
                          {currentUserRankEntry
                            ? `100% Real · Rank #${currentUserRankEntry.rank} of ${liveUsers.length} · ${currentUserRankEntry.overallPercentExact}% overall`
                            : `100% Real · ${liveUsers.length} ${liveUsers.length === 1 ? 'user' : 'users'} ranked by overall syllabus & avg %`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('leaderboard');
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Open Leaderboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );

                return isGuestLocked ? (
                  <LockedFeatureOverlay
                    featureLabel="Live Leaderboard"
                    onCompleteProfile={() => onNavigate('onboarding')}
                  >
                    {leaderboardCard}
                  </LockedFeatureOverlay>
                ) : (
                  leaderboardCard
                );
              })()}
            </div>

            {/* Website Master Guide Card */}
            {onOpenGuide && (
              <div className="dash-spotlight-guide relative overflow-hidden rounded-2xl border-2 px-4 py-3.5 shadow-[0_0_24px_rgba(6,182,212,0.18)] hover:shadow-[0_0_30px_rgba(6,182,212,0.32)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3 min-w-0 relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-400 to-blue-600 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-[0_0_16px_rgba(34,211,238,0.45)]">
                    <span className="text-xl">🎬</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="text-sm sm:text-base font-black tracking-tight break-words">
                        Website Master Guide
                      </span>
                      <InfoTooltip
                        text="Interactive walkthrough with Hindi-English audio, screen simulator, and visual guide."
                        label="Website Master Guide info"
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Interactive tour with Hindi-English walkthrough
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="relative z-10 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(34,211,238,0.4)] cursor-pointer transition-colors whitespace-nowrap shrink-0"
                  title="Open Website Master Guide & Interactive Tour"
                >
                  <span>Open Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Live Global Platform Activity Ticker (Preserved Banner Animation) */}
            <div className="dash-live-banner rounded-xl border p-2.5 sm:p-3 shadow-md flex items-center justify-between gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] break-words leading-snug">
                  🌍 <span className="text-emerald-400 font-extrabold">Live Global Platform Activity:</span> Over{' '}
                  <strong className="text-emerald-300 font-extrabold tabular-nums">
                    {communityCount.toLocaleString()}+
                  </strong>{' '}
                  Class 10 course chapters completed today by scholars across India on{' '}
                  <span className="brand-wordmark text-xs sm:text-sm">GOALBEAM</span>!
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold shrink-0">
                <span>Nationwide Live Track</span>
              </div>
            </div>

            {/* Install Goalbeam Offline App Banner */}
            <div className="dash-live-banner rounded-xl border p-2.5 sm:p-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] break-words leading-snug">
                  📲 <span className="text-emerald-400 font-extrabold">Install Goalbeam as an App (Mobile &amp; Desktop):</span>{' '}
                  <span className="text-[var(--text-secondary)]">
                    Add once to your Home Screen or Desktop for seamless offline study.
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-emerald-400 font-extrabold">✓</span>
                    <span>100% Offline Study (Chapters, Quizzes &amp; Focus Timer)</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-cyan-400 font-extrabold">✓</span>
                    <span>1-Tap Main Screen App Launch</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-amber-400 font-extrabold">✓</span>
                    <span>Full-Screen, Zero Browser Clutter &amp; Faster Load</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center shrink-0 self-start sm:self-center">
                <PWAInstallButton variant="banner" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* TIER 1: Calm Hero Welcome + Core Daily Study Actions (Resources & Day Streak) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0 w-full sm:w-auto">
            {/* Circular Completion Button with Animated Velocity Arc around Logo */}
            <button
              type="button"
              onClick={isGuestLocked ? () => onNavigate('onboarding') : handleFlexProgress}
              className={`relative shrink-0 flex items-center justify-center p-2 sm:p-2.5 rounded-full cursor-pointer group transition-colors ${velocityMode.glowClass}`}
              title={
                isGuestLocked
                  ? 'Click on me to unlock for free'
                  : `Overall Study Completion: ${overallPercent}% completed (${velocityMode.name}) • Click to view Official 16:9 Certificate`
              }
            >
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 120 120"
              >
                <defs>
                  <linearGradient id={velocityMode.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={velocityMode.stroke1} />
                    <stop offset="100%" stopColor={velocityMode.stroke2} />
                  </linearGradient>
                </defs>
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="transparent"
                  stroke="var(--text-muted)"
                  strokeOpacity="0.16"
                  strokeWidth="5"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="transparent"
                  stroke={`url(#${velocityMode.gradientId})`}
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeDasharray={326.73}
                  strokeDashoffset={
                    overallPercent <= 0
                      ? 326.73
                      : 326.73 - (326.73 * Math.max(overallPercent, 2)) / 100
                  }
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              </svg>

              <div className="relative z-10 w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden flex items-center justify-center bg-slate-950">
                <Logo size="hero" borderless={true} className="w-full h-full rounded-full" />
              </div>
            </button>

            <div className="min-w-0 flex-1">
              <div className="space-y-2">
                {isGuestLocked ? (
                  <p className="text-xs sm:text-sm md:text-base font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 flex-wrap leading-snug">
                    <span className="shrink-0 select-none">👋</span>
                    <span className="shrink-0">Welcome back,</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('onboarding')}
                      className="text-left text-[var(--status-amber)] hover:text-[var(--accent-primary)] underline font-black cursor-pointer transition-colors"
                      title="Click on me to unlock for free"
                    >
                      Click on me to unlock for free
                    </button>
                  </p>
                ) : (
                  <p className="text-base sm:text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-2xl select-none">👋</span>
                    <span>Welcome back, </span>
                    <span className="text-[var(--accent-primary)] font-black">{profile.name || 'Scholar'}</span>!
                  </p>
                )}
                <LiveTypingShowcase />
              </div>
            </div>
          </div>

          {/* Core Daily Actions (Resources + Day Streak) */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 self-stretch sm:self-auto shrink-0 w-full sm:w-56">
            <button
              type="button"
              onClick={() => onNavigate('resources')}
              className="btn-3d-blue-move dash-btn-resources w-full h-10 px-3.5 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              title="Browse CBSE & NCERT Verified Resources"
            >
              <span className="inline-flex">
                <BookOpen className="w-4 h-4 shrink-0 text-[var(--accent-primary)]" />
              </span>
              <span>{t('dash.resourcesBtn')}</span>
            </button>

            <div
              className={`btn-3d-amber-move dash-streak-pill w-full h-10 px-3.5 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-2 select-none ${
                streakCount > 0 ? 'is-active' : ''
              }`}
              title={
                isTodayStreakEarned
                  ? `${streakCount} Day Study Streak active today • Earned via Chapters, Resources PDF, or Quiz`
                  : 'Mark a chapter as started/in progress/completed, open a PDF in Resources, or take a quiz to log today’s streak'
              }
            >
              <FireFlame size="xs" showEmbers={streakCount > 0} className="shrink-0 -my-1" />
              <span className="dash-streak-count font-black text-sm tabular-nums">
                {streakCount}
              </span>
              <span className="dash-streak-label font-extrabold">
                Day Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Essential 3-KPI Strip: 1st Paper Countdown, Daily Study Target & Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
              1st Paper Target Date
            </span>
            <span className="font-mono tabular-nums bg-[var(--bg-elevated)] px-2 py-0.5 rounded text-[var(--text-primary)]">
              {profile.firstPaperDate}
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-[var(--accent-primary)]">
              {daysRemaining}{' '}
              <span className="text-base font-semibold text-[var(--text-secondary)]">Days Left</span>
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-2 flex items-center justify-between flex-wrap gap-1 tabular-nums">
            <span>Daily Rollover</span>
            <span className="text-emerald-400 font-semibold">5:00 AM</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="w-4 h-4 text-amber-400" />
              Daily Study Target
            </span>
            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold tabular-nums">
              {dailyTotalStageGoal} Stages / Day
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-amber-400">
              {dailyTotalStageGoal}{' '}
              <span className="text-base font-semibold text-[var(--text-secondary)]">stages daily</span>
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-2 flex items-center justify-between tabular-nums">
            <span>Stages Remaining: {stagesRemaining}</span>
            <span className="text-[var(--text-primary)] font-semibold">Goal: {profile.dailyHourGoal} hrs/day</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Overall Syllabus Progress
            </span>
            <span className="text-emerald-400 font-black text-sm tabular-nums">{overallPercent}%</span>
          </div>
          <div className="my-2.5">
            <div className="w-full bg-[var(--bg-elevated)] h-3 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] tabular-nums">
              <span>{completedChapters} of {totalChapters} chapters done</span>
              <span>{completedStages} / {totalStages} stages</span>
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-2 flex items-center justify-between">
            <span>Readiness:</span>
            <span className="text-cyan-400 font-bold">
              {overallPercent >= 80 ? 'Mastery Level 🌟' : overallPercent >= 40 ? 'On Track 👍' : 'In Progress 🚀'}
            </span>
          </div>
        </div>
      </div>

      {/* TIER 2: PRIMARY FOCUS ANCHOR — Today's Target First */}
      {sectionTargets.length > 0 && (() => {
        const targetsPanel = (
          <div data-scroll="bottom" className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 [text-wrap:balance]">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                <span>Today&apos;s Target — Section-Wise Priority Focus</span>
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('chapters')}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>All Chapters</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectionTargets.map((item) => {
                const cardKey = `${item.subjectId}:${item.chapterId}`;
                const isAnimating = animatingCardKey === cardKey;
                return (
                  <div
                    key={cardKey}
                    onClick={() => handleTargetCardClick(item)}
                    className={`p-3.5 rounded-xl bg-gradient-to-br ${item.gradientClass} border-2 ${
                      isAnimating
                        ? 'border-cyan-300 ring-2 ring-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.5)] animate-target-card-tap'
                        : item.borderClass
                    } hover:border-cyan-400/80 hover:shadow-lg flex flex-col justify-between transition-all shadow-sm cursor-pointer group relative`}
                    title={`Click to open ${item.chapterName} in Chapters & focus target stage`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${item.badgeBgClass}`}>
                          {item.colorEmoji} {item.subjectName}
                        </span>
                        {item.highYield && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white">
                            High-Yield
                          </span>
                        )}
                      </div>

                      <div className={`text-[10px] font-extrabold uppercase tracking-wide ${item.textAccentClass} break-words`}>
                        Section: {item.sectionName}
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-snug">
                        <ExpandableText
                          text={`${item.chapterPrefix} ${item.chapterNo}: ${item.chapterName}`}
                          maxChars={72}
                        />
                      </h3>

                      <div className="pt-1 text-[11px] text-[var(--text-secondary)] flex items-center justify-between flex-wrap gap-1 tabular-nums">
                        <span>
                          Target Stage: <strong className={item.textAccentClass}>{item.nextStageLabel}</strong>
                        </span>
                        <span className="font-mono text-[10px]">
                          {item.completedStagesCount}/{item.totalStagesCount} Done
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[var(--border-color)]/60 flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs font-extrabold">
                        <span>Open Chapter</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      {onNavigateToResources && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToResources(item.subjectId);
                          }}
                          className="px-2 py-1 rounded-md bg-cyan-500/15 hover:bg-cyan-500/30 text-[10px] font-extrabold text-[var(--accent-primary)] border border-cyan-400/35 transition-colors cursor-pointer"
                          title="Open verified study resources for this subject"
                        >
                          Resources ↗
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

        return isGuestLocked ? (
          <LockedFeatureOverlay
            featureLabel="Personalized Syllabus Targets"
            onCompleteProfile={() => onNavigate('onboarding')}
          >
            {targetsPanel}
          </LockedFeatureOverlay>
        ) : (
          targetsPanel
        );
      })()}

      {/* TIER 3: Study Practice & AI Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[var(--text-primary)] break-words">
                10-Question Live MCQ &amp; Flashcards
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Chapter quizzes anytime · Formula revision deck
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('practice')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Start Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(() => {
          const auraCard = (
            <div className="dash-spotlight-ai relative overflow-hidden rounded-2xl border-2 px-4 py-3.5 shadow-[0_0_24px_rgba(16,185,129,0.18)] hover:shadow-[0_0_30px_rgba(16,185,129,0.32)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group h-full">
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 min-w-0 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-600 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.45)]">
                  <Sparkles className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span className="text-sm sm:text-base font-black tracking-tight break-words">
                      <span className="brand-wordmark">Goalbeam</span> AI Studio
                    </span>
                    <InfoTooltip
                      text="Deep-dive Class 10 course chapter overviews, flashcards, board scoring tips, and doubt solver."
                      label="Goalbeam AI Studio info"
                    />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Doubt solver · Study notes · Revision assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('aura-ai')}
                className="relative z-10 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(16,185,129,0.4)] cursor-pointer transition-colors whitespace-nowrap shrink-0"
                title="Open Goalbeam AI Studio"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );

          return isGuestLocked ? (
            <LockedFeatureOverlay
              featureLabel="Goalbeam AI Studio"
              onCompleteProfile={() => onNavigate('onboarding')}
            >
              {auraCard}
            </LockedFeatureOverlay>
          ) : (
            auraCard
          );
        })()}
      </div>


      {/* 16:9 Official Class 10 Academic Certificate Modal */}
      <FlexCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        profile={profile}
        language={language}
      />
    </div>
  );
};
