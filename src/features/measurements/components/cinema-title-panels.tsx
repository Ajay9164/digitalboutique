"use client";

import { useMemo } from "react";
import {
  motion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  CINEMA_BEATS,
  beatOpacity,
  beatSlideX,
  beatSlideY,
  type CinemaBeat,
} from "@/features/measurements/data/cinema-narrative";
import { cn } from "@/lib/utils";

type CinemaTitlePanelsProps = {
  progress: MotionValue<number>;
  /** Hide until WebGL + loader finish. */
  narrativeReady: boolean;
  className?: string;
};

function sideClass(side: CinemaBeat["side"]): string {
  switch (side) {
    case "left":
      return "left-3 top-[18%] sm:left-5 sm:top-[20%] sm:max-w-[15.5rem]";
    case "right":
      return "right-3 top-[22%] sm:right-5 sm:top-[24%] sm:max-w-[15.5rem]";
    case "bottom-left":
      return "left-3 bottom-16 sm:left-5 sm:bottom-20 sm:max-w-[16rem]";
    case "bottom-right":
      return "right-3 bottom-16 sm:right-5 sm:bottom-20 sm:max-w-[16rem]";
    default:
      return "left-3 top-1/3";
  }
}

function CinemaTitleCard({
  beat,
  progress,
}: {
  beat: CinemaBeat;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, (t) => beatOpacity(t, beat));
  const x = useTransform(progress, (t) => beatSlideX(t, beat));
  const y = useTransform(progress, (t) => beatSlideY(t, beat));

  return (
    <motion.article
      style={{ opacity, x, y }}
      className={cn(
        "pointer-events-none absolute z-30 w-[min(78%,16rem)]",
        "rounded-2xl border border-champagne/80 bg-black/30 p-4 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.85)]",
        "backdrop-blur-2xl",
        sideClass(beat.side),
      )}
      aria-hidden={false}
    >
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-champagne/85">
        {beat.eyebrow}
      </p>
      <h3 className="font-cinema mt-2 text-[1.35rem] font-medium leading-[1.15] tracking-[0.14em] text-foreground sm:text-[1.5rem]">
        {beat.title}
      </h3>
      <p className="mt-2.5 font-sans text-[12px] font-light leading-relaxed tracking-wide text-foreground/75">
        {beat.body}
      </p>
    </motion.article>
  );
}

/**
 * Absolute glassmorphic title cards choreographed to scroll waypoints.
 * Serif cinema headings + modern sans body — no flat text blocks.
 */
export function CinemaTitlePanels({
  progress,
  narrativeReady,
  className,
}: CinemaTitlePanelsProps) {
  const beats = useMemo(() => CINEMA_BEATS, []);

  if (!narrativeReady) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-30", className)}
      aria-live="polite"
    >
      {beats.map((beat) => (
        <CinemaTitleCard key={beat.id} beat={beat} progress={progress} />
      ))}
    </div>
  );
}
