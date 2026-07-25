import { create } from "zustand";
import type { LearningSnapshot } from "@/features/learning/lib/ecosystem";
import {
  completeOnboarding,
  dismissCelebration,
  loadLearningSnapshot,
  setOnboardingStep,
} from "@/features/learning/lib/ecosystem";

type LearningHubState = {
  hydrated: boolean;
  snapshot: LearningSnapshot | null;
  showOnboarding: boolean;
  celebration: LearningSnapshot["pendingCelebration"];
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  advanceOnboarding: (step: number) => Promise<void>;
  finishOnboarding: (name: string) => Promise<void>;
  clearCelebration: () => Promise<void>;
};

export const useLearningHubStore = create<LearningHubState>((set, get) => ({
  hydrated: false,
  snapshot: null,
  showOnboarding: false,
  celebration: null,

  hydrate: async () => {
    if (get().hydrated) return;
    const snapshot = await loadLearningSnapshot();
    set({
      hydrated: true,
      snapshot,
      showOnboarding: !snapshot.profile.onboardingComplete,
      celebration: snapshot.pendingCelebration,
    });
  },

  refresh: async () => {
    const snapshot = await loadLearningSnapshot({ evaluateSideEffects: false });
    set({
      snapshot,
      showOnboarding: !snapshot.profile.onboardingComplete,
    });
  },

  advanceOnboarding: async (step) => {
    await setOnboardingStep(step);
    set((state) =>
      state.snapshot
        ? {
            snapshot: {
              ...state.snapshot,
              profile: { ...state.snapshot.profile, onboardingStep: step },
            },
          }
        : {},
    );
  },

  finishOnboarding: async (name) => {
    await completeOnboarding(name);
    await get().refresh();
    set({ showOnboarding: false });
  },

  clearCelebration: async () => {
    const current = get().celebration;
    await dismissCelebration(
      current?.kind === "milestone" ? current.id : undefined,
    );
    set({ celebration: null });
  },
}));
