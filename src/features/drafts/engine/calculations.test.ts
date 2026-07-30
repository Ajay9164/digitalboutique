import { describe, expect, it } from "vitest";
import { computeEngineCalculations } from "@/features/drafts/engine/calculations";
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

describe("computeEngineCalculations", () => {
  it("computes quarter bust with ease", () => {
    const result = computeEngineCalculations(base);
    expect(result.draft.bustQuarter).toBe(24); // (92+4)/4
    expect(result.draft.waistQuarter).toBe(19); // (74+2)/4
    expect(result.map["bust-quarter"]).toBe(24);
  });

  it("keeps dart intake non-negative", () => {
    const result = computeEngineCalculations({
      ...base,
      waist: 200,
      waistEase: 0,
    });
    expect(result.draft.dartIntake).toBeGreaterThanOrEqual(0.5);
  });

  it("exposes labeled results for the calculation panel", () => {
    const result = computeEngineCalculations(base);
    expect(result.results.length).toBeGreaterThan(5);
    expect(
      result.results.every((row) =>
        row.breakdown.every((cell) => cell.cm != null || cell.text != null),
      ),
    ).toBe(true);
  });
});
