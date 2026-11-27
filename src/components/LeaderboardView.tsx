import React, { useState, useEffect, useMemo } from 'react';
import { Profile, LanguageMode, ActiveScreen } from '../types/tracker';
import {
  Trophy,
  Search,
  Users,
  BookOpen,
  Share2,
  Check,
  ArrowRight,
  BarChart3,
  Layers,
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { AutoGrowPromptInput } from './ui/ResponsiveTextControls';
import {
  RealLeaderboardEntry,
  loadOfflineLeaderboardCache,
  saveOfflineLeaderboardCache,
  syncProfileToRealLeaderboard,
} from '../utils/leaderboardSync';

interface LeaderboardViewProps {
  profile: Profile;
  onNavigate?: (screen: ActiveScreen) => void;
  language?: LanguageMode;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  profile,
  onNavigate,
}) => {
  const [users, setUsers] = useState<RealLeaderboardEntry[]>(() => {
    const cached = loadOfflineLeaderboardCache(profile);
    return cached.users;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cached = loadOfflineLeaderboardCache(profile);
    return cached.users.length === 0;
  });
  const [streamLive, setStreamLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    const cached = loadOfflineLeaderboardCache(profile);
    return cached.users.length > 0 ? cached.updatedAt : '';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'overall' | 'subjectAvg'>('overall');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const isGuestPreview = !profile?.id || profile.id === 'guest-preview';

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const offlineSnapshot = loadOfflineLeaderboardCache(profile);
        if (isMounted) {
          setUsers(offlineSnapshot.users);
          setLastUpdated(offlineSnapshot.updatedAt);
          setIsLoading(false);
          setStreamLive(false);
        }
        return;
      }

      try {
        if (!isGuestPreview) {
          const synced = await syncProfileToRealLeaderboard(profile);
          if (isMounted && synced && Array.isArray(synced.users)) {
            setUsers(synced.users);
            setLastUpdated(synced.updatedAt || new Date().toISOString());
            setIsLoading(false);
          }
        }

        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data?.users)) {
            setUsers(data.users);
            setLastUpdated(data.updatedAt || new Date().toISOString());
            saveOfflineLeaderboardCache({ users: data.users, updatedAt: data.updatedAt });
          }
        }
      } catch {
        const offlineSnapshot = loadOfflineLeaderboardCache(profile);
        if (isMounted && offlineSnapshot.users.length > 0) {
          setUsers(offlineSnapshot.users);
          setLastUpdated(offlineSnapshot.updatedAt);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadInitial();

    let eventSource: EventSource | null = null;
    const connectStream = () => {
      if (typeof window === 'undefined' || !('EventSource' in window)) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      eventSource?.close();
      eventSource = new EventSource('/api/leaderboard/stream');
      eventSource.addEventListener('open', () => {
        if (isMounted) setStreamLive(true);
      });
      eventSource.addEventListener('leaderboard', (evt: MessageEvent) => {
        if (!isMounted) return;
        try {
          const parsed = JSON.parse(evt.data);
          if (Array.isArray(parsed?.users)) {
            setUsers(parsed.users);
            setLastUpdated(parsed.updatedAt || new Date().toISOString());
            saveOfflineLeaderboardCache({ users: parsed.users, updatedAt: parsed.updatedAt });
            setIsLoading(false);
            setStreamLive(true);
          }
        } catch {
          // Ignore malformed SSE packet
        }
      });
      eventSource.addEventListener('error', () => {
        if (isMounted) setStreamLive(false);
      });
    };

    connectStream();

    const handleOnline = () => {
      void loadInitial();
      connectStream();
    };
    window.addEventListener('online', handleOnline);

    const fallbackPoll = window.setInterval(async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data?.users)) {
            setUsers(data.users);
            setLastUpdated(data.updatedAt || new Date().toISOString());
            saveOfflineLeaderboardCache({ users: data.users, updatedAt: data.updatedAt });
            setIsLoading(false);
          }
        }
      } catch {
        // Ignore transient network poll error
      }
    }, 20000);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.clearInterval(fallbackPoll);
      eventSource?.close();
    };
  }, [profile?.id, isGuestPreview]);

  const rankedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      if (sortBy === 'subjectAvg') {
        if (b.avgSubjectPercent !== a.avgSubjectPercent) {
          return b.avgSubjectPercent - a.avgSubjectPercent;
        }
        if (b.overallPercentExact !== a.overallPercentExact) {
          return b.overallPercentExact - a.overallPercentExact;
        }
      } else {
        if (b.overallPercentExact !== a.overallPercentExact) {
          return b.overallPercentExact - a.overallPercentExact;
        }
        if (b.avgSubjectPercent !== a.avgSubjectPercent) {
          return b.avgSubjectPercent - a.avgSubjectPercent;
        }
      }
      if (b.completedChapters !== a.completedChapters) {
        return b.completedChapters - a.completedChapters;
      }
      if (b.completedStages !== a.completedStages) {
        return b.completedStages - a.completedStages;
      }
      if (b.streakDays !== a.streakDays) {
        return b.streakDays - a.streakDays;
      }
      return a.name.localeCompare(b.name);
    });

    return sorted.map((user, index) => ({
      ...user,
      displayRank: index + 1,
    }));
  }, [users, sortBy]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rankedUsers;
    return rankedUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.board.toLowerCase().includes(q)
    );
  }, [rankedUsers, searchQuery]);

  const currentUserEntry = useMemo(() => {
    if (isGuestPreview) return null;
    return rankedUsers.find((u) => u.profileId === profile.id) || null;
  }, [rankedUsers, profile.id, isGuestPreview]);

  const handleShareWebsite = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareText = currentUserEntry
      ? `I'm Rank #${currentUserEntry.displayRank} (${currentUserEntry.overallPercentExact}% syllabus done) on the Class 10 Live Syllabus Leaderboard! Track NCERT chapters, PYQs & MCQs free:`
      : 'Check out this free Class 10 CBSE Syllabus Tracker, Notes PDF, PYQs, 10-MCQ Quizzes & Live Syllabus Leaderboard:';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'CBSE Class 10 Syllabus Tracker & Live Leaderboard',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && shareUrl) {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      } catch {}
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 min-w-0 pb-12">
      {/* Header & Controls */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/35">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                  Live Leaderboard of Syllabus
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-emerald-400">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      streamLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>100% Real · Live</span>
                </span>
                <InfoTooltip text="100% real rankings across all registered students on this website based on syllabus completed overall and average across all enrolled subjects." />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                All real website users ranked live by overall syllabus completion % and all-subject average %
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] tabular-nums">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {users.length} {users.length === 1 ? 'Real User' : 'Real Users'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleShareWebsite}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Invite Classmates</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search & Ranking Metric Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-[var(--border-color)]">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5 pointer-events-none" />
            <AutoGrowPromptInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search real student name or education board..."
              maxHeightPx={96}
              ariaLabel="Search real student name or education board"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-emerald-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSortBy('overall')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                sortBy === 'overall'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overall %</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy('subjectAvg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                sortBy === 'subjectAvg'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All-Subject Avg %</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current User Real Standing Banner */}
      {isGuestPreview ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border-2 border-cyan-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
              Create Your Free Profile to Appear on the Live Leaderboard
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Guest preview accounts are never added so rankings stay 100% real. Personalize your name and board in 20 seconds to sync your real rank live.
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Join Live Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : currentUserEntry ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-amber-500/15 border-2 border-emerald-400/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base shrink-0 shadow-md tabular-nums">
              #{currentUserEntry.displayRank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-[var(--text-primary)] break-words">
                  {currentUserEntry.name} (You)
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                  {currentUserEntry.board}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2 flex-wrap tabular-nums">
                <span>
                  {currentUserEntry.completedChapters}/{currentUserEntry.totalChapters} Chapters Done
                </span>
                <span>·</span>
                <span>
                  {currentUserEntry.completedStages}/{currentUserEntry.totalStages} Stages
                </span>
                <span>·</span>
                <span>{currentUserEntry.subjectCount} Subjects</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)] shrink-0">
            <div className="px-3 py-2 rounded-xl bg-[var(--bg-card)]/90 border border-emerald-500/35 text-right">
              <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                Overall Syllabus
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums">
                {currentUserEntry.overallPercentExact}%
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[var(--bg-card)]/90 border border-amber-500/35 text-right">
              <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                All-Subject Avg
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-300 tabular-nums">
                {currentUserEntry.avgSubjectPercent}%
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Real Ranked List */}
      {isLoading ? (
        <div className="py-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)]">
          Connecting to live all-user syllabus leaderboard...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-12 px-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center space-y-2">
          <div className="text-sm font-bold text-[var(--text-primary)]">
            {searchQuery.trim()
              ? `No real users match "${searchQuery}".`
              : 'No real student profiles have synced yet.'}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {searchQuery.trim()
              ? 'Try searching a different name or board.'
              : 'Every student who studies on this website appears here automatically in real time — zero fake accounts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredUsers.map((entry) => {
            const rank = entry.displayRank;
            const isSelf = !isGuestPreview && entry.profileId === profile.id;
            const rankBadgeClass =
              rank === 1
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                : rank === 2
                ? 'bg-slate-300 text-slate-950 border-slate-200'
                : rank === 3
                ? 'bg-orange-400 text-slate-950 border-orange-300'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)]';

            return (
              <div
                key={entry.profileId}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2.5 ${
                  isSelf
                    ? 'bg-emerald-500/10 border-emerald-400/70 ring-1 ring-emerald-400/40 shadow-md'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border font-mono font-black text-xs flex items-center justify-center shrink-0 tabular-nums ${rankBadgeClass}`}
                    >
                      #{rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] break-words">
                          {entry.name}
                        </h3>
                        {isSelf && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                            You
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] shrink-0">
                          {entry.board}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums flex items-center gap-2 flex-wrap">
                        <span>
                          {entry.completedChapters}/{entry.totalChapters} chapters
                        </span>
                        <span>·</span>
                        <span>
                          {entry.completedStages}/{entry.totalStages} stages
                        </span>
                        <span>·</span>
                        <span>{entry.subjectCount} subjects</span>
                        <span>·</span>
                        <span>{entry.streakDays}d streak</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:text-right tabular-nums">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                        Overall Syllabus
                      </div>
                      <div className="text-base sm:text-lg font-black text-emerald-400">
                        {entry.overallPercentExact}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                        All-Subject Avg
                      </div>
                      <div className="text-base sm:text-lg font-black text-amber-300">
                        {entry.avgSubjectPercent}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar + Per-Subject Percentages */}
                <div className="space-y-2">
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, entry.overallPercentExact))}%`,
                      }}
                    />
                  </div>

                  {entry.subjectSummaries && entry.subjectSummaries.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {entry.subjectSummaries.map((sub) => (
                        <span
                          key={sub.subjectId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] tabular-nums"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span className="font-semibold text-[var(--text-primary)]">
                            {sub.subjectName}
                          </span>
                          <span className="text-emerald-400 font-bold">{sub.percentComplete}%</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lastUpdated && (
        <div className="text-[11px] text-center text-[var(--text-muted)] pt-1">
          Live updates synced · Last update {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
