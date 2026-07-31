import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DAILY_STREAK_BONUS_XP,
  resolveDailyStreak,
} from "@/lib/streak/daily-streak";

type UserState = {
  /** False until persist rehydrates from localStorage (avoids onboarding flash). */
  hydrated: boolean;
  userName: string | null;
  hasCompletedOnboarding: boolean;
  /** Local calendar day `YYYY-MM-DD` of last recorded atelier open. */
  lastLoginDate: string | null;
  currentStreak: number;
  bestStreak: number;
  completeOnboarding: (name: string) => void;
  resetOnboarding: () => void;
  /**
   * Boot-time streak check. Returns whether a +20 Daily Consistency Bonus
   * should be awarded (caller writes XP via mastery / IndexedDB).
   */
  checkDailyStreak: () => { awardedBonus: boolean; currentStreak: number };
};

/**
 * Personalized atelier profile — name + onboarding + daily streak persist
 * to localStorage. Fully offline: no network dependency.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      userName: null,
      hasCompletedOnboarding: false,
      lastLoginDate: null,
      currentStreak: 0,
      bestStreak: 0,
      completeOnboarding: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set({
          userName: trimmed,
          hasCompletedOnboarding: true,
        });
      },
      resetOnboarding: () =>
        set({
          userName: null,
          hasCompletedOnboarding: false,
        }),
      checkDailyStreak: () => {
        const state = get();
        const result = resolveDailyStreak({
          lastLoginDate: state.lastLoginDate,
          currentStreak: state.currentStreak,
          bestStreak: state.bestStreak,
        });
        if (result.changed) {
          set({
            lastLoginDate: result.lastLoginDate,
            currentStreak: result.currentStreak,
            bestStreak: result.bestStreak,
          });
        }
        return {
          awardedBonus: result.awardedBonus,
          currentStreak: result.currentStreak,
        };
      },
    }),
    {
      name: "tailor-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userName: state.userName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        lastLoginDate: state.lastLoginDate,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
      }),
      onRehydrateStorage: () => () => {
        // Always mark hydrated — even if storage is blocked (private mode).
        useUserStore.setState({ hydrated: true });
      },
    },
  ),
);

export { DAILY_STREAK_BONUS_XP };

/** Safety net if persist rehydrate never fires (rare storage edge cases). */
if (typeof window !== "undefined") {
  window.setTimeout(() => {
    if (!useUserStore.getState().hydrated) {
      useUserStore.setState({ hydrated: true });
    }
  }, 250);
}
