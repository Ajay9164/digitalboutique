import {
  db,
  LEARNING_PROFILE_ID,
  type LearningActivityRecord,
  type LearningProfileRecord,
  type PracticeHistoryRecord,
} from "@/lib/db";
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_MAP,
  CURRICULUM,
  MILESTONE_THRESHOLDS,
  createLearningId,
  daysBetween,
  todayKey,
  type AchievementId,
} from "@/features/learning/data/catalog";
import { MEASUREMENTS } from "@/features/measurements/data/measurements";
import { CONSTRUCTION_STEPS } from "@/features/drafts/data/construction-steps";

export type LearningSnapshot = {
  profile: LearningProfileRecord;
  activities: LearningActivityRecord[];
  unlockedAchievementIds: AchievementId[];
  practiceHistory: PracticeHistoryRecord[];
  measurementsLearned: number;
  constructionCompleted: number;
  practiceCompletions: number;
  practiceAttempts: number;
  practiceBestScore: number;
  projectCount: number;
  learningPercent: number;
  skillBars: Array<{ id: string; label: string; value: number; max: number }>;
  chartWeekly: Array<{ day: string; xp: number; practices: number }>;
  newlyUnlocked: AchievementId[];
  pendingCelebration: {
    kind: "achievement" | "milestone";
    id: string;
    title: string;
    detail: string;
  } | null;
};

function defaultProfile(): LearningProfileRecord {
  return {
    id: LEARNING_PROFILE_ID,
    onboardingComplete: false,
    onboardingStep: 0,
    displayName: "",
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalXp: 0,
    celebratedMilestones: [],
    updatedAt: new Date(),
  };
}

async function getOrCreateProfile(): Promise<LearningProfileRecord> {
  const existing = await db.learningProfile.get(LEARNING_PROFILE_ID);
  if (existing) return existing;
  const profile = defaultProfile();
  await db.learningProfile.put(profile);
  return profile;
}

async function touchStreak(profile: LearningProfileRecord): Promise<{
  profile: LearningProfileRecord;
  streakEvent: LearningActivityRecord | null;
}> {
  const today = todayKey();
  let { currentStreak, longestStreak, lastActiveDate } = profile;
  let streakEvent: LearningActivityRecord | null = null;

  if (lastActiveDate === today) {
    return { profile, streakEvent: null };
  }

  if (!lastActiveDate) {
    currentStreak = 1;
  } else {
    const gap = daysBetween(lastActiveDate, today);
    currentStreak = gap === 1 ? currentStreak + 1 : 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);
  lastActiveDate = today;

  if (currentStreak === 3 || currentStreak === 7 || currentStreak === 30) {
    streakEvent = {
      id: createLearningId("act"),
      type: "streak",
      title: `${currentStreak}-day streak`,
      detail: "You showed up for the craft again.",
      xp: currentStreak >= 30 ? 40 : currentStreak >= 7 ? 20 : 10,
      createdAt: new Date(),
    };
  }

  const next: LearningProfileRecord = {
    ...profile,
    currentStreak,
    longestStreak,
    lastActiveDate,
    totalXp: profile.totalXp + (streakEvent?.xp ?? 0),
    updatedAt: new Date(),
  };
  await db.learningProfile.put(next);
  if (streakEvent) await db.learningActivity.add(streakEvent);

  return { profile: next, streakEvent };
}

async function unlockAchievements(
  candidateIds: AchievementId[],
): Promise<AchievementId[]> {
  const existing = await db.achievements.toArray();
  const have = new Set(existing.map((row) => row.id));
  const unlocked: AchievementId[] = [];

  for (const id of candidateIds) {
    if (have.has(id)) continue;
    const def = ACHIEVEMENT_MAP[id];
    if (!def) continue;
    await db.achievements.put({ id, unlockedAt: new Date() });
    await db.learningActivity.add({
      id: createLearningId("act"),
      type: "achievement",
      title: def.title,
      detail: def.description,
      refId: id,
      xp: def.xp,
      createdAt: new Date(),
    });
    const profile = await getOrCreateProfile();
    await db.learningProfile.put({
      ...profile,
      totalXp: profile.totalXp + def.xp,
      updatedAt: new Date(),
    });
    unlocked.push(id);
  }

  return unlocked;
}

function computePercent(input: {
  measurementsLearned: number;
  constructionCompleted: number;
  practiceCompletions: number;
}): number {
  const measureScore =
    (input.measurementsLearned / CURRICULUM.measurements) * 45;
  const draftScore =
    (input.constructionCompleted / CURRICULUM.constructionSteps) * 35;
  const practiceScore = Math.min(input.practiceCompletions, 5) * 4; // up to 20%
  return Math.min(100, Math.round(measureScore + draftScore + practiceScore));
}

