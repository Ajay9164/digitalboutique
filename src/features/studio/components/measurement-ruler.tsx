"use client";

import { useMemo } from "react";
import { useUnit } from "@/hooks/use-unit";
import { cmToDisplayNumber, getLabel } from "@/utils/units";
import { cn } from "@/lib/utils";

type MeasurementRulerProps = {
  /** Approximate centimetres represented across the short side (storage base). */
  spanCm?: number;
  className?: string;
};

/**
 * Measurement ruler drawn along the top and left edges of the workspace.
 * Tick labels follow the global `useUnitStore` unit (in / cm).
 * Scale is relative (teaching aid) — not a calibrated physical ruler.
 */
export function MeasurementRuler({
  spanCm = 40,
  className,
}: MeasurementRulerProps) {
  const { unit } = useUnit();
  const label = getLabel(unit);

  const { ticks, spanDisplay, majorEvery } = useMemo(() => {
    if (unit === "cm") {
      return {
        ticks: Array.from({ length: spanCm + 1 }, (_, i) => i),
        spanDisplay: spanCm,
        majorEvery: 5,
      };
    }
    // Inches: ~0.5" minor ticks across the same physical span.
    const spanIn = Math.max(1, Math.round(cmToDisplayNumber(spanCm, "in")));
    const steps = spanIn * 2; // half-inch ticks
    return {
      ticks: Array.from({ length: steps + 1 }, (_, i) => i * 0.5),
      spanDisplay: spanIn,
      majorEvery: 1,
    };
  }, [spanCm, unit]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {/* Top ruler */}
      <div className="absolute inset-x-0 top-0 h-5 bg-black/35 text-[8px] text-white backdrop-blur-sm">
        <svg className="h-full w-full" preserveAspectRatio="none">
          {ticks.map((tick) => {
            const x = (tick / spanDisplay) * 100;
            const major =
              unit === "cm"
                ? tick % majorEvery === 0
                : Number.isInteger(tick);
            return (
              <g key={`t-${tick}`}>
                <line
                  x1={`${x}%`}
                  y1={major ? 0 : 10}
                  x2={`${x}%`}
                  y2={20}
                  stroke="white"
                  strokeWidth={major ? 1.2 : 0.6}
                  opacity={major ? 0.9 : 0.45}
                />
                {major ? (
                  <text
                    x={`${x}%`}
                    y={9}
                    fill="white"
                    fontSize="7"
                    textAnchor="middle"
                    opacity="0.9"
                  >
                    {tick}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Left ruler */}
      <div className="absolute inset-y-0 left-0 w-5 bg-black/35 text-[8px] text-white backdrop-blur-sm">
        <svg className="h-full w-full" preserveAspectRatio="none">
          {ticks.map((tick) => {
            const y = (tick / spanDisplay) * 100;
            const major =
              unit === "cm"
                ? tick % majorEvery === 0
                : Number.isInteger(tick);
            return (
              <g key={`l-${tick}`}>
                <line
                  x1={major ? 0 : 10}
                  y1={`${y}%`}
                  x2={20}
                  y2={`${y}%`}
                  stroke="white"
                  strokeWidth={major ? 1.2 : 0.6}
                  opacity={major ? 0.9 : 0.45}
                />
                {major && tick > 0 ? (
                  <text
                    x={3}
                    y={`${y}%`}
                    fill="white"
                    fontSize="6"
                    opacity="0.85"
                    dominantBaseline="middle"
                  >
                    {tick}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/90">
        Relative {label}
      </span>
    </div>
  );
}
