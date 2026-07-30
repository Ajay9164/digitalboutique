import { roundCm } from "@/features/drafts/data/formulas";
import type { EngineFormValues } from "@/features/drafts/engine/schema";

export type CalculationId =
  | "bust-quarter"
  | "waist-quarter"
  | "hip-quarter"
  | "neck-width"
  | "shoulder-drop"
  | "armhole"
  | "princess"
  | "sleeve"
  | "darts"
  | "ease"
  | "seam-allowance"
  | "fabric";

/** Breakdown cell — lengths stay in cm; UI formats via `formatFromCm`. */
export type CalculationBreakdownRow = {
  label: string;
  /** Length in centimetres (engine storage). */
  cm?: number;
  /** Non-numeric note (e.g. construction landmark). */
  text?: string;
};

export type CalculationResult = {
  id: CalculationId;
  label: string;
  /** May include `{{cm:…}}` / `{{rangeCm:…}}` tokens resolved at display time. */
  formula: string;
  /** Result length in centimetres. */
  value: number;
  explanation: string;
  breakdown: CalculationBreakdownRow[];
};

export type EngineCalculations = {
  results: CalculationResult[];
  map: Record<CalculationId, number>;
  /** Geometry-ready summary. */
  draft: {
    bustQuarter: number;
    waistQuarter: number;
    hipQuarter: number;
    neckWidth: number;
    neckDepthFront: number;
    shoulderDrop: number;
    shoulderLength: number;
    armholeDepth: number;
    princess: number;
    sleeveLength: number;
    dartIntake: number;
    dartLength: number;
    blouseLength: number;
    apexFromCenter: number;
    apexDepth: number;
    bustEase: number;
    waistEase: number;
    hipEase: number;
    seamAllowance: number;
  };
};

