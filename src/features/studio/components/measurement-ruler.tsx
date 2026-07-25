"use client";

import { cn } from "@/lib/utils";

type MeasurementRulerProps = {
  /** Approximate centimetres represented across the short side. */
  spanCm?: number;
  className?: string;
};

/**
 * Measurement ruler drawn along the top and left edges of the workspace.
 * Scale is relative (teaching aid) — not a calibrated physical ruler.
 */
export function MeasurementRuler({
  spanCm = 40,
  className,
}: MeasurementRulerProps) {
  const ticks = Array.from({ length: spanCm + 1 }, (_, i) => i);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {/* Top ruler */}
      <div className="absolute inset-x-0 top-0 h-5 bg-black/35 text-[8px] text-white backdrop-blur-sm">
        <svg className="h-full w-full" preserveAspectRatio="none">
          {ticks.map((cm) => {
            const x = (cm / spanCm) * 100;
            const major = cm % 5 === 0;
            return (
              <g key={`t-${cm}`}>
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
                    {cm}
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
          {ticks.map((cm) => {
            const y = (cm / spanCm) * 100;
            const major = cm % 5 === 0;
            return (
              <g key={`l-${cm}`}>
                <line
                  x1={major ? 0 : 10}
                  y1={`${y}%`}
                  x2={20}
                  y2={`${y}%`}
                  stroke="white"
                  strokeWidth={major ? 1.2 : 0.6}
                  opacity={major ? 0.9 : 0.45}
                />
                {major && cm > 0 ? (
                  <text
                    x={3}
                    y={`${y}%`}
                    fill="white"
                    fontSize="6"
                    opacity="0.85"
                    dominantBaseline="middle"
                  >
                    {cm}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/90">
        Relative cm
      </span>
    </div>
  );
}
