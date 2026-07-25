"use client";

import { motion } from "framer-motion";
import {
  PATTERNS,
  PATTERN_VIEWBOX,
  type PatternId,
} from "@/features/studio/data/patterns";
import { useStudioStore } from "@/stores/studio-store";
import { cn } from "@/lib/utils";

function PatternThumb({
  id,
  paths,
  fill,
  active,
}: {
  id: PatternId;
  paths: string[];
  fill?: string;
  active: boolean;
}) {
  return (
    <svg
      viewBox={`0 0 ${PATTERN_VIEWBOX.width} ${PATTERN_VIEWBOX.height}`}
      className="h-14 w-14"
      aria-hidden="true"
    >
      {fill ? (
        <path
          d={fill}
          className={active ? "fill-primary/20" : "fill-muted-foreground/15"}
        />
      ) : null}
      {paths.map((d) => (
        <path
          key={`${id}-${d.slice(0, 24)}`}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={active ? "text-primary" : "text-foreground/70"}
        />
      ))}
    </svg>
  );
}

export function PatternLibrary({ className }: { className?: string }) {
  const patternId = useStudioStore((s) => s.patternId);
  const setPattern = useStudioStore((s) => s.setPattern);

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Pattern library
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a neckline to overlay on your fabric photo.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PATTERNS.map((pattern) => {
          const active = patternId === pattern.id;
          return (
            <li key={pattern.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setPattern(pattern.id)}
                aria-pressed={active}
                className={cn(
                  "flex w-full flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition-colors",
                  active
                    ? "border-primary/50 bg-primary/8 shadow-sm"
                    : "border-border/60 bg-card/70 hover:bg-muted/60",
                )}
              >
                <PatternThumb
                  id={pattern.id}
                  paths={pattern.paths}
                  fill={pattern.fill}
                  active={active}
                />
                <span className="text-xs font-semibold tracking-tight">
                  {pattern.label}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
