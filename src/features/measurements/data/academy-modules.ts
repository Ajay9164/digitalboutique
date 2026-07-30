import type { MeasurementId } from "@/features/measurements/data/measurements";
import { MEASUREMENT_MAP } from "@/features/measurements/data/measurements";

/**
 * Module-wise academy curriculum for the Measurements LearningPanel.
 * Module 1 is the default when no body region is selected.
 */
export type AcademyModuleId = "foundation-upper" | MeasurementId;

export type AcademyModuleMeta = {
  id: AcademyModuleId;
  moduleNumber: number;
  title: string;
  shortTitle: string;
  overview: string;
  whyItMatters: string;
  /** Measurement topics included in this module (foundation only). */
  topicIds: MeasurementId[];
};

/** Upper-body foundation topics — Module 1 default. */
export const FOUNDATION_UPPER_TOPIC_IDS: MeasurementId[] = [
  "bust",
  "upper-bust",
  "waist",
  "neck",
  "shoulder",
  "front-shoulder",
  "back-shoulder",
  "cross-front",
  "cross-back",
  "apex",
  "apex-distance",
];

export const FOUNDATION_MODULE: AcademyModuleMeta = {
  id: "foundation-upper",
  moduleNumber: 1,
  title: "Module 1: The Foundation — Upper Body Measurements",
  shortTitle: "The Foundation",
  overview:
    "Master the upper-body chart before you draft a single line. These girths and widths set the bodice block — bust, waist, neck, shoulders, and apex placement — so every later blouse and kurti fits true.",
  whyItMatters:
    "An error in the foundation multiplies through the whole draft: wrong bust ease, gaping necklines, twisting shoulders, and dart tips that miss the apex. Learn tape placement here first, then tap each glowing region for a deep dive.",
  topicIds: FOUNDATION_UPPER_TOPIC_IDS,
};

export function measurementModuleNumber(id: MeasurementId): number {
  const index = FOUNDATION_UPPER_TOPIC_IDS.indexOf(id);
  if (index >= 0) return index + 2; // Module 1 is foundation; topics start at 2
  const allIds = Object.keys(MEASUREMENT_MAP) as MeasurementId[];
  const global = allIds.indexOf(id);
  return global >= 0 ? global + 2 : 2;
}

export function measurementModuleTitle(id: MeasurementId): string {
  const guide = MEASUREMENT_MAP[id];
  const n = measurementModuleNumber(id);
  return `Module ${n}: The ${guide.label} Measurement`;
}
