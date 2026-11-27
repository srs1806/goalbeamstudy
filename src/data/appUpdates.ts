import type { ActiveScreen } from '../types/tracker';

/**
 * Classification of website updates:
 * - 'form-change': Updates inside setup/onboarding/profile forms -> ALWAYS triggers update screen & live notification.
 * - 'new-feature': Brand-new features added to the platform -> ALWAYS triggers update screen & live notification.
 * - 'main-screen-only': Layout/text/visual adjustments on the main home screen only -> EXCLUDED from update screen/banner & notification.
 * - 'accessible-without-reset': Edits inside existing sections the user can already visit without resetting -> EXCLUDED from update screen/banner & notification.
 */
export type UpdateChangeScope =
  | 'form-change'
  | 'new-feature'
  | 'main-screen-only'
  | 'accessible-without-reset';

export interface AppUpdateChangeItem {
  id: string;
  scope: UpdateChangeScope;
  title: string;
  description: string;
  actionScreen?: ActiveScreen;
  actionLabel?: string;
}

export interface AppReleaseEntry {
  version: string;
  releasedAt: string;
  headline: string;
  summary: string;
  changes: AppUpdateChangeItem[];
}

export interface PendingAppUpdateSummary {
  latestVersion: string;
  headline: string;
  releasedAt: string;
  changes: AppUpdateChangeItem[];
  isLiveServerUpdate?: boolean;
}

export const SEEN_APP_VERSION_KEY = 'zenith_seen_app_version';
export const NOTIFIED_APP_VERSION_KEY = 'zenith_notified_app_version';

/**
 * Current baseline release version.
 * Whenever you deploy a future update:
 * 1. Bump CURRENT_APP_VERSION (e.g. '2026.11.25.1')
 * 2. Append a matching AppReleaseEntry to APP_RELEASES below.
 *    - Mark form changes as scope: 'form-change'
 *    - Mark new features as scope: 'new-feature'
 *    - Mark home/main-screen tweaks as scope: 'main-screen-only' (automatically excluded from banner/notification)
 *    - Mark existing-section tweaks as scope: 'accessible-without-reset' (automatically excluded from banner/notification)
 */
export const CURRENT_APP_VERSION = '2026.11.22.1';

export const APP_RELEASES: AppReleaseEntry[] = [
  {
    version: '2026.11.22.1',
    releasedAt: '2026-11-22T02:15:00.000Z',
    headline: 'Baseline Release',
    summary: 'Core CBSE Class 10 study workspace with smart update notifications.',
    changes: [],
  },
];

/**
 * Strictly permits ONLY form changes and brand-new features in the update screen/notification.
 * Main-screen-only edits and edits in sections accessible without resetting are filtered out.
 */
export function isBannerEligibleChange(change: AppUpdateChangeItem): boolean {
  return change.scope === 'form-change' || change.scope === 'new-feature';
}

export function filterBannerEligibleChanges(
  changes: AppUpdateChangeItem[] | undefined | null
): AppUpdateChangeItem[] {
  if (!Array.isArray(changes)) return [];
  return changes.filter(isBannerEligibleChange);
}

/**
 * Collects all unseen releases newer than `seenVersion` and filters their items
 * to strictly eligible updates ('form-change' | 'new-feature').
 *
 * Returns:
 * - `pending`: Non-null only when at least one unseen 'form-change' or 'new-feature' exists.
 * - `shouldAdvanceSeenTo`: Non-null when newer releases exist but contain ZERO eligible items
 *   (e.g. main-screen-only or accessible-without-reset tweaks), so seenVersion advances silently.
 */
export function collectPendingQualifyingUpdate(
  seenVersion: string | null,
  releases: AppReleaseEntry[] = APP_RELEASES
): {
  pending: PendingAppUpdateSummary | null;
  shouldAdvanceSeenTo: string | null;
} {
  if (!Array.isArray(releases) || releases.length === 0) {
    return { pending: null, shouldAdvanceSeenTo: null };
  }

  const latest = releases[releases.length - 1];
  if (!latest || !latest.version) {
    return { pending: null, shouldAdvanceSeenTo: null };
  }

  if (seenVersion === latest.version) {
    return { pending: null, shouldAdvanceSeenTo: null };
  }

  let unseenReleases: AppReleaseEntry[] = [];
  if (!seenVersion) {
    unseenReleases = [latest];
  } else {
    const seenIdx = releases.findIndex((r) => r.version === seenVersion);
    unseenReleases = seenIdx >= 0 ? releases.slice(seenIdx + 1) : [latest];
  }

  const eligibleChanges = unseenReleases.flatMap((rel) =>
    filterBannerEligibleChanges(rel.changes)
  );

  if (eligibleChanges.length === 0) {
    return {
      pending: null,
      shouldAdvanceSeenTo: latest.version,
    };
  }

  return {
    pending: {
      latestVersion: latest.version,
      headline: latest.headline || 'New Website Update',
      releasedAt: latest.releasedAt,
      changes: eligibleChanges,
    },
    shouldAdvanceSeenTo: null,
  };
}
