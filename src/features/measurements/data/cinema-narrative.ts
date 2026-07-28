/**
 * Scroll waypoints for cinematic title cards.
 * Windows are inclusive [enter, exit]; peak is full opacity mid-hold.
 */

export type CinemaBeatSide = "left" | "right" | "bottom-left" | "bottom-right";

export type CinemaBeat = {
  id: string;
  enter: number;
  peak: number;
  exit: number;
  side: CinemaBeatSide;
  eyebrow: string;
  title: string;
  body: string;
};

/**
 * Beats aligned to camera angles along the fly-through timeline (0→1).
 */
export const CINEMA_BEATS: readonly CinemaBeat[] = [
  {
    id: "overture",
    enter: 0.0,
    peak: 0.08,
    exit: 0.22,
    side: "left",
    eyebrow: "Overture",
    title: "The Living Form",
    body: "A raw atelier dress form — linen and clay — waiting for light to rewrite the craft.",
  },
  {
    id: "profile",
    enter: 0.2,
    peak: 0.34,
    exit: 0.48,
    side: "right",
    eyebrow: "Act I · Profile",
    title: "Measure in Silence",
    body: "Every contour is a promise. Scroll and the camera listens, orbiting the figure like a fitting room keynote.",
  },
  {
    id: "metamorphosis",
    enter: 0.42,
    peak: 0.56,
    exit: 0.7,
    side: "left",
    eyebrow: "Act II · Metamorphosis",
    title: "From Cloth to Code",
    body: "Champagne rim light reveals the shift — organic grain dissolving into a holographic mesh of digital perfection.",
  },
  {
    id: "apotheosis",
    enter: 0.58,
    peak: 0.68,
    exit: 0.78,
    side: "bottom-right",
    eyebrow: "Finale",
    title: "Digital Perfection",
    body: "Organic grain dissolves into holographic mesh — craft rewritten as light.",
  },
  {
    id: "reveal",
    enter: 0.76,
    peak: 0.9,
    exit: 1.05,
    side: "bottom-left",
    eyebrow: "Climax",
    title: "In All Its Glory",
    body: "The camera yields. The fully evolved digital mannequin stands revealed — ready for the atelier beyond.",
  },
] as const;

/** Triangular opacity envelope for a beat at scroll progress `t`. */
export function beatOpacity(t: number, beat: CinemaBeat): number {
  const { enter, peak, exit } = beat;
  if (t <= enter || t >= exit) return 0;
  if (t === peak) return 1;
  if (t < peak) {
    const span = peak - enter;
    return span <= 0 ? 1 : (t - enter) / span;
  }
  const span = exit - peak;
  return span <= 0 ? 1 : (exit - t) / span;
}

/** Slide offset in px — drifts in from the beat's side. */
export function beatSlideX(t: number, beat: CinemaBeat): number {
  const o = beatOpacity(t, beat);
  const amp = 28;
  if (beat.side === "left" || beat.side === "bottom-left") {
    return (1 - o) * -amp;
  }
  return (1 - o) * amp;
}

export function beatSlideY(t: number, beat: CinemaBeat): number {
  const o = beatOpacity(t, beat);
  if (beat.side === "bottom-left" || beat.side === "bottom-right") {
    return (1 - o) * 22;
  }
  return (1 - o) * 10;
}
