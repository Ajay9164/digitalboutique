/**
 * Cinematic camera path for scroll-driven mannequin fly-through.
 * `t` is scroll progress in [0, 1] — scrubbable forward and back.
 *
 * Timeline:
 *  0 → CLIMAX_START  — orbit / crane / dolly around the form
 *  CLIMAX_START → 1  — grand pull-back reveal of the full digital mannequin
 */

export type CinemaPose = {
  position: readonly [number, number, number];
  lookAt: readonly [number, number, number];
  fov: number;
};

/** Progress where the orbit hands off to the grand reveal. */
export const CINEMA_CLIMAX_START = 0.72;

/** Smoothstep ease for IMAX-style acceleration / deceleration. */
export function cinemaEase(t: number): number {
  const p = Math.min(1, Math.max(0, t));
  return p * p * (3 - 2 * p);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPose(a: CinemaPose, b: CinemaPose, t: number): CinemaPose {
  return {
    position: [
      lerp(a.position[0], b.position[0], t),
      lerp(a.position[1], b.position[1], t),
      lerp(a.position[2], b.position[2], t),
    ],
    lookAt: [
      lerp(a.lookAt[0], b.lookAt[0], t),
      lerp(a.lookAt[1], b.lookAt[1], t),
      lerp(a.lookAt[2], b.lookAt[2], t),
    ],
    fov: lerp(a.fov, b.fov, t),
  };
}

/**
 * Orbit + crane + gentle dolly around the dress-form look target.
 * `u` is eased orbit progress in [0, 1] (before the climax pull-back).
 */
function orbitPoseAt(u: number): CinemaPose {
  const e = cinemaEase(u);

  // ~280° azimuthal sweep for a full cinematic orbit feel
  const angle = -0.42 + e * Math.PI * 1.55;
  const radius = 2.18 - e * 0.72 + Math.sin(e * Math.PI) * 0.12;
  const y = 1.52 - e * 0.58 + Math.sin(e * Math.PI * 2) * 0.07;
  const lookY = 1.24 - e * 0.2;
  const lookX = Math.sin(e * Math.PI) * 0.04;
  const fov = 31 + Math.sin(e * Math.PI) * 5;

  return {
    position: [Math.sin(angle) * radius, y, Math.cos(angle) * radius],
    lookAt: [lookX, lookY, 0],
    fov,
  };
}

/** Wide hero reveal — camera pulled back to show the full evolved form. */
const REVEAL_POSE: CinemaPose = {
  position: [0.22, 1.48, 3.95],
  lookAt: [0, 1.02, 0],
  fov: 42,
};

/**
 * Full cinema path including the grand climax pull-back.
 */
export function cinemaPoseAt(t: number): CinemaPose {
  const p = Math.min(1, Math.max(0, t));

  if (p <= CINEMA_CLIMAX_START) {
    return orbitPoseAt(p / CINEMA_CLIMAX_START);
  }

  const climaxU = (p - CINEMA_CLIMAX_START) / (1 - CINEMA_CLIMAX_START);
  // Ease-out pull-back so the reveal lands with weight.
  const e = 1 - Math.pow(1 - cinemaEase(climaxU), 1.35);
  return lerpPose(orbitPoseAt(1), REVEAL_POSE, e);
}
