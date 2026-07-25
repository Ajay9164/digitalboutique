import type { MeasurementUnit } from "@/stores/measurement-store";

const CM_PER_INCH = 2.54;

export function cmToDisplay(cm: number, unit: MeasurementUnit): string {
  if (unit === "cm") return `${Math.round(cm * 10) / 10}`;
  const inches = cm / CM_PER_INCH;
  return `${Math.round(inches * 4) / 4}`;
}

export function formatRangeCm(
  range: [number, number],
  unit: MeasurementUnit,
): string {
  const suffix = unit === "cm" ? "cm" : "in";
  return `${cmToDisplay(range[0], unit)}–${cmToDisplay(range[1], unit)} ${suffix}`;
}
