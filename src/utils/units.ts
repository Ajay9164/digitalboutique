import type { UnitSystem } from "@/stores/unit-store";

export const CM_PER_INCH = 2.54;

/**
 * Core conversion — teaching constants are authored in inches.
 * - `'in'`: returns the value as-is
 * - `'cm'`: × 2.54, rounded to 1 decimal place
 */
export function convert(valInInches: number, unit: UnitSystem): number {
  if (!Number.isFinite(valInInches)) return Number.NaN;
  if (unit === "cm") {
    return Math.round(valInInches * CM_PER_INCH * 10) / 10;
  }
  return valInInches;
}

/** Unit suffix for labels — `"in"` or `"cm"`. */
export function getLabel(unit: UnitSystem): UnitSystem {
  return unit;
}

/**
 * Format a length stored in inches for the user's preferred unit.
 * - `'in'`: raw inch value (two-decimal tailoring precision)
 * - `'cm'`: `(val * 2.54).toFixed(1)`
 */
export function formatMeasurement(
  inches: number,
  targetUnit: UnitSystem,
): string {
  if (!Number.isFinite(inches)) return "—";
  if (targetUnit === "cm") {
    // Round before toFixed so FP (e.g. 2.5×2.54) does not flip 6.35 → "6.3".
    return (Math.round(inches * CM_PER_INCH * 10) / 10).toFixed(1);
  }
  return String(Math.round(inches * 100) / 100);
}

/** `1.5 in` / `3.8 cm` — teaching copy tied to the global unit. */
export function formatTeachingMeasure(
  inches: number,
  unit: UnitSystem,
): string {
  return `${formatMeasurement(inches, unit)} ${getLabel(unit)}`;
}

/** Convert centimetres → bare display number in the active unit. */
export function cmToDisplay(cm: number, unit: UnitSystem): string {
  return String(cmToDisplayNumber(cm, unit));
}

/** Numeric cm → display unit (for form inputs). */
export function cmToDisplayNumber(cm: number, unit: UnitSystem): number {
  if (!Number.isFinite(cm)) return 0;
  if (unit === "cm") return Math.round(cm * 10) / 10;
  // Inch display uses 2-decimal tailoring precision (convert() is as-is for math).
  return Math.round((cm / CM_PER_INCH) * 100) / 100;
}

/** Display-unit input → centimetres (engine storage). */
export function displayToCm(value: number, unit: UnitSystem): number {
  if (!Number.isFinite(value)) return Number.NaN;
  if (unit === "cm") return value;
  return Math.round(value * CM_PER_INCH * 100) / 100;
}

/** Convert centimetres → `24.1 cm` / `9.5 in` for chalk board labels. */
export function formatFromCm(cm: number, unit: UnitSystem): string {
  return `${cmToDisplay(cm, unit)} ${getLabel(unit)}`;
}

/** Format a cm range for labels (e.g. typical adult span). */
export function formatRangeCm(
  range: readonly [number, number],
  unit: UnitSystem,
): string {
  return `${cmToDisplay(range[0], unit)}–${cmToDisplay(range[1], unit)} ${getLabel(unit)}`;
}

export function formatMeasurementWithUnit(
  inches: number,
  targetUnit: UnitSystem,
): string {
  return formatTeachingMeasure(inches, targetUnit);
}

/**
 * Resolve educational templates:
 *  `{{in:1.5}}`     → formatTeachingMeasure(1.5, unit)
 *  `{{cm:7.5}}`     → formatFromCm(7.5, unit)
 *  `{{rangeCm:18-23}}` → formatRangeCm([18,23], unit)
 *  `{{rangeIn:2.5-4}}` → inch range localized
 */
export function resolveMeasureTemplate(
  template: string,
  unit: UnitSystem,
): string {
  return template
    .replace(/\{\{in:([\d.]+)\}\}/g, (_, raw: string) =>
      formatTeachingMeasure(Number(raw), unit),
    )
    .replace(/\{\{cm:([\d.]+)\}\}/g, (_, raw: string) =>
      formatFromCm(Number(raw), unit),
    )
    .replace(/\{\{rangeCm:([\d.]+)-([\d.]+)\}\}/g, (_, a: string, b: string) =>
      formatRangeCm([Number(a), Number(b)], unit),
    )
    .replace(/\{\{rangeIn:([\d.]+)-([\d.]+)\}\}/g, (_, a: string, b: string) => {
      const lo = formatMeasurement(Number(a), unit);
      const hi = formatMeasurement(Number(b), unit);
      return `${lo}–${hi} ${getLabel(unit)}`;
    });
}

export function resolveMeasureLines(
  lines: readonly string[],
  unit: UnitSystem,
): string[] {
  return lines.map((line) => resolveMeasureTemplate(line, unit));
}
