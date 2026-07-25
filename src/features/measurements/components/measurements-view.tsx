"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { GraduationCap, ListChecks, Sparkles } from "lucide-react";
import { MEASUREMENTS } from "@/features/measurements/data/measurements";
import { LearningCard } from "@/features/measurements/components/learning-card";
import { MeasurementPicker } from "@/features/measurements/components/measurement-picker";
import { MeasurementMasterclassTour } from "@/features/measurements/components/measurement-masterclass-tour";
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
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        <p className="relative text-xs font-medium tracking-wide text-muted-foreground">
          Loading 3D studio…
        </p>
      </div>
    ),
  },
);

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-[0_8px_18px_-10px_rgba(15,23,28,0.45)]"
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
    <div className="space-y-8">
      <JourneyGuideBanner feature="measurements" />
      <PageHeader
        eyebrow="Atelier masterclass"
        title="Measurements"
        description="A guided textbook for absolute beginners — rotate, tap, and learn every body measurement."
        actions={<UnitToggle />}
      />

      <ol
        className="grid gap-3 sm:grid-cols-3"
        aria-label="How to use this page"
      >
        {[
          {
            n: 1,
            title: "Rotate & explore",
            body: "Swipe the dress form to see every angle.",
          },
          {
            n: 2,
            title: "Tap a glowing region",
            body: "Open the editorial lesson for that measurement.",
          },
          {
            n: 3,
            title: "Mark as learned",
            body: "Track progress — or pick from the list below.",
          },
        ].map((item) => (
          <li
            key={item.n}
            className="glass-panel interactive-lift flex items-start gap-3 rounded-2xl p-4"
          >
            <StepBadge n={item.n} />
            <div>
              <p className="text-sm font-semibold tracking-tight">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3.5"
      >
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
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
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/80"
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

      <section className="space-y-3" aria-labelledby="step-1-mannequin">
        <div className="flex items-center gap-2.5 px-0.5">
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
          className="relative overflow-hidden rounded-[1.75rem] border border-white/25 bg-gradient-to-b from-muted/50 via-card/40 to-muted/30 shadow-[0_22px_60px_-28px_rgba(15,23,28,0.42)] dark:border-white/10"
        >
          {/* Explicit height so no ancestor flex context can collapse the canvas. */}
          <div className="relative h-[60vh] max-h-[600px] min-h-[400px] w-full shrink-0 overflow-hidden bg-gradient-to-b from-card/70 via-muted/40 to-muted/60">
            <MeasurementMasterclassTour />
            <FeatureErrorBoundary
              title="3D mannequin failed"
              description="WebGL may be unavailable. Retry or use the region chips below."
            >
              <InteractiveMannequin className="touch-none" />
            </FeatureErrorBoundary>
          </div>
          <p className="border-t border-white/15 px-4 py-3 text-center text-[11px] text-muted-foreground">
            Drag to rotate · Scroll to zoom · Glowing bands invite a tap
          </p>
        </motion.div>
      </section>

      <section className="space-y-3" aria-labelledby="step-2-lesson">
        <div className="flex items-center gap-2.5 px-0.5">
          <StepBadge n={2} />
          <h2 id="step-2-lesson" className="text-sm font-semibold tracking-tight">
            {selectedId
              ? "Your measurement masterclass"
              : "Lesson opens when you tap"}
          </h2>
        </div>
        <LearningCard />
      </section>

      <section className="space-y-3" aria-labelledby="step-3-picker">
        <div className="flex items-center gap-2.5 px-0.5">
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
