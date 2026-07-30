"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useProgress } from "@react-three/drei";
import { cn } from "@/lib/utils";

type CinematicLoaderProps = {
  /** When true, fades out (3D scene mounted). */
  dismiss?: boolean;
  className?: string;
};

/**
 * Premium WebGL pre-loader — deep black, pulsing champagne gold ring,
 * wide-tracked INITIALIZING ATELIER copy. Suspense fallback + mount overlay.
 */
export function CinematicLoader({
  dismiss = false,
  className,
}: CinematicLoaderProps) {
  const reduceMotion = useReducedMotion();
  const { progress: tracked, active } = useProgress();
  const [fake, setFake] = useState(8);

  useEffect(() => {
    if (dismiss || reduceMotion) return;
    const id = window.setInterval(() => {
      setFake((p) => {
        if (p >= 90) return p;
        return Math.min(90, p + 2 + Math.random() * 6);
      });
    }, 180);
    return () => window.clearInterval(id);
  }, [dismiss, reduceMotion]);

  const fromManager = active || tracked > 0 ? tracked : 0;
  const display = dismiss
    ? 100
    : Math.min(99, Math.max(Math.round(fromManager), Math.round(fake)));

  return (
    <AnimatePresence>
      {!dismiss ? (
        <motion.div
          key="cinematic-loader"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={`Initializing atelier, ${display} percent`}
          className={cn(
            "absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black",
            className,
          )}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: reduceMotion ? 0.12 : 0.9,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
        >
          <div className="relative flex size-28 items-center justify-center sm:size-32">
            {!reduceMotion ? (
              <span
                className="absolute inset-0 animate-ping rounded-full bg-champagne/15"
                style={{ animationDuration: "2.4s" }}
                aria-hidden
              />
            ) : null}
            <span
              className="absolute inset-0 rounded-full border border-champagne/20"
              aria-hidden
            />
            <motion.span
              className="absolute inset-[10%] rounded-full border border-champagne/55 shadow-[0_0_32px_color-mix(in_oklch,var(--champagne)_55%,transparent)]"
              animate={
                reduceMotion
                  ? { opacity: 0.8 }
                  : { opacity: [0.35, 1, 0.35], scale: [0.96, 1.04, 0.96] }
              }
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              aria-hidden
            />
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0 size-full"
              aria-hidden
            >
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--champagne)"
                strokeWidth="0.55"
                strokeLinecap="round"
                strokeDasharray="72 220"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                style={{ transformOrigin: "50px 50px" }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.svg>
            <span className="font-sans text-[11px] font-medium tabular-nums tracking-[0.22em] text-champagne">
              {display}%
            </span>
          </div>

          <div className="space-y-2 text-center">
            <motion.p
              className="font-cinema text-sm tracking-[0.35em] text-champagne sm:text-base"
              animate={
                reduceMotion ? { opacity: 1 } : { opacity: [0.5, 1, 0.5] }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              INITIALIZING ATELIER…
            </motion.p>
            <p className="font-sans text-[10px] font-light uppercase tracking-[0.42em] text-white/40">
              WebGL · Lighting · Form
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
