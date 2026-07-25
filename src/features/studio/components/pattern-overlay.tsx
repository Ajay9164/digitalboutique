"use client";

import { useMemo } from "react";
import {
  PATTERN_MAP,
  PATTERN_VIEWBOX,
} from "@/features/studio/data/patterns";
import { useStudioStore } from "@/stores/studio-store";
import { cn } from "@/lib/utils";

type PatternOverlayProps = {
  className?: string;
};

/**
 * Responsive SVG neckline overlay — sized relative to the fabric frame
 * so it scales cleanly across phone and tablet viewports.
 */
export function PatternOverlay({ className }: PatternOverlayProps) {
  const patternId = useStudioStore((s) => s.patternId);
  const overlay = useStudioStore((s) => s.overlay);
  const pattern = PATTERN_MAP[patternId];

  const style = useMemo(
    () => ({
      width: "min(72%, 18rem)",
      aspectRatio: "1 / 1",
      opacity: overlay.opacity,
      transform: `translate(-50%, -50%) translate(${overlay.x}px, ${overlay.y}px) rotate(${overlay.rotation}deg) scale(${overlay.scale})`,
      transformOrigin: "center center",
    }),
    [overlay],
  );

  return (
    <div
      className={cn("pointer-events-none absolute left-1/2 top-1/2", className)}
      style={style}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${PATTERN_VIEWBOX.width} ${PATTERN_VIEWBOX.height}`}
        className="h-full w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
        preserveAspectRatio="xMidYMid meet"
      >
        {pattern.fill ? (
          <path d={pattern.fill} className="fill-primary/15" />
        ) : null}
        {pattern.guides?.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="text-white/50"
          />
        ))}
        {pattern.paths.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />
        ))}
      </svg>
    </div>
  );
}
