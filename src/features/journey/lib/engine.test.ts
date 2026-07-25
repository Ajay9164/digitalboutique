import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  ALL_JOURNEY_LESSONS,
  FIRST_LESSON_ID,
} from "@/features/journey/data/curriculum";
import {
  completeLesson,
  formatEta,
  getOrCreateJourneyProgress,
  loadJourneyDashboard,
  setFreeExplore,
} from "@/features/journey/lib/engine";

describe("guided journey engine", () => {
  beforeEach(async () => {
    await db.journeyLessons.clear();
    await db.journeyProgress.clear();
    await db.learningActivity.clear();
  });

  it("seeds progress on first load", async () => {
    const progress = await getOrCreateJourneyProgress();
    expect(progress.id).toBe("journey");
    expect(progress.currentLessonId).toBe(FIRST_LESSON_ID);
    expect(progress.mode).toBe("beginner");
  });

  it("locks later lessons until earlier ones complete", async () => {
    const dashboard = await loadJourneyDashboard();
    const flat = dashboard.stages.flatMap((s) => s.lessons);
    expect(flat[0]?.locked).toBe(false);
    expect(flat[1]?.locked).toBe(true);
  });

  it("unlocks the next lesson after completion", async () => {
    await completeLesson(FIRST_LESSON_ID);
    const dashboard = await loadJourneyDashboard();
    const second = ALL_JOURNEY_LESSONS[1];
    const state = dashboard.stages
      .flatMap((s) => s.lessons)
      .find((l) => l.id === second?.id);
    expect(state?.locked).toBe(false);
    expect(dashboard.completedCount).toBe(1);
    expect(dashboard.percent).toBeGreaterThan(0);
  });

  it("free explore unlocks all lessons", async () => {
    await setFreeExplore(true);
    const dashboard = await loadJourneyDashboard();
    expect(dashboard.stages.every((s) => !s.locked)).toBe(true);
    expect(
      dashboard.stages.flatMap((s) => s.lessons).every((l) => !l.locked),
    ).toBe(true);
  });

  it("formats ETA", () => {
    expect(formatEta(45)).toBe("45 min");
    expect(formatEta(60)).toBe("1 hr");
    expect(formatEta(90)).toBe("1 hr 30 min");
  });
});
