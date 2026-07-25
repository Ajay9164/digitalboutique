import { describe, expect, it } from "vitest";
import {
  normalizeLearningProgress,
  projectToInput,
  safeDate,
} from "@/features/journal/lib/project";
import type { JournalProject } from "@/lib/db";

describe("journal data safety", () => {
  it("normalizes missing learning progress", () => {
    expect(normalizeLearningProgress(undefined)).toEqual({
      measurementsLearned: [],
      constructionSteps: [],
      practiceCompletions: 0,
      percentComplete: 0,
      notes: "",
    });
  });

  it("projectToInput tolerates incomplete learningProgress", () => {
    const project = {
      id: "1",
      name: "Test",
      date: "2026-01-01",
      fabricPhoto: null,
      draftImage: null,
      measurements: {},
      patternType: "unspecified",
      alterationNotes: "",
      observations: "",
      learningProgress: undefined,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    } as unknown as JournalProject;

    const input = projectToInput(project);
    expect(input.learningProgress.measurementsLearned).toEqual([]);
    expect(input.name).toBe("Test");
    expect(Number.isNaN(input.date.getTime())).toBe(false);
  });

  it("safeDate replaces invalid values", () => {
    expect(Number.isNaN(safeDate("not-a-date").getTime())).toBe(false);
  });
});
