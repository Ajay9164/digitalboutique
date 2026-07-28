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
        useUserStore.setState({ hydrated: true });
      },
    },
  ),
);
