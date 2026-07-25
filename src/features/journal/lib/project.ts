import type { PatternId } from "@/features/studio/data/patterns";
import { PATTERNS } from "@/features/studio/data/patterns";
import type {
  JournalProject,
  ProjectLearningProgress,
  ProjectMeasurements,
} from "@/lib/db";

export type PatternTypeOption = PatternId | "custom" | "unspecified";

export const PATTERN_TYPE_OPTIONS: Array<{
  value: PatternTypeOption;
  label: string;
}> = [
  { value: "unspecified", label: "Unspecified" },
  ...PATTERNS.map((pattern) => ({
    value: pattern.id as PatternTypeOption,
    label: pattern.label,
  })),
  { value: "custom", label: "Custom" },
];

export function patternTypeLabel(value: PatternTypeOption): string {
  return (
    PATTERN_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export const EMPTY_MEASUREMENTS: ProjectMeasurements = {
  bust: undefined,
  waist: undefined,
  hip: undefined,
  neck: undefined,
  shoulder: undefined,
  sleeveLength: undefined,
  blouseLength: undefined,
  apexDistance: undefined,
  apexDepth: undefined,
  notes: "",
};

export const EMPTY_LEARNING: ProjectLearningProgress = {
  measurementsLearned: [],
  constructionSteps: [],
  practiceCompletions: 0,
  percentComplete: 0,
  notes: "",
};

export type ProjectInput = {
  name: string;
  date: Date;
  fabricPhoto: string | null;
  measurements: ProjectMeasurements;
  draftImage: string | null;
  patternType: PatternTypeOption;
  alterationNotes: string;
  observations: string;
  learningProgress: ProjectLearningProgress;
};

export function normalizeLearningProgress(
  raw?: Partial<ProjectLearningProgress> | null,
): ProjectLearningProgress {
  return {
    measurementsLearned: [...(raw?.measurementsLearned ?? [])],
    constructionSteps: [...(raw?.constructionSteps ?? [])],
    practiceCompletions: Number.isFinite(raw?.practiceCompletions)
      ? Number(raw?.practiceCompletions)
      : 0,
    percentComplete: Math.min(
      100,
      Math.max(0, Number(raw?.percentComplete) || 0),
    ),
    notes: raw?.notes ?? "",
  };
}

export function safeDate(value: Date | string | number | null | undefined): Date {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function createEmptyProjectInput(): ProjectInput {
  return {
    name: "",
    date: new Date(),
    fabricPhoto: null,
    measurements: { ...EMPTY_MEASUREMENTS },
    draftImage: null,
    patternType: "unspecified",
    alterationNotes: "",
    observations: "",
    learningProgress: normalizeLearningProgress(),
  };
}

export function projectToInput(project: JournalProject): ProjectInput {
  const learning = normalizeLearningProgress(project.learningProgress);
  return {
    name: project.name ?? "",
    date: safeDate(project.date),
    fabricPhoto: project.fabricPhoto ?? null,
    measurements: { ...EMPTY_MEASUREMENTS, ...(project.measurements ?? {}) },
    draftImage: project.draftImage ?? null,
    patternType: project.patternType ?? "unspecified",
    alterationNotes: project.alterationNotes ?? "",
    observations: project.observations ?? "",
    learningProgress: learning,
  };
}

export type JournalSort =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "name-desc"
  | "updated-desc";

export type JournalFilter = {
  query: string;
  patternType: PatternTypeOption | "all";
  hasFabric: "all" | "yes" | "no";
  hasDraft: "all" | "yes" | "no";
};

export const DEFAULT_FILTER: JournalFilter = {
  query: "",
  patternType: "all",
  hasFabric: "all",
  hasDraft: "all",
};

export function filterAndSortProjects(
  projects: JournalProject[],
  filter: JournalFilter,
  sort: JournalSort,
): JournalProject[] {
  const query = filter.query.trim().toLowerCase();

  let result = projects.filter((project) => {
    if (filter.patternType !== "all" && project.patternType !== filter.patternType) {
      return false;
    }
    if (filter.hasFabric === "yes" && !project.fabricPhoto) return false;
    if (filter.hasFabric === "no" && project.fabricPhoto) return false;
    if (filter.hasDraft === "yes" && !project.draftImage) return false;
    if (filter.hasDraft === "no" && project.draftImage) return false;

    if (!query) return true;

    const haystack = [
      project.name,
      project.alterationNotes,
      project.observations,
      project.learningProgress?.notes ?? "",
      project.measurements?.notes ?? "",
      patternTypeLabel(project.patternType),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  result = [...result].sort((a, b) => {
    switch (sort) {
      case "date-asc":
        return safeDate(a.date).getTime() - safeDate(b.date).getTime();
      case "name-asc":
        return (a.name ?? "").localeCompare(b.name ?? "");
      case "name-desc":
        return (b.name ?? "").localeCompare(a.name ?? "");
      case "updated-desc":
        return safeDate(b.updatedAt).getTime() - safeDate(a.updatedAt).getTime();
      case "date-desc":
      default:
        return safeDate(b.date).getTime() - safeDate(a.date).getTime();
    }
  });

  return result;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatProjectDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}
