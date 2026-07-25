import {
  db,
  JOURNEY_PROGRESS_ID,
  type JourneyLessonRecord,
  type JourneyMode,
  type JourneyProgressRecord,
} from "@/lib/db";
import { recordActivity } from "@/features/learning/lib/ecosystem";
import {
  ALL_JOURNEY_LESSONS,
  FIRST_LESSON_ID,
  JOURNEY_LESSON_MAP,
  JOURNEY_STAGES,
  JOURNEY_STAGE_MAP,
  remainingEtaMinutes,
  type JourneyLesson,
  type JourneyStage,
  type JourneyStageId,
} from "@/features/journey/data/curriculum";

export type JourneyLessonState = JourneyLesson & {
  record: JourneyLessonRecord | null;
  locked: boolean;
  complete: boolean;
};

export type JourneyStageState = Omit<JourneyStage, "lessons"> & {
  lessons: JourneyLessonState[];
  completeCount: number;
  percent: number;
  locked: boolean;
  complete: boolean;
};

export type JourneyDashboard = {
  progress: JourneyProgressRecord;
  stages: JourneyStageState[];
  currentLesson: JourneyLessonState | null;
  nextLesson: JourneyLessonState | null;
  resumeLesson: JourneyLessonState | null;
  completedLessons: JourneyLessonState[];
  percent: number;
  etaMinutesRemaining: number;
  etaMinutesTotal: number;
  practiceBestScore: number | null;
  practiceAttempts: number;
  completedCount: number;
  totalCount: number;
};

function defaultProgress(): JourneyProgressRecord {
  const now = new Date();
  return {
    id: JOURNEY_PROGRESS_ID,
    mode: "beginner",
    currentLessonId: FIRST_LESSON_ID,
    lastVisitedLessonId: null,
    freeExplore: false,
    narrationEnabled: false,
    startedAt: now,
    updatedAt: now,
  };
}

export async function getOrCreateJourneyProgress(): Promise<JourneyProgressRecord> {
  const existing = await db.journeyProgress.get(JOURNEY_PROGRESS_ID);
  if (existing) return existing;
  const progress = defaultProgress();
  await db.journeyProgress.put(progress);
  return progress;
}

function isLessonComplete(record: JourneyLessonRecord | null | undefined): boolean {
  return record?.status === "complete";
}

function buildStates(
  progress: JourneyProgressRecord,
  records: JourneyLessonRecord[],
): JourneyStageState[] {
  const byId = new Map(records.map((row) => [row.id, row]));

  let previousStagesComplete = true;

  return JOURNEY_STAGES.map((stage) => {
    const lockedStage = progress.freeExplore ? false : !previousStagesComplete;

    let previousInStageComplete = true;
    const lessons: JourneyLessonState[] = stage.lessons.map((lesson) => {
      const record = byId.get(lesson.id) ?? null;
      const complete = isLessonComplete(record);
      const locked = progress.freeExplore
        ? false
        : lockedStage || !previousInStageComplete;

      if (!complete) previousInStageComplete = false;

      return {
        ...lesson,
        record,
        locked,
        complete,
      };
    });

    previousStagesComplete = lessons.every((l) => l.complete);

    const completeCount = lessons.filter((l) => l.complete).length;
    return {
      ...stage,
      lessons,
      completeCount,
      percent:
        lessons.length === 0
          ? 0
          : Math.round((completeCount / lessons.length) * 100),
      locked: lockedStage,
      complete: completeCount === lessons.length && lessons.length > 0,
    };
  });
}

export async function loadJourneyDashboard(): Promise<JourneyDashboard> {
  const progress = await getOrCreateJourneyProgress();
  const records = await db.journeyLessons.toArray();
  const stages = buildStates(progress, records);
  const flat = stages.flatMap((s) => s.lessons);
  const completedLessons = flat.filter((l) => l.complete);
  const completedIds = new Set(completedLessons.map((l) => l.id));

  const current =
    flat.find((l) => l.id === progress.currentLessonId) ??
    flat.find((l) => !l.complete && !l.locked) ??
    null;

  const next =
    flat.find((l) => !l.complete && !l.locked && l.id !== current?.id) ??
    flat.find((l) => !l.complete && !l.locked) ??
    null;

  const resume =
    (progress.lastVisitedLessonId
      ? flat.find((l) => l.id === progress.lastVisitedLessonId)
      : null) ?? current;

  const practiceRecords = records.filter(
    (r) => r.bestScore != null || r.score != null,
  );
  const practiceBestScore =
    practiceRecords.length === 0
      ? null
      : Math.max(
          ...practiceRecords.map((r) => r.bestScore ?? r.score ?? 0),
        );
  const practiceAttempts = practiceRecords.reduce(
    (sum, r) => sum + (r.attempts || 0),
    0,
  );

  const totalCount = ALL_JOURNEY_LESSONS.length;
  const completedCount = completedLessons.length;

  return {
    progress,
    stages,
    currentLesson: current,
    nextLesson: next ?? current,
    resumeLesson: resume,
    completedLessons,
    percent:
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    etaMinutesRemaining: remainingEtaMinutes(completedIds),
    etaMinutesTotal: JOURNEY_STAGES.reduce((s, st) => s + st.etaMinutes, 0),
    practiceBestScore,
    practiceAttempts,
    completedCount,
    totalCount,
  };
}