async function evaluateAchievements(stats: {
  measurementsLearned: number;
  constructionCompleted: number;
  practiceAttempts: number;
  practiceCompletions: number;
  hasPerfect: boolean;
  projectCount: number;
  streak: number;
  learningPercent: number;
}): Promise<AchievementId[]> {
  const candidates: AchievementId[] = [];
  if (stats.measurementsLearned >= 1) candidates.push("first-stitch");
  if (stats.measurementsLearned >= 5) candidates.push("measure-five");
  if (stats.measurementsLearned >= CURRICULUM.measurements)
    candidates.push("measure-master");
  if (stats.constructionCompleted >= 1) candidates.push("first-line");
  if (stats.constructionCompleted >= CURRICULUM.constructionSteps)
    candidates.push("block-complete");
  if (stats.practiceAttempts >= 1) candidates.push("first-practice");
  if (stats.hasPerfect) candidates.push("perfect-draft");
  if (stats.streak >= 3) candidates.push("streak-3");
  if (stats.streak >= 7) candidates.push("streak-7");
  if (stats.streak >= 30) candidates.push("streak-30");
  if (stats.projectCount >= 1) candidates.push("atelier-archive");
  if (stats.learningPercent >= 100) candidates.push("full-circle");
  return unlockAchievements(candidates);
}

async function gatherStats() {
  const [learned, draft, practice, projects, unlocked] = await Promise.all([
    db.learning.count(),
    db.draftLearning.get("draft-learning"),
    db.practiceHistory.toArray(),
    db.projects.count(),
    db.achievements.toArray(),
  ]);

  return {
    measurementsLearned: learned,
    constructionCompleted: draft?.completedSteps.length ?? 0,
    practiceAttempts: practice.length || draft?.practiceAttempts || 0,
    practiceCompletions:
      practice.filter((p) => p.perfect).length || draft?.practiceCompletions || 0,
    practiceBestScore: Math.max(
      draft?.practiceBestScore ?? 0,
      ...practice.map((p) => p.score),
      0,
    ),
    hasPerfect:
      practice.some((p) => p.perfect) || (draft?.practiceCompletions ?? 0) > 0,
    projectCount: projects,
    unlockedIds: unlocked.map((row) => row.id as AchievementId),
    practiceHistory: practice.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
    draft,
  };
}

function buildWeeklyChart(activities: LearningActivityRecord[], practice: PracticeHistoryRecord[]) {
  const days: Array<{ day: string; key: string; xp: number; practices: number }> = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = todayKey(date);
    days.push({
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      key,
      xp: 0,
      practices: 0,
    });
  }

  for (const activity of activities) {
    const key = todayKey(new Date(activity.createdAt));
    const bucket = days.find((d) => d.key === key);
    if (bucket) bucket.xp += activity.xp;
  }
  for (const row of practice) {
    const key = todayKey(new Date(row.createdAt));
    const bucket = days.find((d) => d.key === key);
    if (bucket) bucket.practices += 1;
  }

  return days.map(({ day, xp, practices }) => ({ day, xp, practices }));
}

async function maybeCelebrate(
  profile: LearningProfileRecord,
  percent: number,
  newlyUnlocked: AchievementId[],
): Promise<LearningSnapshot["pendingCelebration"]> {
  if (newlyUnlocked.length > 0) {
    const id = newlyUnlocked[newlyUnlocked.length - 1];
    const def = ACHIEVEMENT_MAP[id];
    return {
      kind: "achievement",
      id,
      title: def.title,
      detail: def.description,
    };
  }

  for (const milestone of MILESTONE_THRESHOLDS) {
    if (
      percent >= milestone.percent &&
      !profile.celebratedMilestones.includes(milestone.id)
    ) {
      const celebrated = [...profile.celebratedMilestones, milestone.id];
      await db.learningProfile.put({
        ...profile,
        celebratedMilestones: celebrated,
        updatedAt: new Date(),
      });
      await db.learningActivity.add({
        id: createLearningId("act"),
        type: "milestone",
        title: milestone.title,
        detail: milestone.detail,
        refId: milestone.id,
        xp: 30,
        createdAt: new Date(),
      });
      return {
        kind: "milestone",
        id: milestone.id,
        title: milestone.title,
        detail: milestone.detail,
      };
    }
  }

  return null;
}

