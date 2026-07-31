"use client";

import { useDailyStreak } from "@/hooks/use-daily-streak";

/** Mounts the Daily Streak Engine once under AppProviders. */
export function DailyStreakListener() {
  useDailyStreak();
  return null;
}
