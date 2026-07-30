"use client";

import { useMeasurementStore } from "@/stores/measurement-store";
import {
  MEASUREMENT_MAP,
  type MeasurementId,
} from "@/features/measurements/data/measurements";
import { useUnit } from "@/hooks/use-unit";
import { formatRangeCm } from "@/utils/units";
import { cn } from "@/lib/utils";

type Mannequin2DFallbackProps = {
  className?: string;
  message?: string;
};

/**
 * Premium SVG dress-form used when WebGL context is lost or unavailable.
 * Regions remain clickable so learning continues without 3D.
 * Badges show typical ranges in the active global unit.
 */
export function Mannequin2DFallback({
  className,
  message = "3D View Unavailable — Using 2D Mode",
}: Mannequin2DFallbackProps) {
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const select = useMeasurementStore((s) => s.select);
  const { unit } = useUnit();

  const hotspots: Array<{
    id: MeasurementId;
    cx: number;
    cy: number;
    r: number;
    label: string;
  }> = [
    { id: "neck", cx: 100, cy: 28, r: 10, label: "Neck" },
    { id: "shoulder", cx: 128, cy: 52, r: 12, label: "Shoulder" },
    { id: "bust", cx: 100, cy: 78, r: 22, label: "Bust" },
    { id: "waist", cx: 100, cy: 118, r: 18, label: "Waist" },
    { id: "hip", cx: 100, cy: 152, r: 20, label: "Hip" },
    { id: "blouse-length", cx: 68, cy: 100, r: 11, label: "Length" },
  ];

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col items-center justify-center bg-gradient-to-b from-muted/50 via-card/40 to-muted/30",
        className,
      )}
      role="img"
      aria-label="2D mannequin fallback. Tap a glowing region to open its measurement lesson."
    >
      <div className="absolute inset-x-0 top-3 z-10 flex justify-center px-3">
        <p className="glass-panel rounded-full px-3 py-1.5 text-center text-[11px] font-semibold tracking-wide text-muted-foreground">
          {message}
        </p>
      </div>

      <svg
        viewBox="0 0 200 220"
        className="h-[min(42vh,360px)] w-full max-w-sm"
        style={{ touchAction: "pan-y" }}
        aria-hidden={false}
      >
        <defs>
          <linearGradient id="formFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4EFE6" />
            <stop offset="100%" stopColor="#E4D9C8" />
          </linearGradient>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stand */}
        <rect x="96" y="175" width="8" height="28" rx="2" fill="#2A2E34" />
        <ellipse cx="100" cy="206" rx="28" ry="6" fill="#2A2E34" opacity="0.85" />

        {/* Dress form silhouette */}
        <path
          d="M100 22
             C112 22 118 28 118 36
             C118 42 114 46 110 48
             L128 58
             C132 72 134 88 130 102
             C126 118 122 132 118 148
             C114 162 110 172 100 172
             C90 172 86 162 82 148
             C78 132 74 118 70 102
             C66 88 68 72 72 58
             L90 48
             C86 46 82 42 82 36
             C82 28 88 22 100 22 Z"
          fill="url(#formFill)"
          stroke="#D4C7B4"
          strokeWidth="1.2"
        />

        {hotspots.map((spot) => {
          const active = selectedId === spot.id;
          const range = MEASUREMENT_MAP[spot.id]?.typicalRangeCm;
          const rangeLabel = range ? formatRangeCm(range, unit) : null;
          return (
            <g key={spot.id}>
              <circle
                cx={spot.cx}
                cy={spot.cy}
                r={spot.r}
                fill={active ? "#2DD4BF" : "#6FA89E"}
                fillOpacity={active ? 0.35 : 0.18}
                stroke={active ? "#2DD4BF" : "#4FB3A1"}
                strokeWidth={active ? 2.4 : 1.6}
                filter="url(#softGlow)"
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={
                  rangeLabel
                    ? `Select ${spot.label}, typical ${rangeLabel}`
                    : `Select ${spot.label}`
                }
                onClick={() => select(active ? null : spot.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    select(active ? null : spot.id);
                  }
                }}
              />
              <text
                x={spot.cx}
                y={spot.cy + (rangeLabel ? 0 : 3)}
                textAnchor="middle"
                className="pointer-events-none fill-foreground text-[7px] font-semibold"
              >
                {spot.label}
              </text>
              {rangeLabel ? (
                <text
                  x={spot.cx}
                  y={spot.cy + 8}
                  textAnchor="middle"
                  className="pointer-events-none fill-foreground/75 text-[5px] font-medium"
                >
                  {rangeLabel}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <p className="px-4 pb-3 text-center text-[11px] text-muted-foreground">
        Tap a glowing region — lessons work the same in 2D mode.
      </p>
    </div>
  );
}