export async function loadLearningSnapshot(
  options: { evaluateSideEffects?: boolean } = {},
): Promise<LearningSnapshot> {
  const evaluateSideEffects = options.evaluateSideEffects ?? true;
  let profile = await getOrCreateProfile();
  const stats = await gatherStats();
  const learningPercent = computePercent(stats);

  let newlyUnlocked: AchievementId[] = [];
  let celebration: LearningSnapshot["pendingCelebration"] = null;

  if (evaluateSideEffects) {
    newlyUnlocked = await evaluateAchievements({
      ...stats,
      streak: profile.currentStreak,
      learningPercent,
    });

    profile = await getOrCreateProfile();
    celebration = await maybeCelebrate(profile, learningPercent, newlyUnlocked);
    profile = await getOrCreateProfile();
  }

  const activities = await db.learningActivity
    .orderBy("createdAt")
    .reverse()
    .limit(40)
    .toArray();

  const unlockedAchievementIds = (
    await db.achievements.toArray()
  ).map((row) => row.id as AchievementId);

  return {
    profile,
    activities,
    unlockedAchievementIds,
    practiceHistory: stats.practiceHistory.slice(0, 20),
    measurementsLearned: stats.measurementsLearned,
    constructionCompleted: stats.constructionCompleted,
    practiceCompletions: stats.practiceCompletions,
    practiceAttempts: stats.practiceAttempts,
    practiceBestScore: stats.practiceBestScore,
    projectCount: stats.projectCount,
    learningPercent,
    skillBars: [
      {
        id: "measure",
        label: "Measurements",
        value: stats.measurementsLearned,
        max: CURRICULUM.measurements,
      },
      {
        id: "draft",
        label: "Construction",
        value: stats.constructionCompleted,
        max: CURRICULUM.constructionSteps,
      },
      {
        id: "practice",
        label: "Practice wins",
        value: Math.min(stats.practiceCompletions, 5),
        max: 5,
      },
      {
        id: "journal",
        label: "Projects",
        value: Math.min(stats.projectCount, 5),
        max: 5,
      },
    ],
    chartWeekly: buildWeeklyChart(activities, stats.practiceHistory),
    newlyUnlocked,
    pendingCelebration: celebration,
  };
}

export async function recordActivity(input: {
  type: LearningActivityRecord["type"];
  title: string;
  detail: string;
  refId?: string;
  xp?: number;
}): Promise<void> {
  let profile = await getOrCreateProfile();
  const streak = await touchStreak(profile);
  profile = streak.profile;

  const activity: LearningActivityRecord = {
    id: createLearningId("act"),
    type: input.type,
    title: input.title,
    detail: input.detail,
    refId: input.refId,
    xp: input.xp ?? 10,
    createdAt: new Date(),
  };

  await db.learningActivity.add(activity);
  await db.learningProfile.put({
    ...profile,
    totalXp: profile.totalXp + activity.xp,
    updatedAt: new Date(),
  });
}

export async function recordPracticeAttempt(input: {
  score: number;
  total: number;
}): Promise<void> {
  const perfect = input.score === input.total;
  await db.practiceHistory.add({
    id: createLearningId("practice"),
    score: input.score,
    total: input.total,
    perfect,
    createdAt: new Date(),
  });

  await recordActivity({
    type: perfect ? "practice_perfect" : "practice_attempt",
    title: perfect ? "Perfect practice" : "Practice attempt",
    detail: `Scored ${input.score}/${input.total}`,
    xp: perfect ? 35 : 12,
  });
}

export async function completeOnboarding(displayName: string): Promise<void> {
  const profile = await getOrCreateProfile();
  await db.learningProfile.put({
    ...profile,
    displayName: displayName.trim() || "Tailor",
    onboardingComplete: true,
    onboardingStep: ONBOARDING_STEP_COUNT,
    updatedAt: new Date(),
  });
  await recordActivity({
    type: "onboarding",
    title: "Onboarding complete",
    detail: "Welcome to your offline atelier.",
    xp: 20,
  });
}

export async function setOnboardingStep(step: number): Promise<void> {
  const profile = await getOrCreateProfile();
  await db.learningProfile.put({
    ...profile,
    onboardingStep: step,
    updatedAt: new Date(),
  });
}

const ONBOARDING_STEP_COUNT = 4;

export async function dismissCelebration(milestoneId?: string): Promise<void> {
  if (!milestoneId) return;
  const profile = await getOrCreateProfile();
  if (profile.celebratedMilestones.includes(milestoneId)) return;
  await db.learningProfile.put({
    ...profile,
    celebratedMilestones: [...profile.celebratedMilestones, milestoneId],
    updatedAt: new Date(),
  });
}

/** Backfill timeline labels for completed lessons list. */
export function completedLessonLabels(input: {
  learnedMeasurementIds: string[];
  constructionStepIds: string[];
}): Array<{ id: string; label: string; group: string }> {
  const measureItems = MEASUREMENTS.filter((m) =>
    input.learnedMeasurementIds.includes(m.id),
  ).map((m) => ({ id: m.id, label: m.label, group: "Measurements" }));

  const draftItems = CONSTRUCTION_STEPS.filter((s) =>
    input.constructionStepIds.includes(s.id),
  ).map((s) => ({ id: s.id, label: s.label, group: "Construction" }));

  return [...measureItems, ...draftItems];
}

export { ACHIEVEMENTS };
