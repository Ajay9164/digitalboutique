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
import { CinematicLoader } from "@/features/measurements/components/cinematic-loader";
import { CinemaTitlePanels } from "@/features/measurements/components/cinema-title-panels";
import { DigitalAtelierCta } from "@/features/measurements/components/digital-atelier-cta";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
import { useCurtainTransitionStore } from "@/stores/curtain-transition-store";

const InteractiveMannequin = dynamic(
  () => import("@/features/measurements/components/interactive-mannequin"),
  {
    ssr: false,
    loading: () => <CinematicLoader className="fixed inset-0 z-0" />,
  },
);

type CinemaScrollProps = {
  dismantling: boolean;
  cinemaMounted: boolean;
};

/**
 * Fixed full-bleed WebGL stage + tall scroll runway.
 * Canvas stays pinned (z-0); glass typography sticky-scrolls over it (z-10).
 */
function FullBleedCinema({ dismantling, cinemaMounted }: CinemaScrollProps) {
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
  const introOpacity = useTransform(smoothProgress, [0, 0.14], [1, 0]);
  const introY = useTransform(smoothProgress, [0, 0.14], [0, -24]);

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
    <>
      {/* Immersive 3D background — full viewport, pinned */}
      {cinemaMounted ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-0 h-screen w-screen bg-black"
          aria-hidden={dismantling || undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: dismantling ? 0 : 1 }}
          transition={{
            duration: dismantling ? 0.28 : 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <FeatureErrorBoundary
            title="3D mannequin failed"
            description="WebGL may be unavailable. Retry or open Measurements from the nav."
          >
            <InteractiveMannequin
              className="h-full w-full"
              scrollProgress={
                reduceMotion || dismantling ? undefined : smoothProgress
              }
              onReady={handleGlReady}
              dismantling={dismantling}
            />
          </FeatureErrorBoundary>
        </motion.div>
      ) : (
        <div
          className="fixed inset-0 z-0 h-screen w-screen bg-black"
          aria-hidden
        />
      )}

      {/* Scroll runway — typography floats over the fixed stage */}
      <section
        ref={trackRef}
        className="relative z-10 h-[240vh]"
        aria-label="Scroll-driven 3D mannequin cinema"
      >
        <div className="sticky top-0 z-10 flex h-screen w-full flex-col justify-end">
          {!reduceMotion && !dismantling ? (
            <CinemaTitlePanels
              progress={smoothProgress}
              narrativeReady={narrativeReady}
            />
          ) : null}

          <motion.div
            style={{ opacity: introOpacity, y: introY }}
            className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/55 via-transparent to-transparent px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]"
          >
            <div className="mx-auto max-w-xl space-y-2 text-center sm:max-w-2xl">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.42em] text-champagne/80">
                Tailor · Atelier overture
              </p>
              <h1 className="font-cinema text-3xl tracking-[0.14em] text-foreground drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] sm:text-5xl">
                The Living Form
              </h1>
              <p className="mx-auto max-w-md font-sans text-sm font-light leading-relaxed text-white/70 sm:text-base">
                Scroll the cinema. Watch craft become code. Then step into the
                Digital Atelier.
              </p>
            </div>
          </motion.div>

          {!reduceMotion && !dismantling ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16">
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
                <p className="pt-1 text-center font-sans text-[11px] font-light tracking-wide text-white/45">
                  Scroll to unlock each cinematic title · Then enter the atelier
                </p>
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <p className="text-center font-sans text-[11px] font-light tracking-wide text-white/45">
                Drag to rotate · Scroll the page to explore
              </p>
            </div>
          )}
        </div>
      </section>
    </>
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
    <div className="relative w-full">
      <FullBleedCinema
        dismantling={dismantleScene}
        cinemaMounted={cinemaMounted}
      />

      <div className="relative z-10 px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Curtain → router.push('/measurements') → (app) AppShell chrome */}
          <DigitalAtelierCta />
        </div>
      </div>
    </div>
  );
}
