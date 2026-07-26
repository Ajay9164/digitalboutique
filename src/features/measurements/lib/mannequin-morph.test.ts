import { describe, expect, it } from "vitest";
import {
  buildMorphedProfile,
  morphFactorAtHeight,
} from "@/features/measurements/lib/mannequin-morph";
import { DEFAULT_BODY_MORPH } from "@/stores/measurement-store";

describe("mannequin morph", () => {
  it("keeps baseline profile at morph 1,1,1", () => {
    const profile = buildMorphedProfile(DEFAULT_BODY_MORPH);
    expect(profile.length).toBeGreaterThan(5);
    expect(morphFactorAtHeight(1.32, DEFAULT_BODY_MORPH)).toBeCloseTo(1, 2);
  });

  it("scales bust band when bust morph increases", () => {
    const bigger = morphFactorAtHeight(1.32, {
      bust: 1.25,
      waist: 1,
      hips: 1,
    });
    expect(bigger).toBeGreaterThan(1.1);
  });

  it("scales hips band when hips morph increases", () => {
    const bigger = morphFactorAtHeight(0.8, {
      bust: 1,
      waist: 1,
      hips: 1.3,
    });
    expect(bigger).toBeGreaterThan(1.15);
  });
});
