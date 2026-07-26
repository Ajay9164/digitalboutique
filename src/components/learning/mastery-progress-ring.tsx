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
 * Circular SVG progress ring — Level + title from IndexedDB-backed Tailor Points.
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

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      title={`Level ${ring.level}: ${ring.title} · ${ring.totalXp} XP · ${modulesCompleted} modules`}
      aria-label={`Level ${ring.level}: ${ring.title}. ${Math.round(ring.progress * 100)} percent to next level. ${ring.totalXp} Tailor Points.`}
      role="img"
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/60"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="text-primary"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 22 }
          }
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-[11px] font-bold tabular-nums text-foreground">
        {ring.level}
      </span>
    </div>
  );
}
