/**
 * Scroll-driven craft → holographic material blend for the dress form.
 * `t` is cinema scroll progress in [0, 1].
 */

export type LuxuryMaterialState = {
  /** Base albedo (hex). */
  color: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenRoughness: number;
  sheenColor: string;
  iridescence: number;
  iridescenceIOR: number;
  emissive: string;
  emissiveIntensity: number;
  envMapIntensity: number;
  /** Soft hologram translucency cue (0 = solid craft, 1 = ethereal). */
  transmission: number;
  thickness: number;
};

/** Raw organic atelier form — linen / clay / unfinished wood-dressform. */
export const ORGANIC_MATERIAL: LuxuryMaterialState = {
  color: "#C4B09A",
  roughness: 0.82,
  metalness: 0.02,
  clearcoat: 0.08,
  clearcoatRoughness: 0.7,
  sheen: 0.35,
  sheenRoughness: 0.75,
  sheenColor: "#E8D5B8",
  iridescence: 0,
  iridescenceIOR: 1.3,
  emissive: "#1A120C",
  emissiveIntensity: 0.02,
  envMapIntensity: 0.25,
  transmission: 0,
  thickness: 0.2,
};

/** Sleek futuristic holographic mesh — champagne + cyan iridescence. */
export const HOLOGRAPHIC_MATERIAL: LuxuryMaterialState = {
  color: "#E8F4FF",
  roughness: 0.18,
  metalness: 0.55,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  sheen: 0.85,
  sheenRoughness: 0.25,
  sheenColor: "#F5E6C0",
  iridescence: 1,
  iridescenceIOR: 1.85,
  emissive: "#3DE8FF",
  emissiveIntensity: 0.35,
  envMapIntensity: 0.9,
  transmission: 0.22,
  thickness: 0.55,
};

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function smoothstep(t: number): number {
  const p = clamp01(t);
  return p * p * (3 - 2 * p);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Hex → RGB 0–1 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = Number.parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(lerp(ar, br, t), lerp(ag, bg, t), lerp(ab, bb, t));
}

/**
 * Interpolate organic craft → holographic digital perfection along scroll.
 */
export function luxuryMaterialAt(t: number): LuxuryMaterialState {
  const e = smoothstep(t);
  const a = ORGANIC_MATERIAL;
  const b = HOLOGRAPHIC_MATERIAL;
  return {
    color: lerpHex(a.color, b.color, e),
    roughness: lerp(a.roughness, b.roughness, e),
    metalness: lerp(a.metalness, b.metalness, e),
    clearcoat: lerp(a.clearcoat, b.clearcoat, e),
    clearcoatRoughness: lerp(a.clearcoatRoughness, b.clearcoatRoughness, e),
    sheen: lerp(a.sheen, b.sheen, e),
    sheenRoughness: lerp(a.sheenRoughness, b.sheenRoughness, e),
    sheenColor: lerpHex(a.sheenColor, b.sheenColor, e),
    iridescence: lerp(a.iridescence, b.iridescence, e),
    iridescenceIOR: lerp(a.iridescenceIOR, b.iridescenceIOR, e),
    emissive: lerpHex(a.emissive, b.emissive, e),
    emissiveIntensity: lerp(a.emissiveIntensity, b.emissiveIntensity, e),
    envMapIntensity: lerp(a.envMapIntensity, b.envMapIntensity, e),
    transmission: lerp(a.transmission, b.transmission, e),
    thickness: lerp(a.thickness, b.thickness, e),
  };
}
