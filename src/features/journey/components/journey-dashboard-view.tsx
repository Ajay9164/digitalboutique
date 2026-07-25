"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BookOpenCheck,
  Clock3,
  Compass,
  Flame,
  Gauge,
  Lock,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import { formatEta, lessonHref, stageHref } from "@/features/journey/lib/engine";
import { useJourneyStore } from "@/stores/journey-store";
import { useLearningHubStore } from "@/stores/learning-hub-store";
import { ACHIEVEMENTS } from "@/features/learning/data/catalog";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JourneyMode } from "@/lib/db";

const MODE_OPTIONS: Array<{ id: JourneyMode; label: string }> = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export function JourneyDashboardView() {
  const reduceMotion = useReducedMotion();
  const hydrate = useJourneyStore((s) => s.hydrate);
  const refresh = useJourneyStore((s) => s.refresh);
  const hydrated = useJourneyStore((s) => s.hydrated);
  const dashboard = useJourneyStore((s) => s.dashboard);
  const changeMode = useJourneyStore((s) => s.changeMode);
  const toggleExplore = useJourneyStore((s) => s.toggleExplore);

  const hubHydrate = useLearningHubStore((s) => s.hydrate);
  const hubSnapshot = useLearningHubStore((s) => s.snapshot);

  useEffect(() => {
    void hydrate();
    void hubHydrate();
  }, [hydrate, hubHydrate]);

  useEffect(() => {
    const onFocus = () => {
      void refresh();
      void useLearningHubStore.getState().refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  if (!hydrated || !dashboard) {
    return <PageSkeleton />;
  }

  const {
    progress,
    currentLesson,
    nextLesson,
    resumeLesson,
    completedLessons,
    percent,
    etaMinutesRemaining,
    practiceBestScore,
    stages,
  } = dashboard;

  const continueLesson = resumeLesson ?? currentLesson ?? nextLesson;
  const unlocked = new Set(hubSnapshot?.unlockedAchievementIds ?? []);
  const recent = (hubSnapshot?.activities ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tailor Academy"
        title="Learning Journey"
        description="A guided path from beginner foundations to a complete blouse project — with free exploration when you want it."
      />

      {/* Mode + explore */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Difficulty mode"
          className="flex rounded-2xl bg-muted/70 p-1 ring-1 ring-border/50"
        >
          {MODE_OPTIONS.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => void changeMode(mode.id)}
              className={cn(
                "rounded-xl px-3 py-2 text-xs font-semibold transition",
                progress.mode === mode.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs font-medium">
          <input
            type="checkbox"
            checked={progress.freeExplore}
            onChange={(event) => void toggleExplore(event.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Free explore (unlock all stages)
        </label>
      </div>

      {/* Continue CTA */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-primary/20 via-card/90 to-card/70 p-5 shadow-[0_18px_50px_-24px_rgba(15,23,28,0.4)] dark:border-white/10"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Continue where you left off
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          {continueLesson?.title ?? "Start your academy"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {continueLesson
            ? `${continueLesson.subtitle} · ${formatEta(continueLesson.etaMinutes)}`
            : "Begin Stage 1 — Introduction to Tailoring."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild className="rounded-xl">
            <Link
              href={
                continueLesson
                  ? lessonHref(continueLesson.id)
                  : "/journey/intro/s1-basics"
              }
            >
              <Play aria-hidden />
              Continue learning
            </Link>
          </Button>
          {nextLesson && nextLesson.id !== continueLesson?.id ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={lessonHref(nextLesson.id)}>
                Next recommended
              </Link>
            </Button>
          ) : null}
        </div>
      </motion.div>

      {/* Meters */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="glass-panel rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Gauge className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Progress
              </p>
              <p className="font-display text-3xl font-semibold tabular-nums">
                {percent}%
              </p>
            </div>
          </div>
          <div
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-background/70"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Journey progress"
          >
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 70, damping: 16 }
              }
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {dashboard.completedCount} of {dashboard.totalCount} lessons complete
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-300">
              <Clock3 className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Estimated time left
              </p>
              <p className="font-display text-3xl font-semibold tabular-nums">
                {formatEta(etaMinutesRemaining)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Full academy ≈ {formatEta(dashboard.etaMinutesTotal)} · Mode:{" "}
            <span className="font-semibold capitalize text-foreground">
              {progress.mode}
            </span>
          </p>
        </div>
      </div>

      {/* Current + next */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="glass-panel rounded-3xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current lesson
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            {currentLesson?.title ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentLesson?.subtitle}
          </p>
        </div>
        <div className="glass-panel rounded-3xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Next recommended
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            {nextLesson?.title ?? "Journey complete"}
          </p>
          <p className="text-xs text-muted-foreground">
            {nextLesson
              ? `Automatically suggested · ${formatEta(nextLesson.etaMinutes)}`
              : "You finished the academy path."}
          </p>
        </div>
      </div>

      {/* Practice + streak */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass-panel rounded-3xl p-4">
          <Target className="size-4 text-primary" aria-hidden />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Practice score
          </p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            {practiceBestScore ?? "—"}
          </p>
        </div>
        <div className="glass-panel rounded-3xl p-4">
          <Flame className="size-4 text-orange-500" aria-hidden />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Daily streak
          </p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            {hubSnapshot?.profile.currentStreak ?? 0}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              days
            </span>
          </p>
        </div>
        <div className="glass-panel rounded-3xl p-4">
          <Sparkles className="size-4 text-primary" aria-hidden />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            XP
          </p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            {hubSnapshot?.profile.totalXp ?? 0}
          </p>
        </div>
      </div>

      {/* Stages */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-primary" aria-hidden />
          <h2 className="font-display text-lg font-semibold">Eight stages</h2>
        </div>
        <div className="space-y-2">
          {stages.map((stage) => (
            <Link
              key={stage.id}
              href={stage.locked ? "/journey" : stageHref(stage.id)}
              aria-disabled={stage.locked}
              className={cn(
                "glass-panel flex items-center gap-3 rounded-2xl p-3 transition",
                stage.locked
                  ? "pointer-events-none opacity-55"
                  : "hover:border-primary/30",
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {stage.locked ? (
                  <Lock className="size-4" aria-hidden />
                ) : (
                  <span className="text-xs font-bold">{stage.order}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{stage.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {stage.completeCount}/{stage.lessons.length} lessons ·{" "}
                  {formatEta(stage.etaMinutes)}
                </p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Completed lessons */}
      <section className="glass-panel rounded-3xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <BookOpenCheck className="size-4 text-primary" aria-hidden />
          <h2 className="font-display text-base font-semibold">
            Completed lessons
          </h2>
        </div>
        {completedLessons.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 px-3 py-8 text-center text-xs text-muted-foreground">
            Finish your first lesson to build this list.
          </p>
        ) : (
          <ul className="space-y-2">
            {completedLessons
              .slice()
              .reverse()
              .slice(0, 8)
              .map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={lessonHref(lesson.id)}
                    className="flex items-center justify-between rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                  >
                    <span className="font-medium">{lesson.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      +{lesson.xp} XP
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Recent activities */}
      <section className="glass-panel rounded-3xl p-4">
        <h2 className="font-display text-base font-semibold">
          Recently completed activities
        </h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Your timeline will fill as you learn.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start justify-between gap-2 border-b border-border/40 pb-2 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {activity.detail}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-primary">
                  +{activity.xp}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button asChild variant="ghost" size="sm" className="mt-2 rounded-xl">
          <Link href="/progress">Full learning hub</Link>
        </Button>
      </section>

      {/* Achievements */}
      <section className="glass-panel rounded-3xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <Award className="size-4 text-primary" aria-hidden />
          <h2 className="font-display text-base font-semibold">
            Achievement badges
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACHIEVEMENTS.slice(0, 6).map((badge) => {
            const on = unlocked.has(badge.id);
            return (
              <div
                key={badge.id}
                className={cn(
                  "rounded-2xl border px-3 py-3",
                  on
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/50 bg-muted/20 opacity-60",
                )}
              >
                <p className="text-xs font-semibold">{badge.title}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
