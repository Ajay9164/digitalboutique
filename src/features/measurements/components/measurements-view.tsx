"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { GraduationCap, ListChecks, Sparkles } from "lucide-react";
import { MEASUREMENTS } from "@/features/measurements/data/measurements";
import { LearningCard } from "@/features/measurements/components/learning-card";
import { MeasurementPicker } from "@/features/measurements/components/measurement-picker";
import { MeasurementMasterclassTour } from "@/features/measurements/components/measurement-masterclass-tour";
import { FittingRoomControls } from "@/features/measurements/components/fitting-room-controls";
import { CinematicLoader } from "@/features/measurements/components/cinematic-loader";
import { UnitToggle } from "@/features/measurements/components/unit-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
import { JourneyGuideBanner } from "@/features/journey/components/journey-guide-banner";
import { useMeasurementStore } from "@/stores/measurement-store";
import { useCurtainTransitionStore } from "@/stores/curtain-transition-store";

const InteractiveMannequin = dynamic(
  () => import("@/features/measurements/components/interactive-mannequin"),
  {
    ssr: false,
    loading: () => <CinematicLoader />,
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

/**
 * Working dashboard stage — fixed viewport slice, no scroll runway.
 * Orbit / tap interaction only (cinema lives on `/`).
 */
function DashboardMannequinStage({ dismantling }: { dismantling: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{
        opacity: dismantling ? 0 : 1,
        scale: dismantling ? 0.985 : 1,
      }}
      transition={{
        duration: dismantling ? 0.28 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative overflow-hidden rounded-[1.75rem] border border-champagne/20 bg-gradient-to-b from-card via-navy/40 to-card shadow-[0_22px_60px_-28px_rgba(0,0,0,0.65)]"
    >
      <div className="relative h-[50vh] min-h-[280px] w-full shrink-0 overflow-hidden bg-black">
        <MeasurementMasterclassTour />
        <FeatureErrorBoundary
          title="3D mannequin failed"
          description="WebGL may be unavailable. Retry or use the region chips below."
        >
          <InteractiveMannequin
            className="absolute inset-0 touch-none"
            dismantling={dismantling}
          />
        </FeatureErrorBoundary>
      </div>
      <p className="border-t border-champagne/12 px-4 py-3 text-center font-sans text-[11px] font-light tracking-wide text-muted-foreground">
        Drag to rotate · Scroll to zoom · Tap a glowing region to open its lesson
      </p>
    </motion.div>
  );
}

/**
 * Measurements working dashboard — fills the viewport without a tall scroll void.
 * Canvas ~50vh; learning panels occupy the remaining flow. No h-[240vh] runway.
 */
export function MeasurementsView() {
  const hydrate = useMeasurementStore((s) => s.hydrate);
  const learnedCount = useMeasurementStore((s) => s.learnedIds.length);
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const dismantleScene = useCurtainTransitionStore((s) => s.dismantleScene);
  const [stageMounted, setStageMounted] = useState(true);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!dismantleScene) return;
    const id = window.setTimeout(() => setStageMounted(false), 220);
    return () => window.clearTimeout(id);
  }, [dismantleScene]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <JourneyGuideBanner feature="measurements" />
      <PageHeader
        eyebrow="Atelier masterclass"
        title="Measurements"
        description="Tap the dress form to open each measurement lesson — practice, mark learned, and move on."
        actions={<UnitToggle />}
      />

      <ol
        className="grid shrink-0 gap-3 sm:grid-cols-3"
        aria-label="How to use this page"
      >
        {[
          {
            n: 1,
            title: "Explore the form",
            body: "Drag the 3D dress form and tap a glowing region.",
          },
          {
            n: 2,
            title: "Open the lesson",
            body: "Read the editorial masterclass for that measurement.",
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
        className="glass-panel flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3.5"
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
            className="font-cinema text-base tracking-[0.18em]"
          >
            Explore the dress form
          </h2>
          <Sparkles className="size-3.5 text-primary" aria-hidden />
        </div>

        {stageMounted ? (
          <DashboardMannequinStage dismantling={dismantleScene} />
        ) : (
          <div
            className="relative h-[50vh] min-h-[280px] overflow-hidden rounded-[1.75rem] bg-black"
            aria-hidden
          />
        )}

        <FittingRoomControls />
      </section>

      <section
        className="flex min-h-0 flex-1 flex-col space-y-3"
        aria-labelledby="step-2-lesson"
      >
        <div className="flex items-center gap-2.5 px-0.5">
          <StepBadge n={2} />
          <h2
            id="step-2-lesson"
            className="font-cinema text-base tracking-[0.18em]"
          >
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
          <h2
            id="step-3-picker"
            className="font-cinema text-base tracking-[0.18em]"
          >
            Or choose from the list
          </h2>
          <ListChecks className="size-3.5 text-muted-foreground" aria-hidden />
        </div>
        <MeasurementPicker />
      </section>
    </div>
  );
}
