import { Profile } from '../types/tracker';
import { getOverallStats } from './planner';

export interface RealLeaderboardSubjectSummary {
  subjectId: string;
  subjectName: string;
  percentComplete: number;
  completedChapters: number;
  totalChapters: number;
}

export interface RealLeaderboardEntry {
  profileId: string;
  name: string;
  board: string;
  overallPercent: number;
  overallPercentExact: number;
  avgSubjectPercent: number;
  completedChapters: number;
  totalChapters: number;
  completedStages: number;
  totalStages: number;
  subjectCount: number;
  streakDays: number;
  subjectSummaries: RealLeaderboardSubjectSummary[];
  lastSyncedAt: string;
  rank?: number;
}

export interface RealLeaderboardResponse {
  ok?: boolean;
  users: RealLeaderboardEntry[];
  totalUsers: number;
  updatedAt: string;
}

export function computeRealSyllabusMetrics(profile: Profile): RealLeaderboardEntry {
  const stats = getOverallStats(profile);

  const overallPercentExact =
    stats.totalStages > 0
      ? Number(((stats.completedStages / stats.totalStages) * 100).toFixed(1))
      : 0;

  const avgSubjectPercent =
    stats.paces.length > 0
      ? Number(
          (
            stats.paces.reduce((sum, p) => {
              const exactSubPct =
                p.totalStages > 0 ? (p.completedStages / p.totalStages) * 100 : 0;
              return sum + exactSubPct;
            }, 0) / stats.paces.length
          ).toFixed(1)
        )
      : 0;

  const subjectSummaries: RealLeaderboardSubjectSummary[] = stats.paces.map((p) => ({
    subjectId: p.subjectId,
    subjectName: p.subjectName,
    percentComplete: p.percentComplete,
    completedChapters: p.completedChapters,
    totalChapters: p.totalChaptersInSyllabus,
  }));

  return {
    profileId: profile.id,
    name: (profile.name || 'Class 10 Scholar').trim().slice(0, 60) || 'Class 10 Scholar',
    board: (profile.board || 'CBSE').trim().slice(0, 40) || 'CBSE',
    overallPercent: stats.overallPercent,
    overallPercentExact,
    avgSubjectPercent,
    completedChapters: stats.completedChapters,
    totalChapters: stats.totalChapters,
    completedStages: stats.completedStages,
    totalStages: stats.totalStages,
    subjectCount: stats.paces.length,
    streakDays: Math.max(0, Number(profile.streak?.count ?? 0)),
    subjectSummaries,
    lastSyncedAt: new Date().toISOString(),
  };
}

const OFFLINE_LEADERBOARD_CACHE_KEY = 'goalbeam_leaderboard_offline_cache_v1';

export function saveOfflineLeaderboardCache(data: { users: RealLeaderboardEntry[]; updatedAt?: string }): void {
  if (typeof window === 'undefined' || !Array.isArray(data?.users)) return;
  try {
    localStorage.setItem(
      OFFLINE_LEADERBOARD_CACHE_KEY,
      JSON.stringify({
        users: data.users,
        updatedAt: data.updatedAt || new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function loadOfflineLeaderboardCache(
  currentProfile?: Profile | null
): { users: RealLeaderboardEntry[]; updatedAt: string } {
  let cachedUsers: RealLeaderboardEntry[] = [];
  let updatedAt = '';

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(OFFLINE_LEADERBOARD_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.users)) {
          cachedUsers = parsed.users;
          updatedAt = typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '';
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Always merge the student's live local progress when offline so their rank & % stay exact
  if (currentProfile && currentProfile.id && currentProfile.id !== 'guest-preview') {
    const liveSelf = computeRealSyllabusMetrics(currentProfile);
    const idx = cachedUsers.findIndex((u) => u.profileId === currentProfile.id);
    if (idx >= 0) {
      cachedUsers = cachedUsers.map((u, i) => (i === idx ? liveSelf : u));
    } else {
      cachedUsers = [liveSelf, ...cachedUsers];
    }
  }

  return {
    users: cachedUsers,
    updatedAt: updatedAt || new Date().toISOString(),
  };
}

export async function syncProfileToRealLeaderboard(
  profile: Profile | null | undefined
): Promise<RealLeaderboardResponse | null> {
  if (!profile || !profile.id || profile.id === 'guest-preview') {
    return null;
  }

  try {
    const payload = computeRealSyllabusMetrics(profile);
    const res = await fetch('/api/leaderboard/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RealLeaderboardResponse;
    if (Array.isArray(data?.users)) {
      saveOfflineLeaderboardCache({ users: data.users, updatedAt: data.updatedAt });
    }
    return data;
  } catch {
    return null;
  }
}
