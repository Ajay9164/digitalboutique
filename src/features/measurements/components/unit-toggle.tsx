"use client";

import { motion } from "framer-motion";
import { useMeasurementStore, type MeasurementUnit } from "@/stores/measurement-store";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: MeasurementUnit; label: string }> = [
  { value: "in", label: "Inches" },
  { value: "cm", label: "Centimeters" },
];

export function UnitToggle({ className }: { className?: string }) {
  const unit = useMeasurementStore((s) => s.unit);
  const setUnit = useMeasurementStore((s) => s.setUnit);

  return (
    <div
      role="radiogroup"
      aria-label="Measurement unit"
      className={cn(
        "inline-flex items-center rounded-full bg-muted/70 p-1 ring-1 ring-border/60",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = unit === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setUnit(option.value)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId="unit-pill"
                className="absolute inset-0 rounded-full bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
