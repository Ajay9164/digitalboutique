import { daysBetween, todayKey } from "@/features/learning/data/catalog";

export const DAILY_STREAK_BONUS_XP = 20;

export type StreakSnapshot = {
  lastLoginDate: string | null;
  currentStreak: number;
  bestStreak: number;
};

export type StreakResolveResult = StreakSnapshot & {
  /** True when the user returned on the exact next calendar day. */
  awardedBonus: boolean;
  /** True when any streak field changed. */
  changed: boolean;
};

/**
 * Pure daily-streak rules (local calendar days):
 * - Same day → no change
 * - Exact next day → increment + mark bonus
 * - Gap ≥ 2 days (~>48h window) → reset, then start fresh at 1
 * - First login → streak 1, no bonus
 */
export function resolveDailyStreak(
  snapshot: StreakSnapshot,
  today: string = todayKey(),
): StreakResolveResult {
  const { lastLoginDate, currentStreak, bestStreak } = snapshot;

  if (lastLoginDate === today) {
    return {
      lastLoginDate,
      currentStreak,
      bestStreak,
      awardedBonus: false,
      changed: false,
    };
  }

  if (!lastLoginDate) {
    return {
      lastLoginDate: today,
      currentStreak: 1,
      bestStreak: Math.max(bestStreak, 1),
      awardedBonus: false,
      changed: true,
    };
  }

  const gap = daysBetween(lastLoginDate, today);

  if (gap === 1) {
    const next = currentStreak + 1;
    return {
      lastLoginDate: today,
      currentStreak: next,
      bestStreak: Math.max(bestStreak, next),
      awardedBonus: true,
      changed: true,
    };
  }

  // Missed more than one calendar day (more than ~48h between day keys).
  return {
    lastLoginDate: today,
    currentStreak: 0,
    bestStreak,
    awardedBonus: false,
    changed: true,
  };
}