export function computeEngineCalculations(
  values: EngineFormValues,
): EngineCalculations {
  const bustWithEase = values.bust + values.bustEase;
  const waistWithEase = values.waist + values.waistEase;
  const hipWithEase = values.hip + values.hipEase;

  const bustQuarter = bustWithEase / 4;
  const waistQuarter = waistWithEase / 4;
  const hipQuarter = hipWithEase / 4;
  const neckWidth = values.neck / 6 + 0.5;
  const neckDepthFront = neckWidth + 1.5;
  const shoulderDrop = 2.5;
  const armholeDepth = values.bust / 4 - 1.5;
  const princess = values.apexDepth + values.shoulder / 2;
  const sleeve = values.sleeveLength;
  const dartIntake = Math.max(0.5, bustQuarter - waistQuarter);
  const dartLength = Math.max(8, values.apexDepth - 3);
  const easeTotal = values.bustEase; // primary ease called out in UI
  const seamAllowance = values.seamAllowance;

  const results: CalculationResult[] = [
    {
      id: "bust-quarter",
      label: "Bust ÷ 4",
      formula: "(Bust + Ease) ÷ 4",
      value: roundCm(bustQuarter),
      explanation:
        "Adds bust ease first, then quarters the result. That width is half of the front (or back) at the bust line on a two-piece draft.",
      breakdown: [
        { label: "Bust", cm: values.bust },
        { label: "Bust ease", cm: values.bustEase },
        { label: "Sum", cm: roundCm(bustWithEase) },
        { label: "÷ 4", cm: roundCm(bustQuarter) },
      ],
    },
    {
      id: "waist-quarter",
      label: "Waist ÷ 4",
      formula: "(Waist + Ease) ÷ 4",
      value: roundCm(waistQuarter),
      explanation:
        "Same quartering logic at the waist. Compared with Bust ÷ 4, it reveals how much fabric must be removed as darts.",
      breakdown: [
        { label: "Waist", cm: values.waist },
        { label: "Waist ease", cm: values.waistEase },
        { label: "Sum", cm: roundCm(waistWithEase) },
        { label: "÷ 4", cm: roundCm(waistQuarter) },
      ],
    },
    {
      id: "hip-quarter",
      label: "Hip ÷ 4",
      formula: "(Hip + Ease) ÷ 4",
      value: roundCm(hipQuarter),
      explanation:
        "Sets the lower block width so longer blouses and kurtis clear the seat. Critical whenever the hem falls at or below the hip.",
      breakdown: [
        { label: "Hip", cm: values.hip },
        { label: "Hip ease", cm: values.hipEase },
        { label: "Sum", cm: roundCm(hipWithEase) },
        { label: "÷ 4", cm: roundCm(hipQuarter) },
      ],
    },
    {
      id: "neck-width",
      label: "Neck Width",
      formula: "Neck ÷ 6 + 0.5",
      value: roundCm(neckWidth),
      explanation:
        "A classic neckline rule: one-sixth of the neck girth plus a small constant places the shoulder-neck point so the neckline neither chokes nor slides off.",
      breakdown: [
        { label: "Neck", cm: values.neck },
        { label: "÷ 6", cm: roundCm(values.neck / 6) },
        { label: "+ 0.5", cm: roundCm(neckWidth) },
        { label: "Front depth", cm: roundCm(neckDepthFront) },
      ],
    },
    {
      id: "shoulder-drop",
      label: "Shoulder Drop",
      formula: "{{cm:2.5}} (standard)",
      value: roundCm(shoulderDrop),
      explanation:
        "How far the outer shoulder sits below the neck point. {{cm:2.5}} is a balanced teaching default; square shoulders use less, sloping shoulders use more.",
      breakdown: [
        { label: "Standard drop", cm: 2.5 },
        { label: "Shoulder length", cm: values.shoulder },
      ],
    },
    {
      id: "armhole",
      label: "Armhole",
      formula: "Bust ÷ 4 − 1.5",
      value: roundCm(armholeDepth),
      explanation:
        "Armhole (scye) depth from the shoulder point to the underarm. Derived from bust so the opening scales with the figure; the sleeve cap must match this curve.",
      breakdown: [
        { label: "Bust ÷ 4", cm: roundCm(values.bust / 4) },
        { label: "− 1.5", cm: roundCm(armholeDepth) },
      ],
    },
    {
      id: "princess",
      label: "Princess",
      formula: "Apex depth + Shoulder ÷ 2",
      value: roundCm(princess),
      explanation:
        "Approximates the princess-seam path from mid-shoulder over the apex. Used when shaping with panels instead of (or alongside) waist darts.",
      breakdown: [
        { label: "Apex depth", cm: values.apexDepth },
        { label: "Shoulder ÷ 2", cm: roundCm(values.shoulder / 2) },
        { label: "Princess", cm: roundCm(princess) },
      ],
    },
    {
      id: "sleeve",
      label: "Sleeve",
      formula: "Sleeve length (body)",
      value: roundCm(sleeve),
      explanation:
        "Taken from the body chart and drawn from the outer shoulder along the sleeve grain. Ease for elbow bend is added in the sleeve draft, not here.",
      breakdown: [
        { label: "Measured length", cm: values.sleeveLength },
        { label: "Starts at", text: "Shoulder bone point" },
      ],
    },
    {
      id: "darts",
      label: "Darts",
      formula: "Bust¼ − Waist¼",
      value: roundCm(dartIntake),
      explanation:
        "The surplus between bust and waist quarters becomes dart intake. The dart tip stops short of the apex so the shaping melts into the bust curve.",
      breakdown: [
        { label: "Bust¼", cm: roundCm(bustQuarter) },
        { label: "Waist¼", cm: roundCm(waistQuarter) },
        { label: "Intake", cm: roundCm(dartIntake) },
        { label: "Dart length", cm: roundCm(dartLength) },
      ],
    },
    {
      id: "ease",
      label: "Ease",
      formula: "Chosen working ease",
      value: roundCm(easeTotal),
      explanation:
        "Working ease is room beyond the body so the garment can be worn and moved in. Bust ease is the primary figure shown; waist and hip ease are applied in their own quarters.",
      breakdown: [
        { label: "Bust ease", cm: values.bustEase },
        { label: "Waist ease", cm: values.waistEase },
        { label: "Hip ease", cm: values.hipEase },
      ],
    },
    {
      id: "seam-allowance",
      label: "Seam Allowance",
      formula: "Chosen SA",
      value: roundCm(seamAllowance),
      explanation:
        "Fabric beyond the stitch line. Construction lines on the board are net (finished) edges; add seam allowance when cutting the cloth.",
      breakdown: [
        { label: "Seam allowance", cm: values.seamAllowance },
        { label: "Applied at", text: "Cutting stage" },
      ],
    },
  ];

  const map = Object.fromEntries(
    results.map((result) => [result.id, result.value]),
  ) as Record<CalculationId, number>;

  return {
    results,
    map,
    draft: {
      bustQuarter: roundCm(bustQuarter),
      waistQuarter: roundCm(waistQuarter),
      hipQuarter: roundCm(hipQuarter),
      neckWidth: roundCm(neckWidth),
      neckDepthFront: roundCm(neckDepthFront),
      shoulderDrop: roundCm(shoulderDrop),
      shoulderLength: values.shoulder,
      armholeDepth: roundCm(armholeDepth),
      princess: roundCm(princess),
      sleeveLength: roundCm(sleeve),
      dartIntake: roundCm(dartIntake),
      dartLength: roundCm(dartLength),
      blouseLength: values.blouseLength,
      apexFromCenter: roundCm(values.apexDistance / 2),
      apexDepth: values.apexDepth,
      bustEase: values.bustEase,
      waistEase: values.waistEase,
      hipEase: values.hipEase,
      seamAllowance: values.seamAllowance,
    },
  };
}
