import type { LucideIcon } from "lucide-react";

export type AchievementId =
  | "first-stitch"
  | "measure-five"
  | "measure-master"
  | "first-line"
  | "block-complete"
  | "first-practice"
  | "perfect-draft"
  | "streak-3"
  | "streak-7"
  | "streak-30"
  | "atelier-archive"
  | "full-circle";

export type AchievementDef = {
  id: AchievementId;
  title: string;
  description: string;
  xp: number;
  /** Icon name key resolved in UI. */
  icon: "sparkles" | "ruler" | "crown" | "pen" | "check" | "target" | "star" | "flame" | "book" | "compass";
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-stitch",
    title: "First Stitch",
    description: "Mark your first measurement as learned.",
    xp: 25,
    icon: "sparkles",
  },
  {
    id: "measure-five",
    title: "Sure Hand",
    description: "Learn 5 body measurements.",
    xp: 50,
    icon: "ruler",
  },
  {
    id: "measure-master",
    title: "Measure Master",
    description: "Complete every measurement lesson.",
    xp: 150,
    icon: "crown",
  },
  {
    id: "first-line",
    title: "First Line",
    description: "Draw your first construction step.",
    xp: 25,
    icon: "pen",
  },
  {
    id: "block-complete",
    title: "Block Complete",
    description: "Finish all nine construction steps.",
    xp: 150,
    icon: "check",
  },
  {
    id: "first-practice",
    title: "On the Table",
    description: "Complete a practice draft attempt.",
    xp: 40,
    icon: "target",
  },
  {
    id: "perfect-draft",
    title: "Perfect Draft",
    description: "Score 100% on a practice round.",
    xp: 100,
    icon: "star",
  },
  {
    id: "streak-3",
    title: "Warm Iron",
    description: "Keep a 3-day learning streak.",
    xp: 40,
    icon: "flame",
  },
  {
    id: "streak-7",
    title: "Week on the Form",
    description: "Keep a 7-day learning streak.",
    xp: 80,
    icon: "flame",
  },
  {
    id: "streak-30",
    title: "Atelier Discipline",
    description: "Keep a 30-day learning streak.",
    xp: 250,
    icon: "flame",
  },
  {
    id: "atelier-archive",
    title: "Atelier Archive",
    description: "Save your first journal project.",
    xp: 40,
    icon: "book",
  },
  {
    id: "full-circle",
    title: "Full Circle",
    description: "Reach 100% overall learning progress.",
    xp: 300,
    icon: "compass",
  },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ACHIEVEMENTS.map((item) => [item.id, item]),
) as Record<AchievementId, AchievementDef>;

export const MILESTONE_THRESHOLDS = [
  { id: "pct-25", percent: 25, title: "Quarter way", detail: "You are 25% through the curriculum." },
  { id: "pct-50", percent: 50, title: "Halfway mark", detail: "Half the craft is under your hands." },
  { id: "pct-75", percent: 75, title: "Nearly tailored", detail: "Three quarters complete — keep going." },
  { id: "pct-100", percent: 100, title: "Curriculum complete", detail: "Every core lesson is finished." },
] as const;

export const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Tailor",
    body: "Your offline atelier for measurements, drafting, studio patterns, and a private journal.",
  },
  {
    id: "measure",
    title: "Learn on the form",
    body: "Tap body regions on the 3D mannequin to study each measurement with professional guidance.",
  },
  {
    id: "draft",
    title: "Turn numbers into lines",
    body: "Draft Learning shows how Bust ÷ 4 becomes a construction line — then practice until it sticks.",
  },
  {
    id: "create",
    title: "Capture and keep",
    body: "Studio freezes fabric photos; Journal stores every project locally with backup export.",
  },
] as const;

/** Totals used for overall percentage. */
export const CURRICULUM = {
  measurements: 23,
  constructionSteps: 9,
} as const;

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

export function createLearningId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Suppress unused LucideIcon import warning if tree-shaken oddly — keep type available. */
export type AchievementIconComponent = LucideIcon;
