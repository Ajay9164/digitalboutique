/**
 * Body → drafting measurement conversions used throughout Draft Learning.
 * Units are centimetres. Ease and seam allowance are teaching defaults
 * that Practice Mode can vary.
 */

export type BodyMeasurements = {
  bust: number;
  waist: number;
  neck: number;
  shoulder: number;
  blouseLength: number;
  apexDistance: number;
  /** Neck base to apex, vertical. */
  apexDepth: number;
};

export type DraftingInputs = {
  /** Working ease added to the bust before quartering. */
  bustEase: number;
  /** Working ease added to the waist before quartering. */
  waistEase: number;
  /** Seam allowance around the block (cm). */
  seamAllowance: number;
};

export type DraftingMeasurements = {
  bustQuarter: number;
  waistQuarter: number;
  neckWidth: number;
  neckDepthFront: number;
  shoulderDrop: number;
  shoulderLength: number;
  armholeDepth: number;
  princess: number;
  dartIntake: number;
  dartLength: number;
  hemWidth: number;
  blouseLength: number;
  apexFromCenter: number;
  apexDepth: number;
  bustEase: number;
  waistEase: number;
  seamAllowance: number;
};

export type FormulaId =
  | "bust-quarter"
  | "waist-quarter"
  | "neck-width"
  | "shoulder-drop"
  | "armhole"
  | "princess"
  | "darts"
  | "ease-allowance"
  | "seam-allowance";

export type FormulaGuide = {
  id: FormulaId;
  label: string;
  formula: string;
  description: string;
  compute: (body: BodyMeasurements, inputs: DraftingInputs) => number;
  unitNote?: string;
};

/** Classic blouse-draft teaching defaults (cm). */
export const DEFAULT_DRAFTING_INPUTS: DraftingInputs = {
  bustEase: 4,
  waistEase: 2,
  seamAllowance: 1,
};

export const SAMPLE_BODY: BodyMeasurements = {
  bust: 88,
  waist: 72,
  neck: 36,
  shoulder: 13,
  blouseLength: 38,
  apexDistance: 18,
  apexDepth: 24,
};

export const FORMULAS: FormulaGuide[] = [
  {
    id: "bust-quarter",
    label: "Bust ÷ 4",
    formula: "(Bust + Ease) ÷ 4",
    description:
      "Places the half-front width at the bust line. Ease is added first so the finished garment has room to breathe.",
    compute: (body, inputs) => (body.bust + inputs.bustEase) / 4,
  },
  {
    id: "waist-quarter",
    label: "Waist ÷ 4",
    formula: "(Waist + Ease) ÷ 4",
    description:
      "Places the half-front width at the waist. The difference from the bust quarter becomes dart intake.",
    compute: (body, inputs) => (body.waist + inputs.waistEase) / 4,
  },
  {
    id: "neck-width",
    label: "Neck Width",
    formula: "Neck ÷ 6 + 0.5",
    description:
      "Sets how far the neckline sits from center front at the shoulder. Too narrow chokes; too wide slides off.",
    compute: (body) => body.neck / 6 + 0.5,
  },
  {
    id: "shoulder-drop",
    label: "Shoulder Drop",
    formula: "2.5 cm (standard)",
    description:
      "How far the outer shoulder falls below the neck point. Creates the natural slope of the shoulder seam.",
    compute: () => 2.5,
    unitNote: "Teaching constant — adjust for square or sloping shoulders.",
  },
  {
    id: "armhole",
    label: "Armhole Depth",
    formula: "Bust ÷ 4 − 1.5",
    description:
      "Depth from the shoulder point down to the underarm. This is the scye that the sleeve cap must match.",
    compute: (body) => body.bust / 4 - 1.5,
  },
  {
    id: "princess",
    label: "Princess",
    formula: "Apex depth + shoulder mid offset",
    description:
      "The shaping path from mid-shoulder over the apex. Used when drafting princess seams instead of darts.",
    compute: (body) => body.apexDepth + body.shoulder / 2,
  },
  {
    id: "darts",
    label: "Darts",
    formula: "Bust¼ − Waist¼",
    description:
      "The surplus fabric between bust and waist that must be taken out as dart intake so the block cinches cleanly.",
    compute: (body, inputs) =>
      (body.bust + inputs.bustEase) / 4 - (body.waist + inputs.waistEase) / 4,
  },
  {
    id: "ease-allowance",
    label: "Ease Allowance",
    formula: "Chosen working ease",
    description:
      "Extra room beyond the body so the garment can be worn and moved in. Blouses typically use 2–5 cm on the bust.",
    compute: (_body, inputs) => inputs.bustEase,
  },
  {
    id: "seam-allowance",
    label: "Seam Allowance",
    formula: "Usually 1 cm",
    description:
      "Fabric beyond the stitch line. Drafting lines are net; seam allowance is added when cutting.",
    compute: (_body, inputs) => inputs.seamAllowance,
  },
];

export function computeDraftingMeasurements(
  body: BodyMeasurements,
  inputs: DraftingInputs = DEFAULT_DRAFTING_INPUTS,
): DraftingMeasurements {
  const bustQuarter = (body.bust + inputs.bustEase) / 4;
  const waistQuarter = (body.waist + inputs.waistEase) / 4;
  const dartIntake = Math.max(0.5, bustQuarter - waistQuarter);
  const neckWidth = body.neck / 6 + 0.5;
  const shoulderDrop = 2.5;
  const armholeDepth = body.bust / 4 - 1.5;
  const apexFromCenter = body.apexDistance / 2;

  return {
    bustQuarter,
    waistQuarter,
    neckWidth,
    neckDepthFront: neckWidth + 1.5,
    shoulderDrop,
    shoulderLength: body.shoulder,
    armholeDepth,
    princess: body.apexDepth + body.shoulder / 2,
    dartIntake,
    dartLength: Math.max(8, body.apexDepth - 3),
    hemWidth: waistQuarter,
    blouseLength: body.blouseLength,
    apexFromCenter,
    apexDepth: body.apexDepth,
    bustEase: inputs.bustEase,
    waistEase: inputs.waistEase,
    seamAllowance: inputs.seamAllowance,
  };
}

export function roundCm(value: number, places = 1): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
