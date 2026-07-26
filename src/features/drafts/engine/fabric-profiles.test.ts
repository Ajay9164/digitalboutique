import { describe, expect, it } from "vitest";
import { roundCm } from "@/features/drafts/data/formulas";
import { computeEngineCalculations } from "@/features/drafts/engine/calculations";
import {
  applyFabricAdjustments,
  FABRIC_PROFILES,
} from "@/features/drafts/engine/fabric-profiles";
import type { EngineFormValues } from "@/features/drafts/engine/schema";

const base: EngineFormValues = {
  bust: 92,
  waist: 74,
  hip: 98,
  neck: 36,
  shoulder: 13,
  sleeveLength: 56,
  blouseLength: 38,
  apexDistance: 18,
  apexDepth: 24,
  bustEase: 4,
  waistEase: 2,
  hipEase: 3,
  seamAllowance: 1.5,
};

describe("applyFabricAdjustments", () => {
  it("leaves draft unchanged when no fabric is selected", () => {
    const calc = computeEngineCalculations(base);
    expect(applyFabricAdjustments(calc, null)).toEqual(calc);
  });

  it("inflates cotton block for 3% shrinkage and widens SA", () => {
    const calc = computeEngineCalculations(base);
    const cotton = applyFabricAdjustments(calc, "cotton");
    const factor = FABRIC_PROFILES.cotton.shrinkageFactor;

    expect(cotton.draft.bustQuarter).toBeCloseTo(
      Math.round(calc.draft.bustQuarter * factor * 10) / 10,
    );
    expect(cotton.draft.seamAllowance).toBe(
      roundCm(
        calc.draft.seamAllowance + FABRIC_PROFILES.cotton.seamAllowanceDelta,
      ),
    );
    expect(cotton.draft.blouseLength).toBeGreaterThan(calc.draft.blouseLength);
    expect(cotton.results.some((row) => row.id === "fabric")).toBe(true);
  });

  it("applies silk ease and larger seam allowance than cotton", () => {
    const calc = computeEngineCalculations(base);
    const silk = applyFabricAdjustments(calc, "silk");
    const cotton = applyFabricAdjustments(calc, "cotton");

    expect(silk.draft.seamAllowance).toBeGreaterThan(cotton.draft.seamAllowance);
    expect(silk.draft.bustEase).toBe(
      calc.draft.bustEase + FABRIC_PROFILES.silk.bustEaseDelta,
    );
    expect(silk.draft.bustQuarter).toBeGreaterThan(calc.draft.bustQuarter);
  });
});
