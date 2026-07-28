import { create } from "zustand";

export type CurtainOrigin = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type CurtainPhase = "idle" | "dropping" | "holding" | "lifting";

type CurtainTransitionState = {
  phase: CurtainPhase;
  href: string | null;
  origin: CurtainOrigin | null;
  /**
   * When true, Measurements must fade/unmount WebGL + scroll cinema
   * before the route swap (prevents GPU/memory spikes).
   */
  dismantleScene: boolean;
  begin: (args: { href: string; origin: CurtainOrigin }) => void;
  markCovered: () => void;
  beginLift: () => void;
  reset: () => void;
};

export const useCurtainTransitionStore = create<CurtainTransitionState>(
  (set, get) => ({
    phase: "idle",
    href: null,
    origin: null,
    dismantleScene: false,
    begin: ({ href, origin }) => {
      if (get().phase !== "idle") return;
      set({
        phase: "dropping",
        href,
        origin,
        dismantleScene: true,
      });
    },
    markCovered: () => {
      if (get().phase !== "dropping") return;
      set({ phase: "holding" });
    },
    beginLift: () => {
      if (get().phase !== "holding") return;
      set({ phase: "lifting" });
    },
    reset: () =>
      set({
        phase: "idle",
        href: null,
        origin: null,
        dismantleScene: false,
      }),
  }),
);
