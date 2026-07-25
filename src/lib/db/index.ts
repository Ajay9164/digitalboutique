import Dexie, { type EntityTable } from "dexie";
import type { PatternId } from "@/features/studio/data/patterns";

/**
 * Local-first IndexedDB — Tailor offline store.
 *
 * Migration policy:
 * - Bump `version(n)` when adding/changing stores or indexes.
 * - Prefer additive schema changes (new stores/indexes).
 * - Use `.upgrade(tx => …)` for data transforms, backfills, and cleanup.
 * - Never remove a historical version chain — Dexie upgrades sequentially.
 * - Large media stays as JPEG data URLs today; v7+ may migrate to Blobs.
 */

export type AppMetaRecord = {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
};

/** Learning progress for the measurement guide. */
export type LearningRecord = {
  id: string;
  learnedAt: Date;
};

/** Draft Learning progress — one row, keyed constantly. */
export type DraftLearningRecord = {
  id: "draft-learning";
  completedSteps: string[];
  lessonMaxStep: number;
  practiceAttempts: number;
  practiceCompletions: number;
  practiceBestScore: number;
  lastScore: number | null;
  updatedAt: Date;
};

/** Captured fabric photos for the Studio. */
export type StudioPhotoRecord = {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectMeasurements = {
  bust?: number;
  waist?: number;
  hip?: number;
  neck?: number;
  shoulder?: number;
  sleeveLength?: number;
  blouseLength?: number;
  apexDistance?: number;
  apexDepth?: number;
  notes?: string;
};

export type ProjectLearningProgress = {
  measurementsLearned: string[];
  constructionSteps: string[];
  practiceCompletions: number;
  percentComplete: number;
  notes?: string;
};

export type JournalProject = {
  id: string;
  name: string;
  date: Date;
  fabricPhoto: string | null;
  measurements: ProjectMeasurements;
  draftImage: string | null;
  patternType: PatternId | "custom" | "unspecified";
  alterationNotes: string;
  observations: string;
  learningProgress: ProjectLearningProgress;
  createdAt: Date;
  updatedAt: Date;
};

export type JournalBackup = {
  version: 1;
  exportedAt: string;
  app: "tailor";
  projects: Array<
    Omit<JournalProject, "date" | "createdAt" | "updatedAt"> & {
      date: string;
      createdAt: string;
      updatedAt: string;
    }
  >;
};

/** Timeline / activity feed entry. */
export type LearningActivityType =
  | "measurement_learned"
  | "lesson_step"
  | "lesson_complete"
  | "practice_attempt"
  | "practice_perfect"
  | "achievement"
  | "project_created"
  | "streak"
  | "onboarding"
  | "milestone";

export type LearningActivityRecord = {
  id: string;
  type: LearningActivityType;
  title: string;
  detail: string;
  /** Optional related entity id. */
  refId?: string;
  xp: number;
  createdAt: Date;
};

/** Single-row learner profile. */
export type LearningProfileRecord = {
  id: "profile";
  onboardingComplete: boolean;
  onboardingStep: number;
  displayName: string;
  currentStreak: number;
  longestStreak: number;
  /** YYYY-MM-DD of last recorded activity day. */
  lastActiveDate: string | null;
  totalXp: number;
  celebratedMilestones: string[];
  updatedAt: Date;
};

/** Unlocked achievement. */
export type AchievementRecord = {
  id: string;
  unlockedAt: Date;
};

/** Practice attempt history for charts. */
export type PracticeHistoryRecord = {
  id: string;
  score: number;
  total: number;
  perfect: boolean;
  createdAt: Date;
};

/** Guided Learning Mode difficulty track. */
export type JourneyMode = "beginner" | "intermediate" | "advanced";

/** Single-row guided journey state. */
export type JourneyProgressRecord = {
  id: "journey";
  mode: JourneyMode;
  /** Lesson the learner is actively working through. */
  currentLessonId: string | null;
  /** Last lesson opened — powers "continue where left off". */
  lastVisitedLessonId: string | null;
  /** When true, locked surfaces are browsable for free exploration. */
  freeExplore: boolean;
  /** Narration (voice guidance) preference. */
  narrationEnabled: boolean;
  startedAt: Date;
  updatedAt: Date;
};

export type JourneyLessonStatus = "in-progress" | "complete";

/** Per-lesson guided progress. */
export type JourneyLessonRecord = {
  id: string;
  stageId: string;
  status: JourneyLessonStatus;
  /** Section ids the learner has stepped through inside the lesson. */
  completedSections: string[];
  /** Latest practice score for practice lessons. */
  score: number | null;
  total: number | null;
  bestScore: number | null;
  attempts: number;
  startedAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
};

const SCHEMA_V6 = {
  meta: "id, key, updatedAt",
  learning: "id, learnedAt",
  draftLearning: "id, updatedAt",
  studioPhotos: "id, createdAt, updatedAt",
  projects: "id, name, date, patternType, createdAt, updatedAt",
  learningActivity: "id, type, createdAt",
  learningProfile: "id, updatedAt",
  achievements: "id, unlockedAt",
  practiceHistory: "id, createdAt, perfect",
} as const;

const SCHEMA_V8 = {
  ...SCHEMA_V6,
  journeyProgress: "id, updatedAt",
  journeyLessons: "id, stageId, status, updatedAt",
} as const;

class TailorDatabase extends Dexie {
  meta!: EntityTable<AppMetaRecord, "id">;
  learning!: EntityTable<LearningRecord, "id">;
  draftLearning!: EntityTable<DraftLearningRecord, "id">;
  studioPhotos!: EntityTable<StudioPhotoRecord, "id">;
  projects!: EntityTable<JournalProject, "id">;
  learningActivity!: EntityTable<LearningActivityRecord, "id">;
  learningProfile!: EntityTable<LearningProfileRecord, "id">;
  achievements!: EntityTable<AchievementRecord, "id">;
  practiceHistory!: EntityTable<PracticeHistoryRecord, "id">;
  journeyProgress!: EntityTable<JourneyProgressRecord, "id">;
  journeyLessons!: EntityTable<JourneyLessonRecord, "id">;

  constructor() {
    super("tailor");
    this.version(1).stores({
      meta: "id, key, updatedAt",
    });
    this.version(2).stores({
      meta: "id, key, updatedAt",
      learning: "id, learnedAt",
    });
    this.version(3).stores({
      meta: "id, key, updatedAt",
      learning: "id, learnedAt",
      draftLearning: "id, updatedAt",
    });
    this.version(4).stores({
      meta: "id, key, updatedAt",
      learning: "id, learnedAt",
      draftLearning: "id, updatedAt",
      studioPhotos: "id, createdAt, updatedAt",
    });
    this.version(5).stores({
      meta: "id, key, updatedAt",
      learning: "id, learnedAt",
      draftLearning: "id, updatedAt",
      studioPhotos: "id, createdAt, updatedAt",
      projects: "id, name, date, patternType, createdAt, updatedAt",
    });
    this.version(6).stores({ ...SCHEMA_V6 });
    this.version(7)
      .stores({ ...SCHEMA_V6 })
      .upgrade(async (tx) => {
        const now = new Date();
        const profileTable = tx.table("learningProfile");
        const existing = await profileTable.get("profile");
        if (!existing) {
          await profileTable.put({
            id: "profile",
            onboardingComplete: false,
            onboardingStep: 0,
            displayName: "",
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            totalXp: 0,
            celebratedMilestones: [],
            updatedAt: now,
          } satisfies LearningProfileRecord);
        }

        // Normalize studio photo labels and drop empty captures.
        const photos = tx.table("studioPhotos");
        await photos
          .toCollection()
          .modify((photo: StudioPhotoRecord) => {
            if (!photo.label?.trim()) {
              photo.label = "Fabric photo";
            }
            photo.updatedAt = photo.updatedAt ?? now;
          });
        await photos.filter((p) => !p.dataUrl).delete();

        await tx.table("meta").put({
          id: "schema",
          key: "schemaVersion",
          value: "7",
          updatedAt: now,
        } satisfies AppMetaRecord);
      });
    this.version(8)
      .stores({ ...SCHEMA_V8 })
      .upgrade(async (tx) => {
        const now = new Date();
        const journeyTable = tx.table("journeyProgress");
        const existing = await journeyTable.get("journey");
        if (!existing) {
          await journeyTable.put({
            id: "journey",
            mode: "beginner",
            currentLessonId: "s1-basics",
            lastVisitedLessonId: null,
            freeExplore: false,
            narrationEnabled: false,
            startedAt: now,
            updatedAt: now,
          } satisfies JourneyProgressRecord);
        }
        await tx.table("meta").put({
          id: "schema",
          key: "schemaVersion",
          value: "8",
          updatedAt: now,
        } satisfies AppMetaRecord);
      });
  }
}

export const db = new TailorDatabase();

export const DRAFT_LEARNING_ID = "draft-learning" as const;
export const LEARNING_PROFILE_ID = "profile" as const;
export const JOURNEY_PROGRESS_ID = "journey" as const;
export const DB_SCHEMA_VERSION = 8 as const;
