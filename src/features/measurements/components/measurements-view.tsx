"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { GraduationCap, ListChecks, Sparkles } from "lucide-react";
import { MEASUREMENTS } from "@/features/measurements/data/measurements";
import { LearningCard } from "@/features/measurements/components/learning-card";
import { MeasurementPicker } from "@/features/measurements/components/measurement-picker";
import { MeasurementMasterclassTour } from "@/features/measurements/components/measurement-masterclass-tour";
import { FittingRoomControls } from "@/features/measurements/components/fitting-room-controls";
import { CinematicLoader } from "@/features/measurements/components/cinematic-loader";
import { CinemaTitlePanels } from "@/features/measurements/components/cinema-title-panels";
import { DigitalAtelierCta } from "@/features/measurements/components/digital-atelier-cta";
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
 * Tall scroll track + sticky WebGL stage. Scroll progress is the cinema timeline.
 * Parent unmounts this entire tree on curtain-drop so useScroll + Three.js release.
 */
function ScrollCinemaStage({ dismantling }: { dismantling: boolean }) {
  const trackRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [glReady, setGlReady] = useState(false);
  const [narrativeReady, setNarrativeReady] = useState(false);
  const minLoadDone = useRef(false);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.35,
    restDelta: 0.001,
  });
  const progressLabel = useTransform(smoothProgress, (v) =>
    `${Math.round(v * 100)}%`,
  );
  const progressWidth = useTransform(smoothProgress, (v) => `${v * 100}%`);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      minLoadDone.current = true;
      if (glReady) setNarrativeReady(true);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [glReady]);

  const handleGlReady = useCallback(() => {
    setGlReady(true);
    if (minLoadDone.current) setNarrativeReady(true);
  }, []);

  useEffect(() => {
    if (glReady && minLoadDone.current) setNarrativeReady(true);
  }, [glReady]);

  return (
    <section
      ref={trackRef}
      className="relative h-[240vh]"
      aria-label="Scroll-driven 3D mannequin cinema"
      aria-hidden={dismantling || undefined}
    >
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 sm:top-[calc(4rem+env(safe-area-inset-top))]">
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
          <div className="relative h-[min(70vh,600px)] min-h-[400px] w-full shrink-0 overflow-hidden bg-black">
            <MeasurementMasterclassTour />
            <FeatureErrorBoundary
              title="3D mannequin failed"
              description="WebGL may be unavailable. Retry or use the region chips below."
            >
              <InteractiveMannequin
                className="absolute inset-0 touch-none"
                scrollProgress={
                  reduceMotion || dismantling ? undefined : smoothProgress
                }
                onReady={handleGlReady}
                dismantling={dismantling}
              />
            </FeatureErrorBoundary>

            {!reduceMotion && !dismantling ? (
              <CinemaTitlePanels
                progress={smoothProgress}
                narrativeReady={narrativeReady}
              />
            ) : null}

            {!reduceMotion && !dismantling ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 via-black/15 to-transparent px-4 pb-3 pt-10">
                <div className="mx-auto flex max-w-sm flex-col gap-1.5">
                  <div className="flex items-center justify-between font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-champagne/80">
                    <span>Cinema scrub</span>
                    <motion.span aria-hidden>{progressLabel}</motion.span>
                  </div>
                  <div
                    className="h-1 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="3D camera fly-through progress"
                  >
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-champagne via-neon to-champagne"
                      style={{ width: progressWidth }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <p className="border-t border-champagne/12 px-4 py-3 text-center font-sans text-[11px] font-light tracking-wide text-muted-foreground">
            {reduceMotion
              ? "Drag to rotate · Scroll to zoom · Morph body · Drape Studio fabric"
              : "Scroll to unlock each cinematic title · Tap a glowing region"}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function MeasurementsView() {
  const hydrate = useMeasurementStore((s) => s.hydrate);
  const learnedCount = useMeasurementStore((s) => s.learnedIds.length);
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const dismantleScene = useCurtainTransitionStore((s) => s.dismantleScene);
  const [cinemaMounted, setCinemaMounted] = useState(true);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Curtain drop: fade visuals, then hard-unmount WebGL + scroll cinema.
  useEffect(() => {
    if (!dismantleScene) return;
    const id = window.setTimeout(() => setCinemaMounted(false), 220);
    return () => window.clearTimeout(id);
  }, [dismantleScene]);

  return (
    <div className="space-y-8">
      <JourneyGuideBanner feature="measurements" />
      <PageHeader
        eyebrow="Atelier masterclass"
        title="Measurements"
        description="A guided textbook for absolute beginners — scroll to fly the camera, tap to learn every body measurement."
        actions={<UnitToggle />}
      />

      <ol
        className="grid gap-3 sm:grid-cols-3"
        aria-label="How to use this page"
      >
        {[
          {
            n: 1,
            title: "Scroll the cinema",
            body: "Fly the camera around the dress form on a cinematic path.",
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
            className="font-cinema text-base tracking-[0.18em]"
          >
            Explore the dress form
          </h2>
          <Sparkles className="size-3.5 text-primary" aria-hidden />
        </div>

        {cinemaMounted ? (
          <ScrollCinemaStage dismantling={dismantleScene} />
        ) : (
          <div
            className="relative h-[min(70vh,600px)] min-h-[400px] overflow-hidden rounded-[1.75rem] bg-black"
            aria-hidden
          />
        )}

        <FittingRoomControls />
      </section>

      <section className="space-y-3" aria-labelledby="step-2-lesson">
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

      <DigitalAtelierCta />
    </div>
  );
}
