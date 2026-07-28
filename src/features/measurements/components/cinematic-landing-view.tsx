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
import { MeasurementMasterclassTour } from "@/features/measurements/components/measurement-masterclass-tour";
import { CinematicLoader } from "@/features/measurements/components/cinematic-loader";
import { CinemaTitlePanels } from "@/features/measurements/components/cinema-title-panels";
import { DigitalAtelierCta } from "@/features/measurements/components/digital-atelier-cta";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
import { useCurtainTransitionStore } from "@/stores/curtain-transition-store";

const InteractiveMannequin = dynamic(
  () => import("@/features/measurements/components/interactive-mannequin"),
  {
    ssr: false,
    loading: () => <CinematicLoader />,
  },
);

/**
 * Root cinematic landing — the ONLY place with a tall scroll runway.
 * Scroll progress drives the mannequin fly-through; CTA curtain-drops into the atelier.
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
          <div className="relative h-[min(70vh,600px)] min-h-[320px] w-full shrink-0 overflow-hidden bg-black">
            <MeasurementMasterclassTour />
            <FeatureErrorBoundary
              title="3D mannequin failed"
              description="WebGL may be unavailable. Retry or open Measurements from the nav."
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
              ? "Drag to rotate · Scroll to zoom"
              : "Scroll to unlock each cinematic title · Then enter the atelier"}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function CinematicLandingView() {
  const dismantleScene = useCurtainTransitionStore((s) => s.dismantleScene);
  const [cinemaMounted, setCinemaMounted] = useState(true);

  useEffect(() => {
    if (!dismantleScene) return;
    const id = window.setTimeout(() => setCinemaMounted(false), 220);
    return () => window.clearTimeout(id);
  }, [dismantleScene]);

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.42em] text-champagne/80">
          Tailor · Atelier overture
        </p>
        <h1 className="font-cinema text-3xl tracking-[0.14em] text-foreground sm:text-4xl">
          The Living Form
        </h1>
        <p className="mx-auto max-w-md font-sans text-sm font-light leading-relaxed text-muted-foreground">
          Scroll the cinema. Watch craft become code. Then step into the Digital
          Atelier.
        </p>
      </header>

      {cinemaMounted ? (
        <ScrollCinemaStage dismantling={dismantleScene} />
      ) : (
        <div
          className="relative h-[min(70vh,600px)] min-h-[320px] overflow-hidden rounded-[1.75rem] bg-black"
          aria-hidden
        />
      )}

      <DigitalAtelierCta href="/measurements" />
    </div>
  );
}
