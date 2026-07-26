import { create } from "zustand";
import { db, LEARNING_PROFILE_ID } from "@/lib/db";
import { withDb } from "@/lib/db/safe";
import { recordActivity } from "@/features/learning/lib/ecosystem";
import {
  MASTERY_AWARD_XP,
  resolveMastery,
  type MasteryProgress,
} from "@/features/learning/lib/mastery";

export type MasteryCelebration = {
  id: string;
  title: string;
  detail: string;
  xp: number;
  levelTitle: string;
  level: number;
};

type MasteryState = {
  hydrated: boolean;
  totalXp: number;
  modulesCompleted: number;
  celebration: MasteryCelebration | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  /**
   * Award Tailor Points (+50 default) for completing a tutorial module.
   * Writes XP to IndexedDB via recordActivity — works fully offline.
   */
  awardModuleComplete: (input: {
    title: string;
    detail: string;
    refId?: string;
    xp?: number;
  }) => Promise<void>;
  clearCelebration: () => void;
  progress: () => MasteryProgress;
};

async function readMasterySnapshot(): Promise<{
  totalXp: number;
  modulesCompleted: number;
}> {
  const { data } = await withDb(async () => {
    const [profile, learned, draft] = await Promise.all([
      db.learningProfile.get(LEARNING_PROFILE_ID),
      db.learning.count(),
      db.draftLearning.get("draft-learning"),
    ]);
    return {
      totalXp: profile?.totalXp ?? 0,
      modulesCompleted:
        learned + (draft?.completedSteps?.length ?? 0),
    };
  }, { totalXp: 0, modulesCompleted: 0 });
  return data;
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  hydrated: false,
  totalXp: 0,
  modulesCompleted: 0,
  celebration: null,

  progress: () => {
    const { totalXp, modulesCompleted } = get();
    return resolveMastery(totalXp, modulesCompleted);
  },

  hydrate: async () => {
    if (get().hydrated) return;
    const snap = await readMasterySnapshot();
    set({ ...snap, hydrated: true });
  },

  refresh: async () => {
    const snap = await readMasterySnapshot();
    set({ ...snap, hydrated: true });
  },

  awardModuleComplete: async ({ title, detail, refId, xp = MASTERY_AWARD_XP }) => {
    await recordActivity({
      type: "milestone",
      title,
      detail,
      refId,
      xp,
    });
    const snap = await readMasterySnapshot();
    const mastery = resolveMastery(snap.totalXp, snap.modulesCompleted);
    set({
      ...snap,
      hydrated: true,
      celebration: {
        id: `mastery-${Date.now()}`,
        title,
        detail,
        xp,
        level: mastery.level,
        levelTitle: mastery.title,
      },
    });
  },

  clearCelebration: () => set({ celebration: null }),
}));
