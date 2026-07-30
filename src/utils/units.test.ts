import { describe, expect, it } from "vitest";
import {
  cmToDisplay,
  cmToDisplayNumber,
  convert,
  displayToCm,
  formatFromCm,
  formatMeasurement,
  formatMeasurementWithUnit,
  formatRangeCm,
  formatTeachingMeasure,
  getLabel,
  resolveMeasureTemplate,
} from "@/utils/units";

describe("convert + getLabel", () => {
  it("returns inches as-is", () => {
    expect(convert(1.5, "in")).toBe(1.5);
    expect(convert(10, "in")).toBe(10);
  });

  it("converts inches to cm at 2.54× with 1 decimal", () => {
    expect(convert(1.5, "cm")).toBe(3.8);
    expect(convert(10, "cm")).toBe(25.4);
  });

  it("getLabel returns the unit token", () => {
    expect(getLabel("in")).toBe("in");
    expect(getLabel("cm")).toBe("cm");
  });
});

describe("formatMeasurement", () => {
  it("converts inches to cm at 2.54× with 1 decimal", () => {
    expect(formatMeasurement(10, "cm")).toBe("25.4");
    expect(formatMeasurement(1, "cm")).toBe("2.5");
  });

  it("keeps inches with two-decimal precision", () => {
    expect(formatMeasurement(5.125, "in")).toBe("5.13");
    expect(formatMeasurement(10, "in")).toBe("10");
  });

  it("handles non-finite input", () => {
    expect(formatMeasurement(Number.NaN, "cm")).toBe("—");
  });
});

describe("cm helpers", () => {
  it("formats ranges with unit suffix", () => {
    expect(formatRangeCm([81, 102], "cm")).toBe("81–102 cm");
    expect(formatRangeCm([81.28, 101.6], "in")).toContain("in");
  });

  it("cmToDisplay mirrors formatMeasurement for inch target", () => {
    expect(cmToDisplay(25.4, "in")).toBe(formatMeasurement(10, "in"));
    expect(cmToDisplay(25.4, "cm")).toBe("25.4");
  });

  it("includes unit in withUnit helper", () => {
    expect(formatMeasurementWithUnit(10, "cm")).toBe("25.4 cm");
  });

  it("formatFromCm localizes chalk-board values", () => {
    expect(formatFromCm(24.13, "cm")).toBe("24.1 cm");
    expect(formatFromCm(24.13, "in")).toBe("9.5 in");
  });

  it("formatTeachingMeasure matches mission template style", () => {
    expect(formatTeachingMeasure(1.5, "in")).toBe("1.5 in");
    expect(formatTeachingMeasure(1.5, "cm")).toBe("3.8 cm");
  });

  it("converts display inputs back to centimetres", () => {
    expect(displayToCm(10, "in")).toBe(25.4);
    expect(displayToCm(25.4, "cm")).toBe(25.4);
  });

  it("cmToDisplayNumber mirrors chalk conversion", () => {
    expect(cmToDisplayNumber(25.4, "in")).toBe(10);
    expect(cmToDisplayNumber(25.4, "cm")).toBe(25.4);
  });
});

describe("resolveMeasureTemplate", () => {
  it("resolves in / cm / range tokens", () => {
    expect(resolveMeasureTemplate("Add {{in:1.5}} ease", "cm")).toBe(
      "Add 3.8 cm ease",
    );
    expect(resolveMeasureTemplate("Offset {{cm:7.5}}", "in")).toBe(
      "Offset 2.95 in",
    );
    expect(resolveMeasureTemplate("Span {{rangeCm:18-23}}", "cm")).toBe(
      "Span 18–23 cm",
    );
    expect(resolveMeasureTemplate("Gap {{rangeIn:2.5-4}}", "cm")).toBe(
      "Gap 6.4–10.2 cm",
    );
  });
});
