import { create } from "zustand";
import { db, LEARNING_PROFILE_ID } from "@/lib/db";
import { withDb } from "@/lib/db/safe";
import { recordActivity } from "@/features/learning/lib/ecosystem";
import {
  didCrossRankBoundary,
  MASTERY_AWARD_XP,
  resolveMastery,
  type MasteryLevel,
  type MasteryProgress,
} from "@/features/learning/lib/mastery";
import { NotificationManager } from "@/lib/notifications/notification-manager";
import { useUserStore } from "@/stores/user-store";

export type MasteryCelebration = {
  id: string;
  title: string;
  detail: string;
  xp: number;
  levelTitle: string;
  level: number;
};

export type RankUpCelebration = {
  id: string;
  rank: MasteryLevel;
  previousLevel: number;
  totalXp: number;
};

type MasteryState = {
  hydrated: boolean;
  totalXp: number;
  modulesCompleted: number;
  celebration: MasteryCelebration | null;
  rankUp: RankUpCelebration | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  /**
   * Award Tailor Points (+50 default) for completing a tutorial module.
   * Writes XP to IndexedDB via recordActivity — works fully offline.
   * Crossing a rank boundary triggers the full-screen Rank Up ceremony.
   */
  awardModuleComplete: (input: {
    title: string;
    detail: string;
    refId?: string;
    xp?: number;
  }) => Promise<void>;
  clearCelebration: () => void;
  clearRankUp: () => void;
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

function fireRankNotification(rankTitle: string) {
  const name = useUserStore.getState().userName?.trim();
  const body = name
    ? `Your tailoring mastery is growing, ${name}. Keep up the incredible work.`
    : "Your tailoring mastery is growing. Keep up the incredible work.";
  void NotificationManager.showLocal({
    title: `Rank Achieved: ${rankTitle}`,
    body,
    tag: `atelier-rank-${rankTitle}`,
  });
}

function buildRankUp(
  previousXp: number,
  snap: { totalXp: number; modulesCompleted: number },
  rank: MasteryLevel,
): RankUpCelebration {
  return {
    id: `rank-${rank.level}-${Date.now()}`,
    rank,
    previousLevel: resolveMastery(previousXp).level,
    totalXp: snap.totalXp,
  };
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  hydrated: false,
  totalXp: 0,
  modulesCompleted: 0,
  celebration: null,
  rankUp: null,

  progress: () => {
    const { totalXp, modulesCompleted } = get();
    return resolveMastery(totalXp, modulesCompleted);
  },

  hydrate: async () => {
    if (get().hydrated) return;
    const snap = await readMasterySnapshot();
    // Initial hydrate must never fire a rank-up ceremony.
    set({ ...snap, hydrated: true });
  },

  refresh: async () => {
    const previousXp = get().totalXp;
    const wasHydrated = get().hydrated;
    const snap = await readMasterySnapshot();
    if (!wasHydrated) {
      set({ ...snap, hydrated: true });
      return;
    }
    const crossed = didCrossRankBoundary(previousXp, snap.totalXp);
    if (crossed) {
      fireRankNotification(crossed.title);
      set({
        ...snap,
        hydrated: true,
        celebration: null,
        rankUp: buildRankUp(previousXp, snap, crossed),
      });
      return;
    }
    set({ ...snap, hydrated: true });
  },

  awardModuleComplete: async ({ title, detail, refId, xp = MASTERY_AWARD_XP }) => {
    const previousXp = get().totalXp;
    await recordActivity({
      type: "milestone",
      title,
      detail,
      refId,
      xp,
    });
    const snap = await readMasterySnapshot();
    const mastery = resolveMastery(snap.totalXp, snap.modulesCompleted);
    const crossed = didCrossRankBoundary(previousXp, snap.totalXp);

    if (crossed) {
      fireRankNotification(crossed.title);
      set({
        ...snap,
        hydrated: true,
        celebration: null,
        rankUp: buildRankUp(previousXp, snap, crossed),
      });
      return;
    }

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
  clearRankUp: () => set({ rankUp: null }),
}));