async function upsertLessonStart(lessonId: string): Promise<JourneyLessonRecord> {
  const lesson = JOURNEY_LESSON_MAP[lessonId];
  if (!lesson) throw new Error(`Unknown lesson: ${lessonId}`);
  const existing = await db.journeyLessons.get(lessonId);
  const now = new Date();
  if (existing) {
    return existing;
  }
  const row: JourneyLessonRecord = {
    id: lessonId,
    stageId: lesson.stageId,
    status: "in-progress",
    completedSections: [],
    score: null,
    total: null,
    bestScore: null,
    attempts: 0,
    startedAt: now,
    completedAt: null,
    updatedAt: now,
  };
  await db.journeyLessons.put(row);
  return row;
}

/** @returns true when progress or lesson rows changed (caller should refresh). */
export async function visitLesson(lessonId: string): Promise<boolean> {
  const progress = await getOrCreateJourneyProgress();
  const alreadyCurrent =
    progress.currentLessonId === lessonId &&
    progress.lastVisitedLessonId === lessonId;

  const existingLesson = await db.journeyLessons.get(lessonId);
  await upsertLessonStart(lessonId);
  const createdLesson = !existingLesson;

  // Avoid redundant writes that force full dashboard rebuilds on every mount.
  if (alreadyCurrent && !createdLesson) return false;

  if (!alreadyCurrent) {
    await db.journeyProgress.put({
      ...progress,
      currentLessonId: lessonId,
      lastVisitedLessonId: lessonId,
      updatedAt: new Date(),
    });
  }

  return true;
}

export async function completeLessonSection(
  lessonId: string,
  sectionId: string,
): Promise<void> {
  const lesson = JOURNEY_LESSON_MAP[lessonId];
  if (!lesson) return;
  const row = await upsertLessonStart(lessonId);
  if (row.completedSections.includes(sectionId)) return;
  const completedSections = [...row.completedSections, sectionId];
  await db.journeyLessons.put({
    ...row,
    completedSections,
    updatedAt: new Date(),
  });
}

export async function completeLesson(
  lessonId: string,
  score?: { score: number; total: number },
): Promise<void> {
  const lesson = JOURNEY_LESSON_MAP[lessonId];
  if (!lesson) throw new Error(`Unknown lesson: ${lessonId}`);

  const row = await upsertLessonStart(lessonId);
  const now = new Date();
  const allSections = lesson.sections.map((s) => s.id);
  const next: JourneyLessonRecord = {
    ...row,
    status: "complete",
    completedSections: Array.from(
      new Set([...row.completedSections, ...allSections]),
    ),
    score: score?.score ?? row.score,
    total: score?.total ?? row.total,
    bestScore:
      score != null
        ? Math.max(row.bestScore ?? 0, score.score)
        : row.bestScore,
    attempts: score != null ? row.attempts + 1 : row.attempts,
    completedAt: now,
    updatedAt: now,
  };
  await db.journeyLessons.put(next);

  const progress = await getOrCreateJourneyProgress();
  const dashboard = await loadJourneyDashboard();
  const nextLesson = dashboard.nextLesson;

  await db.journeyProgress.put({
    ...progress,
    currentLessonId: nextLesson?.id ?? lessonId,
    lastVisitedLessonId: lessonId,
    updatedAt: now,
  });

  await recordActivity({
    type: "lesson_complete",
    title: `Lesson complete · ${lesson.title}`,
    detail: JOURNEY_STAGE_MAP[lesson.stageId]?.title ?? lesson.stageId,
    refId: lessonId,
    xp: lesson.xp,
  });
}

export async function recordLessonPractice(
  lessonId: string,
  score: number,
  total: number,
): Promise<void> {
  const row = await upsertLessonStart(lessonId);
  const best = Math.max(row.bestScore ?? 0, score);
  await db.journeyLessons.put({
    ...row,
    score,
    total,
    bestScore: best,
    attempts: row.attempts + 1,
    updatedAt: new Date(),
  });

  await recordActivity({
    type: score === total ? "practice_perfect" : "practice_attempt",
    title: `Journey practice · ${JOURNEY_LESSON_MAP[lessonId]?.title ?? lessonId}`,
    detail: `Scored ${score}/${total}`,
    refId: lessonId,
    xp: score === total ? 25 : 10,
  });
}

export async function setJourneyMode(mode: JourneyMode): Promise<void> {
  const progress = await getOrCreateJourneyProgress();
  await db.journeyProgress.put({
    ...progress,
    mode,
    updatedAt: new Date(),
  });
}

export async function setFreeExplore(enabled: boolean): Promise<void> {
  const progress = await getOrCreateJourneyProgress();
  await db.journeyProgress.put({
    ...progress,
    freeExplore: enabled,
    updatedAt: new Date(),
  });
}

export async function setNarrationEnabled(enabled: boolean): Promise<void> {
  const progress = await getOrCreateJourneyProgress();
  await db.journeyProgress.put({
    ...progress,
    narrationEnabled: enabled,
    updatedAt: new Date(),
  });
}

export function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function stageHref(stageId: JourneyStageId): string {
  return `/journey/${stageId}`;
}

export function lessonHref(lessonId: string): string {
  const lesson = JOURNEY_LESSON_MAP[lessonId];
  if (!lesson) return "/journey";
  return `/journey/${lesson.stageId}/${lessonId}`;
}
