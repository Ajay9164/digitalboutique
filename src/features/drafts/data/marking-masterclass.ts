import type { ConstructionStepId } from "@/features/drafts/data/construction-steps";

/**
 * Phase 3 — Animated Draft Marking Tutorial.
 * Four pedagogical beats that group construction lines into a beginner masterclass.
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
  formula: string;
  /** Plain-English explanation of the math. */
  mathExplainer: string;
  whyItMatters: string;
  howToDraw: string[];
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
    formula: "Length = Blouse Length",
    mathExplainer:
      "The center fold is the spine of the half-block. Draw a vertical chalk line equal to the full blouse length — every later width is measured outward from this fold so the left and right halves stay true.",
    whyItMatters:
      "Without a true center fold, neck, bust, and waist widths drift and the blouse will twist when sewn.",
    howToDraw: [
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
    formula: "Neck Width = Neck ÷ 6 + 0.5″",
    mathExplainer:
      "From the top of the center fold, measure Neck ÷ 6 + 0.5″ outward for neck width, then drop the front neck depth. From that neck point, run the shoulder length outward with a small shoulder drop so the armhole starts on the bone.",
    whyItMatters:
      "Neck width and shoulder slope place the collar and sleeve correctly — too wide and the neckline gapes; too steep and the shoulder sits off the bone.",
    howToDraw: [
      "Measure Neck ÷ 6 + 0.5″ out from the center fold at the top.",
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
    formula: "Armhole Depth = Bust ÷ 4 − 1.5″",
    mathExplainer:
      "Drop from the outer shoulder by Bust ÷ 4 − 1.5″ to find underarm depth, then draw a smooth scye curve from shoulder through the front pitch into the underarm. The curve should be deeper toward the underarm than at the shoulder.",
    whyItMatters:
      "The armhole (scye) is the sleeve opening. Its depth and curve control mobility — too tight and the arm cannot lift; too deep and the bust collapses.",
    howToDraw: [
      "Calculate armhole depth as Bust ÷ 4 − 1.5″ from the shoulder.",
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
    formula: "Chest = Bust ÷ 4 + 1.5″  ·  Dart = Bust¼ − Waist¼",
    mathExplainer:
      "To find the chest line, divide the bust measurement by 4 and add 1.5 inches for ease allowance. Square the waist at Waist ÷ 4, then shape darts from the surplus (Bust¼ − Waist¼) so flat paper becomes a 3D bust.",
    whyItMatters:
      "Chest and waist widths lock the fit. Darts remove the surplus between them so the blouse hugs the apex instead of hanging like a tube.",
    howToDraw: [
      "At apex depth, draw Bust ÷ 4 + ease (≈ 1.5″) across for the chest line.",
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
    for (const id of MARKING_MASTERCLASS_STEPS[i].reveals) {
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
