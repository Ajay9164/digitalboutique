"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { resolveMastery } from "@/features/learning/lib/mastery";
import { useMasteryStore } from "@/stores/mastery-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type MasteryProgressRingProps = {
  className?: string;
  size?: number;
};

/**
 * Holographic mastery ring — champagne progress arc with conic light sweep.
 * CSS / Framer Motion only (keeps Three.js out of the header bundle).
 */
export function MasteryProgressRing({
  className,
  size = 40,
}: MasteryProgressRingProps) {
  const hydrate = useMasteryStore((s) => s.hydrate);
  const totalXp = useMasteryStore((s) => s.totalXp);
  const modulesCompleted = useMasteryStore((s) => s.modulesCompleted);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const ring = useMemo(
    () => resolveMastery(totalXp, modulesCompleted),
    [totalXp, modulesCompleted],
  );

  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ring.progress);
  const gradientId = `mastery-holo-${size}`;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-visible",
        className,
      )}
      style={{ width: size, height: size }}
      title={`Level ${ring.level}: ${ring.title} · ${ring.totalXp} XP · ${modulesCompleted} modules`}
      aria-label={`Level ${ring.level}: ${ring.title}. ${Math.round(ring.progress * 100)} percent to next level. ${ring.totalXp} Tailor Points.`}
      role="img"
    >
      {/* Holographic aura */}
      <span
        className={cn(
          "pointer-events-none absolute -inset-1 rounded-full opacity-70 blur-[6px]",
          "holo-sheen",
          !reduceMotion && "animate-[holo-spin_8s_linear_infinite]",
        )}
        style={{ opacity: 0.35 + ring.progress * 0.35 }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-[2px] rounded-full bg-card/90"
        aria-hidden
      />

      <svg width={size} height={size} className="relative -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--champagne)" stopOpacity="1" />
            <stop offset="45%" stopColor="var(--neon)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--champagne)" stopOpacity="1" />
          </linearGradient>
          <filter id={`${gradientId}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="color-mix(in oklch, var(--champagne) 18%, transparent)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={`url(#${gradientId}-glow)`}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 22 }
          }
        />
      </svg>

      {!reduceMotion ? (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklch, var(--champagne) 45%, transparent) 28deg, transparent 55deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5.5, ease: "linear", repeat: Infinity }}
          aria-hidden
        />
      ) : null}

      <span className="absolute inset-0 flex items-center justify-center font-display text-[11px] font-bold tabular-nums text-primary">
        {ring.level}
      </span>
    </div>
  );
}
