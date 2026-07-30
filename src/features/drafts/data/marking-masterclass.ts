import type { ConstructionStepId } from "@/features/drafts/data/construction-steps";
import type { UnitSystem } from "@/stores/unit-store";
import { formatTeachingMeasure } from "@/utils/units";

/**
 * Phase 3 — Animated Draft Marking Tutorial.
 * Four pedagogical beats that group construction lines into a beginner masterclass.
 * Teaching constants are stored in inches and localized via the global unit store.
 */

export type MarkingMasterclassStepId =
  | "center-fold"
  | "neck-shoulder"
  | "armhole-curve"
  | "chest-waist-darts";

export type MarkingMasterclassStep = {
  id: MarkingMasterclassStepId;
  order: number;
  /** Full lesson title shown on the stepper card. */
  title: string;
  shortLabel: string;
  /** One-line chalk-math formula (shown on the board + card header). */
  formula: (unit: UnitSystem) => string;
  /** Plain-English explanation of the math. */
  mathExplainer: (unit: UnitSystem) => string;
  whyItMatters: string;
  howToDraw: (unit: UnitSystem) => string[];
  /** Construction lines that become visible at this beat. */
  reveals: ConstructionStepId[];
  /** Primary line to highlight while this beat is active. */
  activeLine: ConstructionStepId;
};

export const MARKING_MASTERCLASS_STEPS: MarkingMasterclassStep[] = [
  {
    id: "center-fold",
    order: 0,
    title: "1. The Center Fold & Length",
    shortLabel: "Center Fold",
    formula: () => "Length = Blouse Length",
    mathExplainer: () =>
      "The center fold is the spine of the half-block. Draw a vertical chalk line equal to the full blouse length — every later width is measured outward from this fold so the left and right halves stay true.",
    whyItMatters:
      "Without a true center fold, neck, bust, and waist widths drift and the blouse will twist when sewn.",
    howToDraw: () => [
      "Square a vertical line the full blouse length down the paper.",
      "Mark the top as the neck / shoulder origin.",
      "Keep this line as your permanent reference axis.",
    ],
    reveals: ["center-line"],
    activeLine: "center-line",
  },
  {
    id: "neck-shoulder",
    order: 1,
    title: "2. Neck & Shoulder Slope",
    shortLabel: "Neck & Shoulder",
    formula: (unit) =>
      `Neck Width = Neck ÷ 6 + ${formatTeachingMeasure(0.5, unit)}`,
    mathExplainer: (unit) =>
      `From the top of the center fold, measure Neck ÷ 6 + ${formatTeachingMeasure(0.5, unit)} outward for neck width, then drop the front neck depth. From that neck point, run the shoulder length outward with a small shoulder drop so the armhole starts on the bone.`,
    whyItMatters:
      "Neck width and shoulder slope place the collar and sleeve correctly — too wide and the neckline gapes; too steep and the shoulder sits off the bone.",
    howToDraw: (unit) => [
      `Measure Neck ÷ 6 + ${formatTeachingMeasure(0.5, unit)} out from the center fold at the top.`,
      "Drop front neck depth along the center fold and curve them together.",
      "From the neck point, mark shoulder length with a gentle drop to the outer shoulder.",
    ],
    reveals: ["center-line", "neck", "shoulder"],
    activeLine: "neck",
  },
  {
    id: "armhole-curve",
    order: 2,
    title: "3. The Armhole Curve",
    shortLabel: "Armhole",
    formula: (unit) =>
      `Armhole Depth = Bust ÷ 4 − ${formatTeachingMeasure(1.5, unit)}`,
    mathExplainer: (unit) =>
      `Drop from the outer shoulder by Bust ÷ 4 − ${formatTeachingMeasure(1.5, unit)} to find underarm depth, then draw a smooth scye curve from shoulder through the front pitch into the underarm. The curve should be deeper toward the underarm than at the shoulder.`,
    whyItMatters:
      "The armhole (scye) is the sleeve opening. Its depth and curve control mobility — too tight and the arm cannot lift; too deep and the bust collapses.",
    howToDraw: (unit) => [
      `Calculate armhole depth as Bust ÷ 4 − ${formatTeachingMeasure(1.5, unit)} from the shoulder.`,
      "Mark the underarm on the bust-width line.",
      "Shape a gentle curve from outer shoulder into the underarm.",
    ],
    reveals: ["center-line", "neck", "shoulder", "armhole"],
    activeLine: "armhole",
  },
  {
    id: "chest-waist-darts",
    order: 3,
    title: "4. Chest, Waist & Darts",
    shortLabel: "Chest & Darts",
    formula: (unit) =>
      `Chest = Bust ÷ 4 + ${formatTeachingMeasure(1.5, unit)}  ·  Dart = Bust¼ − Waist¼`,
    mathExplainer: (unit) =>
      `To find the chest line, divide the bust measurement by 4 and add ${formatTeachingMeasure(1.5, unit)} for ease allowance. Square the waist at Waist ÷ 4, then shape darts from the surplus (Bust¼ − Waist¼) so flat paper becomes a 3D bust.`,
    whyItMatters:
      "Chest and waist widths lock the fit. Darts remove the surplus between them so the blouse hugs the apex instead of hanging like a tube.",
    howToDraw: (unit) => [
      `At apex depth, draw Bust ÷ 4 + ease (≈ ${formatTeachingMeasure(1.5, unit)}) across for the chest line.`,
      "Lower to the waist and draw Waist ÷ 4 horizontally.",
      "Open dart intake (Bust¼ − Waist¼) on the waist and join both legs to a tip short of the apex.",
      "True the side seam from underarm through waist to the hem.",
    ],
    reveals: [
      "center-line",
      "neck",
      "shoulder",
      "armhole",
      "bust-line",
      "waist-line",
      "side-seam",
      "darts",
      "hem",
    ],
    activeLine: "bust-line",
  },
];

export function masterclassLineVisibility(
  stepIndex: number,
): Record<ConstructionStepId, boolean> {
  const empty: Record<ConstructionStepId, boolean> = {
    "center-line": false,
    "bust-line": false,
    "waist-line": false,
    neck: false,
    shoulder: false,
    armhole: false,
    "side-seam": false,
    darts: false,
    hem: false,
  };
  if (stepIndex < 0) return empty;
  const clamped = Math.min(stepIndex, MARKING_MASTERCLASS_STEPS.length - 1);
  const visible = { ...empty };
  for (let i = 0; i <= clamped; i++) {
    for (const id of MARKING_MASTERCLASS_STEPS[i]!.reveals) {
      visible[id] = true;
    }
  }
  return visible;
}

/** Journey focus tokens → masterclass step ids */
export const FOCUS_TO_MASTERCLASS: Record<string, MarkingMasterclassStepId> = {
  neck: "neck-shoulder",
  shoulder: "neck-shoulder",
  armhole: "armhole-curve",
  bust: "chest-waist-darts",
  waist: "chest-waist-darts",
  princess: "chest-waist-darts",
  darts: "chest-waist-darts",
  side: "chest-waist-darts",
  sa: "center-fold",
  length: "center-fold",
  center: "center-fold",
};
