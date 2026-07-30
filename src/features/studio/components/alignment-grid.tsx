"use client";

import { useUnit } from "@/hooks/use-unit";
import { formatMeasurement, getLabel } from "@/utils/units";
import { cn } from "@/lib/utils";

type AlignmentGridProps = {
  cols?: number;
  rows?: number;
  className?: string;
};

/**
 * Studio fabric alignment grid — rule-of-thirds + fine mesh.
 * Scale chip follows the global unit engine (in / cm).
 */
export function AlignmentGrid({
  cols = 8,
  rows = 10,
  className,
}: AlignmentGridProps) {
  const { unit } = useUnit();
  const label = getLabel(unit);
  const cellHint =
    unit === "cm"
      ? `≈${formatMeasurement(2, "cm")} ${label}`
      : `≈${formatMeasurement(2, "in")} ${label}`;


  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {/* Rule of thirds + fine grid */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)
          `,
          backgroundSize: `${100 / cols}% ${100 / rows}%`,
        }}
      />
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-primary/55" />
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary/55" />
      <div className="absolute inset-y-0 left-1/3 w-px bg-white/35" />
      <div className="absolute inset-y-0 left-2/3 w-px bg-white/35" />
      <div className="absolute inset-x-0 top-1/3 h-px bg-white/35" />
      <div className="absolute inset-x-0 top-2/3 h-px bg-white/35" />

      <span className="absolute left-6 top-6 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
        Grid {label} · cell {cellHint}
      </span>
    </div>
  );
}
