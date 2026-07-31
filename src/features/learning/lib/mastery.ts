/**
 * Mastery / Tailor Points level curve — offline-first, IndexedDB-backed XP.
 */

export type MasteryLevel = {
  level: number;
  title: string;
  minXp: number;
  /** Exclusive upper bound; Infinity for the final tier. */
  maxXp: number;
};

export const MASTERY_LEVELS: MasteryLevel[] = [
  { level: 1, title: "Apprentice", minXp: 0, maxXp: 100 },
  { level: 2, title: "Journeyman", minXp: 100, maxXp: 250 },
  { level: 3, title: "Cutter", minXp: 250, maxXp: 500 },
  { level: 4, title: "Tailor", minXp: 500, maxXp: 1000 },
  { level: 5, title: "Master Atelier", minXp: 1000, maxXp: Number.POSITIVE_INFINITY },
];

export const MASTERY_AWARD_XP = 50;

export type MasteryProgress = {
  totalXp: number;
  modulesCompleted: number;
  level: number;
  title: string;
  /** 0–1 progress within the current level. */
  progress: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
};

export function resolveMastery(totalXp: number, modulesCompleted = 0): MasteryProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  let current = MASTERY_LEVELS[0]!;
  for (const tier of MASTERY_LEVELS) {
    if (xp >= tier.minXp) current = tier;
  }
  const span = current.maxXp === Number.POSITIVE_INFINITY
    ? 500
    : current.maxXp - current.minXp;
  const xpIntoLevel = xp - current.minXp;
  const progress =
    current.maxXp === Number.POSITIVE_INFINITY
      ? 1
      : Math.min(1, Math.max(0, xpIntoLevel / span));

  return {
    totalXp: xp,
    modulesCompleted,
    level: current.level,
    title: current.title,
    progress,
    xpIntoLevel,
    xpForNextLevel:
      current.maxXp === Number.POSITIVE_INFINITY ? null : current.maxXp - xp,
  };
}

/**
 * If `nextXp` crosses into a higher rank than `previousXp`, return that new tier.
 * Otherwise null (same rank, or XP went down).
 */
export function didCrossRankBoundary(
  previousXp: number,
  nextXp: number,
): MasteryLevel | null {
  const prev = resolveMastery(previousXp);
  const next = resolveMastery(nextXp);
  if (next.level <= prev.level) return null;
  return MASTERY_LEVELS.find((tier) => tier.level === next.level) ?? null;
}
