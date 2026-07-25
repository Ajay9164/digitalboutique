"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
  delay = 0,
}: DashboardCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }
      }
      className={cn("glass-panel rounded-3xl p-4", className)}
    >
      <header className="mb-3 flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </header>
      {children}
    </motion.section>
  );
}

export function AnimatedMeter({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const reduceMotion = useReducedMotion();
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value}/{max}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 90, damping: 18 }
          }
        />
      </div>
    </div>
  );
}
