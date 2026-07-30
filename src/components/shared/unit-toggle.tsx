"use client";

import { motion } from "framer-motion";
import { useIsMounted } from "@/hooks/use-mounted";
import { useShallow } from "zustand/react/shallow";
import { useUnitStore, type UnitSystem } from "@/stores/unit-store";
import { getLabel } from "@/utils/units";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: UnitSystem; label: string; short: string }> = [
  { value: "in", label: "Inches", short: "IN" },
  { value: "cm", label: "CM", short: "CM" },
];

type UnitToggleProps = {
  className?: string;
  /** Compact header chip (IN | CM) vs full labels (Inches | CM). */
  compact?: boolean;
};

/**
 * Glassmorphic global unit switch — reads/writes `useUnitStore`
 * so the preference persists offline across every atelier page.
 */
export function UnitToggle({ className, compact = false }: UnitToggleProps) {
  const mounted = useIsMounted();
  const { hydrated, unit, setUnit } = useUnitStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      unit: s.unit,
      setUnit: s.setUnit,
    })),
  );
  const ready = mounted && hydrated;

  return (
    <div
      role="radiogroup"
      aria-label="Measurement unit"
      aria-busy={!ready}
      className={cn(
        "inline-flex items-center rounded-full border border-champagne/25",
        "bg-white/[0.06] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = ready && unit === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={
              option.value === "in" ? "Inches" : "Centimeters"
            }
            disabled={!ready}
            onClick={() => setUnit(option.value)}
            className={cn(
              "relative rounded-full text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
              compact ? "px-2.5 py-1.5" : "px-3.5 py-1.5 text-xs tracking-wide",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              !ready && "opacity-60",
            )}
          >
            {active ? (
              <motion.span
                layoutId="global-unit-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-champagne via-[color-mix(in_oklch,var(--champagne)_85%,var(--neon))] to-champagne shadow-[0_0_20px_-6px_color-mix(in_oklch,var(--champagne)_55%,transparent)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                aria-hidden
              />
            ) : null}
            <span className="relative z-10">
              {compact ? option.short : option.label}
            </span>
          </button>
        );
      })}
      <span className="sr-only">Active unit: {getLabel(unit)}</span>
    </div>
  );
}
