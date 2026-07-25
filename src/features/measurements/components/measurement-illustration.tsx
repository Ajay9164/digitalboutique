"use client";

import { motion } from "framer-motion";
import type { IllustrationOverlay } from "@/features/measurements/data/measurements";

/**
 * Minimal front-view figure schematic (viewBox 0 0 200 260) with an animated
 * overlay showing where the selected measurement is taken.
 */
export function MeasurementIllustration({
  overlay,
  title,
}: {
  overlay: IllustrationOverlay;
  title: string;
}) {
  return (
    <svg
      viewBox="0 0 200 260"
      role="img"
      aria-label={`Illustration: where to take the ${title} measurement`}
      className="h-44 w-auto"
    >
      {/* Figure outline */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-muted-foreground/50"
        strokeLinecap="round"
      >
        {/* Head + neck */}
        <circle cx="100" cy="18" r="12" />
        <path d="M 94 30 L 94 40 M 106 30 L 106 40" />
        {/* Torso */}
        <path d="M 94 40 C 76 44 62 48 58 56 C 66 74 70 84 66 104 C 60 128 64 142 70 156 C 76 172 74 182 72 196" />
        <path d="M 106 40 C 124 44 138 48 142 56 C 134 74 130 84 134 104 C 140 128 136 142 130 156 C 124 172 126 182 128 196" />
        <path d="M 72 196 Q 100 204 128 196" />
        {/* Bust hint */}
        <path d="M 84 86 Q 90 100 100 100 Q 110 100 116 86" className="text-muted-foreground/35" />
        {/* Arm (right side of figure) */}
        <path d="M 142 56 C 156 62 160 78 160 92 C 160 112 158 126 158 140" />
        <path d="M 152 60 C 150 78 150 96 150 112 C 150 126 152 134 154 140" />
        <path d="M 150 140 Q 154 146 158 140" />
      </g>

      {/* Measurement overlay */}
      <motion.g
        key={JSON.stringify(overlay)}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="text-primary"
      >
        {overlay.kind === "band" ? (
          <>
            <ellipse
              cx="100"
              cy={overlay.y}
              rx={overlay.halfWidth}
              ry={overlay.halfWidth * 0.18}
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <ellipse
              cx="100"
              cy={overlay.y}
              rx={overlay.halfWidth}
              ry={overlay.halfWidth * 0.18}
              fill="currentColor"
              opacity="0.12"
            />
          </>
        ) : null}
        {overlay.kind === "hline" ? (
          <line
            x1={overlay.x1}
            y1={overlay.y}
            x2={overlay.x2}
            y2={overlay.y}
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : null}
        {overlay.kind === "vline" ? (
          <line
            x1={overlay.x}
            y1={overlay.y1}
            x2={overlay.x}
            y2={overlay.y2}
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : null}
        {overlay.kind === "curve" ? (
          <path
            d={overlay.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : null}
        {overlay.kind === "dot" ? (
          <>
            <circle cx={overlay.x} cy={overlay.y} r="5" fill="currentColor" />
            <circle
              cx={overlay.x}
              cy={overlay.y}
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.5"
            />
          </>
        ) : null}
      </motion.g>
    </svg>
  );
}
