import { describe, expect, it } from "vitest";
import {
  HOLOGRAPHIC_MATERIAL,
  ORGANIC_MATERIAL,
  luxuryMaterialAt,
  smoothstep,
} from "@/features/measurements/lib/luxury-material";

describe("luxuryMaterialAt", () => {
  it("starts organic at t=0", () => {
    const m = luxuryMaterialAt(0);
    expect(m.color.toLowerCase()).toBe(ORGANIC_MATERIAL.color.toLowerCase());
    expect(m.roughness).toBeCloseTo(ORGANIC_MATERIAL.roughness);
    expect(m.iridescence).toBeCloseTo(0);
  });

  it("ends holographic at t=1", () => {
    const m = luxuryMaterialAt(1);
    expect(m.color.toLowerCase()).toBe(HOLOGRAPHIC_MATERIAL.color.toLowerCase());
    expect(m.metalness).toBeCloseTo(HOLOGRAPHIC_MATERIAL.metalness);
    expect(m.iridescence).toBeCloseTo(1);
  });

  it("mid scroll is between craft and holo", () => {
    const m = luxuryMaterialAt(0.5);
    expect(m.roughness).toBeLessThan(ORGANIC_MATERIAL.roughness);
    expect(m.roughness).toBeGreaterThan(HOLOGRAPHIC_MATERIAL.roughness);
    expect(m.iridescence).toBeGreaterThan(0);
    expect(m.iridescence).toBeLessThan(1);
  });
});

describe("smoothstep", () => {
  it("clamps endpoints", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(-0.5)).toBe(0);
  });
});
