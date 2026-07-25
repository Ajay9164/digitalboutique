export type ConstructionStepId =
  | "center-line"
  | "bust-line"
  | "waist-line"
  | "neck"
  | "shoulder"
  | "armhole"
  | "side-seam"
  | "darts"
  | "hem";

export type ConstructionStep = {
  id: ConstructionStepId;
  order: number;
  label: string;
  /** Short chip label for the step rail. */
  shortLabel: string;
  whyItExists: string;
  howItIsDrawn: string[];
  formulaHint: string;
  /** Which drafting values light up on this step. */
  relatedFormulas: string[];
};

export const CONSTRUCTION_STEPS: ConstructionStep[] = [
  {
    id: "center-line",
    order: 0,
    label: "Center Line",
    shortLabel: "Center",
    whyItExists:
      "The center front is the spine of the draft. Every horizontal measurement is measured outward from this line, so the left and right halves stay true.",
    howItIsDrawn: [
      "Draw a vertical line the full blouse length.",
      "Mark the top as the neck/shoulder origin.",
      "All later lines refer back to this axis.",
    ],
    formulaHint: "Length = Blouse Length",
    relatedFormulas: ["seam-allowance"],
  },
  {
    id: "bust-line",
    order: 1,
    label: "Bust Line",
    shortLabel: "Bust",
    whyItExists:
      "This is the fullest width of the bodice. It anchors apex placement, dart tips, and the armhole underarm point.",
    howItIsDrawn: [
      "Measure down from the neck origin to apex depth.",
      "Draw a horizontal line equal to Bust ÷ 4 (with ease).",
      "Mark the apex on this line at Apex Distance ÷ 2 from center.",
    ],
    formulaHint: "Width = (Bust + Ease) ÷ 4",
    relatedFormulas: ["bust-quarter", "ease-allowance"],
  },
  {
    id: "waist-line",
    order: 2,
    label: "Waist Line",
    shortLabel: "Waist",
    whyItExists:
      "The waist line is where the block must cinch. Comparing it to the bust line reveals how much dart intake you need.",
    howItIsDrawn: [
      "Measure down from the neck origin to the waist level (blouse length for a short blouse, or a marked waist).",
      "Draw a horizontal line equal to Waist ÷ 4 (with ease).",
      "The gap between bust and waist quarters becomes darting.",
    ],
    formulaHint: "Width = (Waist + Ease) ÷ 4",
    relatedFormulas: ["waist-quarter", "darts"],
  },
  {
    id: "neck",
    order: 3,
    label: "Neck",
    shortLabel: "Neck",
    whyItExists:
      "The neckline is a style and comfort line. Its width and depth decide whether the garment sits cleanly on the collarbone or gapes.",
    howItIsDrawn: [
      "From the top of the center line, measure Neck Width outward.",
      "Drop Neck Depth Front along the center line.",
      "Connect with a smooth curve from shoulder-neck to center-front depth.",
    ],
    formulaHint: "Width = Neck ÷ 6 + 0.5",
    relatedFormulas: ["neck-width"],
  },
  {
    id: "shoulder",
    order: 4,
    label: "Shoulder",
    shortLabel: "Shoulder",
    whyItExists:
      "The shoulder seam carries the sleeve. Its length and drop place the armhole at the correct bone point.",
    howItIsDrawn: [
      "From the neck-width point, measure Shoulder Length outward and down by Shoulder Drop.",
      "Connect the neck point to the outer shoulder point with a straight line.",
      "This outer point becomes the top of the armhole.",
    ],
    formulaHint: "Drop = 2.5 cm · Length = Shoulder",
    relatedFormulas: ["shoulder-drop"],
  },
  {
    id: "armhole",
    order: 5,
    label: "Armhole",
    shortLabel: "Armhole",
    whyItExists:
      "The armhole (scye) is the opening the sleeve must fit. Its depth and curve control mobility and underarm comfort.",
    howItIsDrawn: [
      "Drop Armhole Depth from the shoulder point to meet the bust line extension.",
      "Shape a curve from the outer shoulder, through the front pitch, into the underarm.",
      "Keep the curve deeper toward the underarm than at the shoulder.",
    ],
    formulaHint: "Depth = Bust ÷ 4 − 1.5",
    relatedFormulas: ["armhole"],
  },
  {
    id: "side-seam",
    order: 6,
    label: "Side Seam",
    shortLabel: "Side",
    whyItExists:
      "The side seam joins front to back and follows the body’s taper from underarm to waist (and hem).",
    howItIsDrawn: [
      "From the underarm point, draw down to the waist width mark.",
      "Continue to the hem width if the blouse extends past the waist.",
      "Keep the line smooth — sudden angles show as puckers when sewn.",
    ],
    formulaHint: "Connects armhole → waist¼ → hem",
    relatedFormulas: ["bust-quarter", "waist-quarter"],
  },
  {
    id: "darts",
    order: 7,
    label: "Darts",
    shortLabel: "Darts",
    whyItExists:
      "Darts remove the surplus between bust and waist so a flat paper block becomes a 3D shape over the apex.",
    howItIsDrawn: [
      "Compute dart intake = Bust¼ − Waist¼.",
      "Place the dart tip short of the apex (about 2.5–3 cm).",
      "Open the intake on the waist or side and draw both dart legs to the tip.",
    ],
    formulaHint: "Intake = Bust¼ − Waist¼",
    relatedFormulas: ["darts", "princess"],
  },
  {
    id: "hem",
    order: 8,
    label: "Hem",
    shortLabel: "Hem",
    whyItExists:
      "The hem closes the draft. Its width and level decide how the blouse sits over the saree or skirt waistband.",
    howItIsDrawn: [
      "At blouse length from the neck origin, draw the hem across to the side seam.",
      "Match the hem width to the waist quarter for a fitted hem, or ease slightly for flare.",
      "True the corner where hem meets side seam.",
    ],
    formulaHint: "Level = Blouse Length · Width ≈ Waist¼",
    relatedFormulas: ["waist-quarter", "seam-allowance"],
  },
];

export const CONSTRUCTION_STEP_MAP = Object.fromEntries(
  CONSTRUCTION_STEPS.map((step) => [step.id, step]),
) as Record<ConstructionStepId, ConstructionStep>;
