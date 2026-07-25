"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Compass, Cpu, GraduationCap, PencilRuler } from "lucide-react";
import { CONSTRUCTION_STEPS } from "@/features/drafts/data/construction-steps";
import { FORMULAS } from "@/features/drafts/data/formulas";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
import { JourneyGuideBanner } from "@/features/journey/components/journey-guide-banner";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useDraftLearningStore } from "@/stores/draft-learning-store";
import { cn } from "@/lib/utils";

const MarkingTutorial = dynamic(
  () =>
    import("@/features/drafts/components/marking-tutorial").then(
      (m) => m.MarkingTutorial,
    ),
  { loading: () => <Skeleton className="h-[28rem] w-full rounded-3xl" /> },
);

const PracticeMode = dynamic(
  () =>
    import("@/features/drafts/components/practice-mode").then(
      (m) => m.PracticeMode,
    ),
  { loading: () => <Skeleton className="h-80 w-full rounded-3xl" /> },
);

const DraftingEngine = dynamic(
  () =>
    import("@/features/drafts/engine/components/drafting-engine").then(
      (m) => m.DraftingEngine,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[32rem] w-full rounded-3xl" />,
  },
);

export function DraftLearningView() {
  const reduceMotion = useReducedMotion();
  const hydrate = useDraftLearningStore((s) => s.hydrate);
  const mode = useDraftLearningStore((s) => s.mode);
  const setMode = useDraftLearningStore((s) => s.setMode);
  const completedSteps = useDraftLearningStore((s) => s.completedSteps);
  const practiceCompletions = useDraftLearningStore((s) => s.practiceCompletions);
  const practiceBestScore = useDraftLearningStore((s) => s.practiceBestScore);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const lessonProgress = completedSteps.length;
  const lessonTotal = CONSTRUCTION_STEPS.length;

  return (
    <div className="space-y-6">
      <JourneyGuideBanner feature="drafts" />
      <PageHeader
        eyebrow="Pattern craft"
        title="Draft Learning"
        description="Watch chalk lines draw themselves, learn the formulas, practice the numbers, then run the drafting engine."
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight">
            {lessonProgress} of {lessonTotal} construction steps learned
            {practiceCompletions > 0
              ? ` · ${practiceCompletions} practice win${practiceCompletions === 1 ? "" : "s"}`
              : ""}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={lessonTotal}
            aria-valuenow={lessonProgress}
            aria-label="Draft learning progress"
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{
                width: `${(lessonProgress / lessonTotal) * 100}%`,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 120, damping: 20 }
              }
            />
          </div>
          {practiceBestScore > 0 ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Best practice score: {practiceBestScore}/{FORMULAS.length}
            </p>
          ) : null}
        </div>
      </motion.div>

      <div
        role="tablist"
        aria-label="Draft modes"
        className="grid grid-cols-3 gap-1.5 rounded-2xl bg-muted/70 p-1.5 ring-1 ring-border/50"
      >
        {(
          [
            { id: "lesson" as const, label: "Marking", icon: Compass },
            { id: "practice" as const, label: "Practice", icon: PencilRuler },
            { id: "engine" as const, label: "Engine", icon: Cpu },
          ] as const
        ).map((tab) => {
          const active = mode === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(tab.id)}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors sm:gap-2 sm:text-sm",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : "draft-mode-pill"}
                  className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 400, damping: 32 }
                  }
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="size-3.5 sm:size-4" aria-hidden="true" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <FeatureErrorBoundary title="Draft mode failed to load">
        {mode === "lesson" ? <MarkingTutorial /> : null}
        {mode === "practice" ? <PracticeMode /> : null}
        {mode === "engine" ? <DraftingEngine /> : null}
      </FeatureErrorBoundary>
    </div>
  );
}
