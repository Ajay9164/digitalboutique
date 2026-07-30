import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserState = {
  /** False until persist rehydrates from localStorage (avoids onboarding flash). */
  hydrated: boolean;
  userName: string | null;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (name: string) => void;
  resetOnboarding: () => void;
};

/**
 * Personalized atelier profile — name + onboarding flag persist to localStorage
 * so first-time visitors on a new device see the gateway, then return greeted.
 * Fully offline: no network dependency.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hydrated: false,
      userName: null,
      hasCompletedOnboarding: false,
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
    }),
    {
      name: "tailor-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userName: state.userName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => () => {
        // Always mark hydrated — even if storage is blocked (private mode).
        useUserStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Safety net if persist rehydrate never fires (rare storage edge cases). */
if (typeof window !== "undefined") {
  window.setTimeout(() => {
    if (!useUserStore.getState().hydrated) {
      useUserStore.setState({ hydrated: true });
    }
  }, 250);
}
