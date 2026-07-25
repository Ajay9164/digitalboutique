"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { MEASUREMENTS } from "@/features/measurements/data/measurements";
import { LearningCard } from "@/features/measurements/components/learning-card";
import { MeasurementPicker } from "@/features/measurements/components/measurement-picker";
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
      <Skeleton className="h-[420px] w-full rounded-3xl sm:h-[480px]" />
    ),
  },
);

export function MeasurementsView() {
  const hydrate = useMeasurementStore((s) => s.hydrate);
  const learnedCount = useMeasurementStore((s) => s.learnedIds.length);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="space-y-6">
      <JourneyGuideBanner feature="measurements" />
      <PageHeader
        eyebrow="Learning studio"
        title="Measurements"
        description="Tap any region on the mannequin — or a chip below — to open its full tailoring lesson."
        actions={<UnitToggle />}
      />

      {/* Progress */}
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
              animate={{ width: `${(learnedCount / MEASUREMENTS.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </motion.div>

      {/* 3D mannequin */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-b from-muted/60 via-card/60 to-muted/40 shadow-[0_18px_50px_-24px_rgba(15,23,28,0.4)] dark:border-white/10"
      >
        <FeatureErrorBoundary
          title="3D mannequin failed"
          description="WebGL may be unavailable. Retry or use the region chips below."
        >
          <InteractiveMannequin className="h-[420px] w-full touch-none sm:h-[480px]" />
        </FeatureErrorBoundary>
        <p className="border-t border-border/50 px-4 py-2.5 text-center text-[11px] text-muted-foreground">
          Drag to rotate · Pinch or scroll to zoom · Two-finger drag to pan
        </p>
      </motion.div>

      {/* Learning card */}
      <LearningCard />

      {/* Region picker */}
      <MeasurementPicker />
    </div>
  );
}
