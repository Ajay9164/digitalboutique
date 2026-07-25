/**
 * Neckline pattern library — SVG paths in a shared 200×200 viewBox.
 * Paths are drawn as cut lines (stroke) so they overlay cleanly on fabric.
 */

export type PatternId =
  | "boat-neck"
  | "princess"
  | "sweetheart"
  | "round"
  | "square"
  | "deep-v"
  | "high-neck"
  | "stand-collar"
  | "chinese-collar"
  | "leaf-neck"
  | "pot-neck";

export type PatternDefinition = {
  id: PatternId;
  label: string;
  description: string;
  /** Primary cut-line path(s). */
  paths: string[];
  /** Optional construction / grain helpers. */
  guides?: string[];
  /** Soft fill under the neckline opening (for preview). */
  fill?: string;
};

export const PATTERN_VIEWBOX = { width: 200, height: 200 };

export const PATTERNS: PatternDefinition[] = [
  {
    id: "boat-neck",
    label: "Boat Neck",
    description: "Wide, shallow curve that sits on the collarbones.",
    fill: "M 28 52 L 172 52 Q 100 68 28 52 Z",
    paths: ["M 28 52 Q 100 68 172 52"],
    guides: ["M 100 40 L 100 160", "M 40 100 L 160 100"],
  },
  {
    id: "princess",
    label: "Princess",
    description: "Shaped panels from shoulder over the apex — no waist dart.",
    paths: [
      "M 100 36 L 100 168",
      "M 72 40 Q 78 96 70 150",
      "M 128 40 Q 122 96 130 150",
      "M 56 48 Q 100 58 144 48",
    ],
    guides: ["M 85 100 A 4 4 0 1 1 85.1 100", "M 115 100 A 4 4 0 1 1 115.1 100"],
  },
  {
    id: "sweetheart",
    label: "Sweetheart",
    description: "Two soft lobes meeting at center front — romantic and fitted.",
    fill: "M 40 48 Q 70 42 100 78 Q 130 42 160 48 Q 150 110 100 128 Q 50 110 40 48 Z",
    paths: [
      "M 40 48 Q 70 42 100 78",
      "M 100 78 Q 130 42 160 48",
      "M 40 48 Q 50 110 100 128 Q 150 110 160 48",
    ],
  },
  {
    id: "round",
    label: "Round",
    description: "Classic circular neckline — balanced and easy to finish.",
    fill: "M 100 40 A 42 42 0 1 1 99.9 40 Z",
    paths: ["M 100 40 A 42 42 0 1 1 99.9 40"],
    guides: ["M 100 40 L 100 124"],
  },
  {
    id: "square",
    label: "Square",
    description: "Straight sides and base — graphic and structured.",
    fill: "M 58 44 L 142 44 L 142 108 L 58 108 Z",
    paths: ["M 58 44 L 142 44 L 142 108 L 58 108 Z"],
  },
  {
    id: "deep-v",
    label: "Deep V",
    description: "Long V from the shoulders to a deep center-front point.",
    fill: "M 48 40 L 152 40 L 100 148 Z",
    paths: ["M 48 40 L 100 148 L 152 40"],
    guides: ["M 100 40 L 100 148"],
  },
  {
    id: "high-neck",
    label: "High Neck",
    description: "Sits close to the base of the neck — modest and clean.",
    fill: "M 78 36 Q 100 28 122 36 Q 128 70 100 78 Q 72 70 78 36 Z",
    paths: [
      "M 78 36 Q 100 28 122 36",
      "M 78 36 Q 72 70 100 78 Q 128 70 122 36",
    ],
  },
  {
    id: "stand-collar",
    label: "Stand Collar",
    description: "Vertical band standing up from the neckline seam.",
    paths: [
      "M 70 70 Q 100 62 130 70",
      "M 70 70 L 66 48 Q 100 36 134 48 L 130 70",
      "M 66 48 Q 100 40 134 48",
    ],
    guides: ["M 100 36 L 100 90"],
  },
  {
    id: "chinese-collar",
    label: "Chinese Collar",
    description: "Mandarin stand with a slight center gap — refined and upright.",
    paths: [
      "M 74 72 Q 100 64 126 72",
      "M 74 72 L 70 46 Q 96 34 100 42",
      "M 126 72 L 130 46 Q 104 34 100 42",
      "M 70 46 Q 96 38 100 42 Q 104 38 130 46",
    ],
  },
  {
    id: "leaf-neck",
    label: "Leaf Neck",
    description: "Asymmetric leaf-shaped cut — decorative and sculptural.",
    fill: "M 56 56 Q 90 30 120 52 Q 150 70 140 110 Q 100 150 70 120 Q 48 96 56 56 Z",
    paths: [
      "M 56 56 Q 90 30 120 52 Q 150 70 140 110 Q 100 150 70 120 Q 48 96 56 56",
      "M 88 70 Q 110 90 118 120",
    ],
  },
  {
    id: "pot-neck",
    label: "Pot Neck",
    description: "Wide U that dips like a pot — popular for blouses and kurtis.",
    fill: "M 46 48 L 154 48 Q 150 120 100 138 Q 50 120 46 48 Z",
    paths: ["M 46 48 L 154 48 Q 150 120 100 138 Q 50 120 46 48"],
    guides: ["M 100 48 L 100 138"],
  },
];

export const PATTERN_MAP = Object.fromEntries(
  PATTERNS.map((pattern) => [pattern.id, pattern]),
) as Record<PatternId, PatternDefinition>;
