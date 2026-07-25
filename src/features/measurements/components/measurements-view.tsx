"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { GraduationCap, ListChecks, Sparkles } from "lucide-react";
import { MEASUREMENTS } from "@/features/measurements/data/measurements";
import { LearningCard } from "@/features/measurements/components/learning-card";
import { MeasurementPicker } from "@/features/measurements/components/measurement-picker";
import { MannequinGuideOverlay } from "@/features/measurements/components/mannequin-guide-overlay";
import { UnitToggle } from "@/features/measurements/components/unit-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
import { JourneyGuideBanner } from "@/features/journey/components/journey-guide-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeasurementStore } from "@/stores/measurement-store";

const InteractiveMannequin = dynamic(
  () => import("@/features/measurements/components/interactive-mannequin"),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      </div>
    ),
  },
);

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
      aria-hidden
    >
      {n}
    </span>
  );
}

export function MeasurementsView() {
  const hydrate = useMeasurementStore((s) => s.hydrate);
  const learnedCount = useMeasurementStore((s) => s.learnedIds.length);
  const selectedId = useMeasurementStore((s) => s.selectedId);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="space-y-6">
      <JourneyGuideBanner feature="measurements" />
      <PageHeader
        eyebrow="Learning studio"
        title="Measurements"
        description="Follow the three steps below — designed for absolute beginners."
        actions={<UnitToggle />}
      />

      {/* Beginner roadmap */}
      <ol className="grid gap-2 sm:grid-cols-3" aria-label="How to use this page">
        <li className="glass-panel flex items-start gap-2.5 rounded-2xl p-3">
          <StepBadge n={1} />
          <div>
            <p className="text-sm font-semibold tracking-tight">Tap the mannequin</p>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Glowing spots show where to click.
            </p>
          </div>
        </li>
        <li className="glass-panel flex items-start gap-2.5 rounded-2xl p-3">
          <StepBadge n={2} />
          <div>
            <p className="text-sm font-semibold tracking-tight">Read the lesson</p>
            <p className="text-[11px] leading-snug text-muted-foreground">
              How to place the tape, step by step.
            </p>
          </div>
        </li>
        <li className="glass-panel flex items-start gap-2.5 rounded-2xl p-3">
          <StepBadge n={3} />
          <div>
            <p className="text-sm font-semibold tracking-tight">Mark as learned</p>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Or pick another region from the list.
            </p>
          </div>
        </li>
      </ol>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur-sm"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight">
            {learnedCount} of {MEASUREMENTS.length} measurements learned
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={MEASUREMENTS.length}
            aria-valuenow={learnedCount}
            aria-label="Learning progress"
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{
                width: `${(learnedCount / MEASUREMENTS.length) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </motion.div>

      <section className="space-y-2" aria-labelledby="step-1-mannequin">
        <div className="flex items-center gap-2 px-0.5">
          <StepBadge n={1} />
          <h2
            id="step-1-mannequin"
            className="text-sm font-semibold tracking-tight"
          >
            Explore the dress form
          </h2>
          <Sparkles className="size-3.5 text-primary" aria-hidden />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-b from-muted/60 via-card/60 to-muted/40 shadow-[0_18px_50px_-24px_rgba(15,23,28,0.4)] dark:border-white/10"
        >
          <MannequinGuideOverlay />
          <FeatureErrorBoundary
            title="3D mannequin failed"
            description="WebGL may be unavailable. Retry or use the region chips below."
          >
            <InteractiveMannequin className="touch-none" />
          </FeatureErrorBoundary>
          <p className="border-t border-border/50 px-4 py-2.5 text-center text-[11px] text-muted-foreground">
            Drag to rotate · Scroll to zoom · Glowing bands invite a tap
          </p>
        </motion.div>
      </section>

      <section className="space-y-2" aria-labelledby="step-2-lesson">
        <div className="flex items-center gap-2 px-0.5">
          <StepBadge n={2} />
          <h2 id="step-2-lesson" className="text-sm font-semibold tracking-tight">
            {selectedId ? "Your measurement lesson" : "Lesson appears after you tap"}
          </h2>
        </div>
        <LearningCard />
      </section>

      <section className="space-y-2" aria-labelledby="step-3-picker">
        <div className="flex items-center gap-2 px-0.5">
          <StepBadge n={3} />
          <h2 id="step-3-picker" className="text-sm font-semibold tracking-tight">
            Or choose from the list
          </h2>
          <ListChecks className="size-3.5 text-muted-foreground" aria-hidden />
        </div>
        <MeasurementPicker />
      </section>
    </div>
  );
}
