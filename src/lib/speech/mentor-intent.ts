import { roundCm } from "@/features/drafts/data/formulas";

export type TailoringQueryKind =
  | "armhole"
  | "chest-line"
  | "waist-dart"
  | "tip";

export type TailoringQueryResult = {
  kind: TailoringQueryKind;
  number?: number;
  title: string;
  formula: string;
  spoken: string;
  display: string;
};

/** @deprecated Prefer TailoringQueryResult — kept for store typing aliases. */
export type MentorAnswer = TailoringQueryResult & {
  intent: {
    kind: TailoringQueryKind;
    bust?: number;
    waist?: number;
    unit: "in";
  };
};

const TAILORING_TIPS = [
  "I am ready to calculate. Tell me your bust or waist measurement.",
  "Remember to always wash cotton fabric before drafting to account for shrinkage. What measurement do you need?",
  "Ask me for armhole depth, chest line, or waist dart allowance — for example, armhole for a 36 bust.",
  "Add seam allowance when you cut, not when you draft the net block. Which formula should we run?",
  "Silk needs a little extra seam allowance for slip. Tell me a bust or waist number to calculate.",
  "I can compute armhole, chest line with ease, or waist dart allowance. What is your measurement?",
] as const;

function pickTip(): string {
  const index = Math.floor(Math.random() * TAILORING_TIPS.length);
  return TAILORING_TIPS[index] ?? TAILORING_TIPS[0];
}

function firstNumber(digits: string[] | null): number | undefined {
  if (!digits?.length) return undefined;
  const value = Number.parseFloat(digits[0]!);
  return Number.isFinite(value) ? value : undefined;
}

function formatInches(value: number): string {
  const rounded = roundCm(value, 2);
  // Drop trailing .0 for cleaner speech ("7.5" stays, "10.00" → unlikely)
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded);
  return `${text} inches`;
}

function tipResult(spoken: string): TailoringQueryResult {
  return {
    kind: "tip",
    title: "Atelier tip",
    formula: "Helpful tip",
    spoken,
    display: spoken,
  };
}

/**
 * Regex-driven offline voice engine for drafting formulas.
 * Never replies with "I didn't understand" — falls back to a helpful tip.
 */
export function parseTailoringQuery(raw: string): TailoringQueryResult {
  const transcript = raw.trim().toLowerCase();
  const numbers = transcript.match(/\d+/g);
  const n = firstNumber(numbers);

  const hasArmhole = /\barm\s*-?\s*hole\b|\bscye\b/.test(transcript);
  const hasChestOrBust = /\bchest\b|\bbust\b/.test(transcript);
  const hasWaist = /\bwaist\b/.test(transcript);

  // 1) Armhole depth — Bust ÷ 4 − 1.5
  if (hasArmhole && n !== undefined) {
    const depth = n / 4 - 1.5;
    const spoken = `For a ${n} bust, the standard armhole depth is ${formatInches(depth)}.`;
    return {
      kind: "armhole",
      number: n,
      title: "Armhole depth",
      formula: "Bust ÷ 4 − 1.5",
      spoken,
      display: spoken,
    };
  }

  if (hasArmhole && n === undefined) {
    return tipResult(
      "Armhole depth is bust divided by 4, minus 1.5. Tell me the bust measurement — for example, armhole for a 36 bust.",
    );
  }

  // 2) Chest / bust line with ease — Bust ÷ 4 + 1.5
  if (hasChestOrBust && n !== undefined && !hasWaist) {
    const chestLine = n / 4 + 1.5;
    const spoken = `For a ${n} bust, mark your chest line at ${formatInches(chestLine)} to include ease allowance.`;
    return {
      kind: "chest-line",
      number: n,
      title: "Chest line",
      formula: "Bust ÷ 4 + 1.5",
      spoken,
      display: spoken,
    };
  }

  if (hasChestOrBust && n === undefined) {
    return tipResult(
      "I can mark the chest line with ease. Tell me your bust measurement — for example, chest line for a 36 bust.",
    );
  }

  // 3) Waist dart allowance — Waist ÷ 4 + 1
  if (hasWaist && n !== undefined) {
    const dartAllowance = n / 4 + 1;
    const spoken = `For a ${n} waist, the dart allowance is ${formatInches(dartAllowance)}.`;
    return {
      kind: "waist-dart",
      number: n,
      title: "Waist dart allowance",
      formula: "Waist ÷ 4 + 1",
      spoken,
      display: spoken,
    };
  }

  if (hasWaist && n === undefined) {
    return tipResult(
      "Waist dart allowance is waist divided by 4, plus 1. Tell me the waist measurement to calculate it.",
    );
  }

  // Smart fallback — never "I didn't understand"
  return tipResult(pickTip());
}

/** @deprecated Use parseTailoringQuery */
export function parseMentorIntent(raw: string) {
  const result = parseTailoringQuery(raw);
  return {
    kind: result.kind,
    bust: result.kind === "waist-dart" ? undefined : result.number,
    waist: result.kind === "waist-dart" ? result.number : undefined,
    unit: "in" as const,
  };
}

/** @deprecated Use parseTailoringQuery */
export function answerMentorIntent(intent: {
  kind: string;
  bust?: number;
  waist?: number;
  unit?: "cm" | "in";
}): MentorAnswer {
  // Reconstruct a spoken query so the regex engine stays the single source of truth.
  if (intent.kind === "armhole" && intent.bust != null) {
    return toMentorAnswer(parseTailoringQuery(`armhole ${intent.bust}`));
  }
  if (
    (intent.kind === "bust-quarter" ||
      intent.kind === "chest-line" ||
      intent.kind === "chest") &&
    intent.bust != null
  ) {
    return toMentorAnswer(parseTailoringQuery(`bust ${intent.bust}`));
  }
  if (
    (intent.kind === "waist-quarter" || intent.kind === "waist-dart") &&
    (intent.waist ?? intent.bust) != null
  ) {
    return toMentorAnswer(
      parseTailoringQuery(`waist ${intent.waist ?? intent.bust}`),
    );
  }
  return toMentorAnswer(parseTailoringQuery(""));
}

function toMentorAnswer(result: TailoringQueryResult): MentorAnswer {
  return {
    ...result,
    intent: {
      kind: result.kind,
      bust: result.kind === "waist-dart" ? undefined : result.number,
      waist: result.kind === "waist-dart" ? result.number : undefined,
      unit: "in",
    },
  };
}

export { toMentorAnswer };
