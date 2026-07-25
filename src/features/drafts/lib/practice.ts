import type { BodyMeasurements, DraftingInputs } from "@/features/drafts/data/formulas";
import {
  DEFAULT_DRAFTING_INPUTS,
  computeDraftingMeasurements,
  roundCm,
} from "@/features/drafts/data/formulas";

export type PracticeFieldId =
  | "bustQuarter"
  | "waistQuarter"
  | "neckWidth"
  | "shoulderDrop"
  | "armholeDepth"
  | "princess"
  | "dartIntake"
  | "bustEase"
  | "seamAllowance";

export type PracticeField = {
  id: PracticeFieldId;
  label: string;
  formula: string;
  /** Correct answer derived from body + inputs. */
  getAnswer: (body: BodyMeasurements, inputs: DraftingInputs) => number;
};

export const PRACTICE_FIELDS: PracticeField[] = [
  {
    id: "bustQuarter",
    label: "Bust ÷ 4",
    formula: "(Bust + Ease) ÷ 4",
    getAnswer: (body, inputs) => (body.bust + inputs.bustEase) / 4,
  },
  {
    id: "waistQuarter",
    label: "Waist ÷ 4",
    formula: "(Waist + Ease) ÷ 4",
    getAnswer: (body, inputs) => (body.waist + inputs.waistEase) / 4,
  },
  {
    id: "neckWidth",
    label: "Neck Width",
    formula: "Neck ÷ 6 + 0.5",
    getAnswer: (body) => body.neck / 6 + 0.5,
  },
  {
    id: "shoulderDrop",
    label: "Shoulder Drop",
    formula: "2.5 (standard)",
    getAnswer: () => 2.5,
  },
  {
    id: "armholeDepth",
    label: "Armhole",
    formula: "Bust ÷ 4 − 1.5",
    getAnswer: (body) => body.bust / 4 - 1.5,
  },
  {
    id: "princess",
    label: "Princess",
    formula: "Apex depth + Shoulder ÷ 2",
    getAnswer: (body) => body.apexDepth + body.shoulder / 2,
  },
  {
    id: "dartIntake",
    label: "Darts",
    formula: "Bust¼ − Waist¼",
    getAnswer: (body, inputs) =>
      (body.bust + inputs.bustEase) / 4 - (body.waist + inputs.waistEase) / 4,
  },
  {
    id: "bustEase",
    label: "Ease Allowance",
    formula: "Given working ease",
    getAnswer: (_body, inputs) => inputs.bustEase,
  },
  {
    id: "seamAllowance",
    label: "Seam Allowance",
    formula: "Given SA",
    getAnswer: (_body, inputs) => inputs.seamAllowance,
  },
];

function rand(min: number, max: number, step = 1): number {
  const steps = Math.round((max - min) / step);
  return roundCm(min + Math.floor(Math.random() * (steps + 1)) * step, 1);
}

export function generateRandomBody(): BodyMeasurements {
  const bust = rand(82, 100, 2);
  const waist = rand(Math.max(62, bust - 22), bust - 8, 2);
  return {
    bust,
    waist,
    neck: rand(34, 40, 1),
    shoulder: rand(12, 15, 0.5),
    blouseLength: rand(35, 42, 1),
    apexDistance: rand(16, 22, 1),
    apexDepth: rand(22, 27, 1),
  };
}

export function generateRandomInputs(): DraftingInputs {
  return {
    bustEase: rand(2, 5, 1),
    waistEase: rand(1, 3, 1),
    seamAllowance: rand(1, 1.5, 0.5),
  };
}

export type PracticeAnswers = Record<PracticeFieldId, number>;
export type PracticeGuesses = Partial<Record<PracticeFieldId, string>>;

export function getCorrectAnswers(
  body: BodyMeasurements,
  inputs: DraftingInputs = DEFAULT_DRAFTING_INPUTS,
): PracticeAnswers {
  const draft = computeDraftingMeasurements(body, inputs);
  return {
    bustQuarter: roundCm(draft.bustQuarter),
    waistQuarter: roundCm(draft.waistQuarter),
    neckWidth: roundCm(draft.neckWidth),
    shoulderDrop: roundCm(draft.shoulderDrop),
    armholeDepth: roundCm(draft.armholeDepth),
    princess: roundCm(draft.princess),
    dartIntake: roundCm(draft.dartIntake),
    bustEase: roundCm(draft.bustEase),
    seamAllowance: roundCm(draft.seamAllowance),
  };
}

/** Accept answers within 0.15 cm (rounding forgiveness). */
export function isAnswerCorrect(guess: string, correct: number): boolean {
  const parsed = Number.parseFloat(guess);
  if (Number.isNaN(parsed)) return false;
  return Math.abs(parsed - correct) <= 0.15;
}

export function scoreGuesses(
  guesses: PracticeGuesses,
  answers: PracticeAnswers,
): { correct: number; total: number; fieldResults: Record<PracticeFieldId, boolean> } {
  const fieldResults = {} as Record<PracticeFieldId, boolean>;
  let correct = 0;
  for (const field of PRACTICE_FIELDS) {
    const ok = isAnswerCorrect(guesses[field.id] ?? "", answers[field.id]);
    fieldResults[field.id] = ok;
    if (ok) correct += 1;
  }
  return { correct, total: PRACTICE_FIELDS.length, fieldResults };
}
