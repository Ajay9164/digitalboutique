"use client";

import { useEffect, useRef } from "react";
import { useUserStore, DAILY_STREAK_BONUS_XP } from "@/stores/user-store";
import { useMasteryStore } from "@/stores/mastery-store";
import { todayKey } from "@/features/learning/data/catalog";

/**
 * Boots the Daily Streak Engine once user persist has rehydrated.
 * Consecutive-day return → +20 XP Daily Consistency Bonus (offline).
 */
export function useDailyStreak() {
  const hydrated = useUserStore((s) => s.hydrated);
  const ranForDayRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    const today = todayKey();
    if (ranForDayRef.current === today) return;
    ranForDayRef.current = today;

    const { awardedBonus, currentStreak } =
      useUserStore.getState().checkDailyStreak();

    if (!awardedBonus) return;

    void useMasteryStore.getState().awardModuleComplete({
      title: "Daily Consistency Bonus",
      detail: `${currentStreak}-day streak — you returned to the atelier.`,
      refId: `daily-streak-${today}`,
      xp: DAILY_STREAK_BONUS_XP,
    });
  }, [hydrated]);
}
