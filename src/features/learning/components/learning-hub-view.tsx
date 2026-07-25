"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Gauge, GraduationCap, Layers3 } from "lucide-react";
import Link from "next/link";
import {
  AnimatedMeter,
  DashboardCard,
} from "@/features/learning/components/dashboard-card";
import { AchievementsGrid } from "@/features/learning/components/achievements-grid";
import { CompletedLessons } from "@/features/learning/components/completed-lessons";
import { LearningTimeline } from "@/features/learning/components/learning-timeline";
import { PracticeHistoryCard } from "@/features/learning/components/practice-history-card";
import { OnboardingOverlay } from "@/features/learning/components/onboarding-overlay";
import { CelebrationOverlay } from "@/features/learning/components/celebration-overlay";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearningHubStore } from "@/stores/learning-hub-store";
import { formatRelativeLabel } from "@/utils/format";

const ProgressCharts = dynamic(
  () =>
    import("@/features/learning/components/progress-charts").then(
      (m) => m.ProgressCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-3" aria-busy="true">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    ),
  },
);

export function LearningHubView() {
  const reduceMotion = useReducedMotion();
  const hydrate = useLearningHubStore((s) => s.hydrate);
  const refresh = useLearningHubStore((s) => s.refresh);
  const hydrated = useLearningHubStore((s) => s.hydrated);
  const snapshot = useLearningHubStore((s) => s.snapshot);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const percent = snapshot?.learningPercent ?? 0;
  const motionProps = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      <OnboardingOverlay />
      <CelebrationOverlay />

      <PageHeader
        eyebrow="Learning ecosystem"
        title={
          snapshot?.profile.displayName
            ? `Hello, ${snapshot.profile.displayName}`
            : "Your atelier progress"
        }
        description="Skill progress, streaks, achievements, and practice — all offline on this device."
      />

      {!hydrated || !snapshot ? (
        <PageSkeleton />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <motion.div
              {...motionProps}
              className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-primary/15 via-card/80 to-card/60 p-5 shadow-[0_18px_50px_-24px_rgba(15,23,28,0.4)] dark:border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Gauge className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Learning percentage
                  </p>
                  <p className="font-display text-4xl font-semibold tabular-nums tracking-tight">
                    {percent}%
                  </p>
                </div>
              </div>
              <div
                className="mt-4 h-3 overflow-hidden rounded-full bg-background/60"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-label="Overall learning percentage"
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
              <p className="mt-3 text-xs text-muted-foreground">
                {snapshot.profile.totalXp} XP earned across lessons and practice
              </p>
            </motion.div>

            <motion.div
              {...motionProps}
              transition={reduceMotion ? undefined : { delay: 0.05 }}
              className="glass-panel rounded-3xl p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-300">
                  <Flame className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Daily streak
                  </p>
                  <p className="font-display text-4xl font-semibold tabular-nums tracking-tight">
                    {snapshot.profile.currentStreak}
                    <span className="ml-1 text-base font-medium text-muted-foreground">
                      days
                    </span>
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Longest streak:{" "}
                <span className="font-semibold text-foreground">
                  {snapshot.profile.longestStreak} days
                </span>
                {snapshot.profile.lastActiveDate ? (
                  <>
                    {" · "}
                    Active{" "}
                    {formatRelativeLabel(
                      new Date(`${snapshot.profile.lastActiveDate}T12:00:00`),
                    )}
                  </>
                ) : null}
              </p>
            </motion.div>
          </div>

          <DashboardCard
            title="Skill progress"
            subtitle="Curriculum coverage across Tailor"
            icon={Layers3}
            delay={0.04}
          >
            <div className="space-y-3">
              {snapshot.skillBars.map((bar) => (
                <AnimatedMeter
                  key={bar.id}
                  label={bar.label}
                  value={bar.value}
                  max={bar.max}
                />
              ))}
            </div>
          </DashboardCard>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="h-auto rounded-2xl py-3">
              <Link href="/measurements">
                <GraduationCap aria-hidden="true" />
                Measurements
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto rounded-2xl py-3">
              <Link href="/drafts">
                <Layers3 aria-hidden="true" />
                Draft Learning
              </Link>
            </Button>
          </div>

          <AchievementsGrid />
          <FeatureErrorBoundary title="Charts failed to load">
            <ProgressCharts />
          </FeatureErrorBoundary>
          <LearningTimeline />
          <CompletedLessons />
          <PracticeHistoryCard />
        </>
      )}
    </div>
  );
}
