import type { BodyMorph } from "@/stores/measurement-store";

/**
 * Baseline dress-form lathe profile: [radius, height].
 * Height bands map to hips → waist → bust → neck.
 */
export const BASE_MANNEQUIN_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0.001, 0.64],
  [0.09, 0.66],
  [0.155, 0.72],
  [0.175, 0.88],
  [0.14, 0.98],
  [0.115, 1.06],
  [0.125, 1.14],
  [0.135, 1.22],
  [0.175, 1.32],
  [0.145, 1.42],
  [0.16, 1.5],
  [0.1, 1.54],
  [0.055, 1.58],
  [0.045, 1.66],
];

/** Smoothstep blend for band transitions. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Interpolate morph multipliers across height so hips/waist/bust
 * scale the correct silhouette rings without hard seams.
 */
export function morphFactorAtHeight(y: number, morph: BodyMorph): number {
  const hips = morph.hips;
  const waist = morph.waist;
  const bust = morph.bust;

  // hips dominant below ~0.92, waist mid, bust upper torso
  const toWaist = smoothstep(0.78, 1.02, y);
  const toBust = smoothstep(1.08, 1.3, y);
  const pastBust = smoothstep(1.42, 1.58, y);

  const hipsToWaist = hips * (1 - toWaist) + waist * toWaist;
  const waistToBust = hipsToWaist * (1 - toBust) + bust * toBust;
  // Ease back toward baseline near neck so the neck knob stays stable
  return waistToBust * (1 - pastBust) + 1 * pastBust;
}

export function buildMorphedProfile(
  morph: BodyMorph,
): Array<[number, number]> {
  return BASE_MANNEQUIN_PROFILE.map(([radius, y]) => {
    if (radius < 0.01) return [radius, y];
    return [radius * morphFactorAtHeight(y, morph), y];
  });
}
