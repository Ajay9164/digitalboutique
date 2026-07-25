"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ConstructionStepId } from "@/features/drafts/data/construction-steps";
import {
  DRAFT_VIEWBOX,
  type DraftGeometry,
} from "@/features/drafts/lib/draft-geometry";
import { cn } from "@/lib/utils";

type DraftBoardProps = {
  geometry: DraftGeometry;
  visible: Record<ConstructionStepId, boolean>;
  activeStep: ConstructionStepId;
  className?: string;
  /** Blueprint-style dual grid for the marking tutorial */
  premiumGrid?: boolean;
};

const drawTransition = { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const };

function DrawPath({
  d,
  active,
  show,
  dashed,
  reduceMotion,
}: {
  d: string;
  active: boolean;
  show: boolean;
  dashed?: boolean;
  reduceMotion?: boolean | null;
}) {
  if (!show) return null;
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.6 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? "5 4" : undefined}
      className={active ? "text-primary" : "text-foreground/75"}
      initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { ...drawTransition, delay: active ? 0.05 : 0 }
      }
    />
  );
}

function Label({
  x,
  y,
  text,
  show,
  active,
  reduceMotion,
}: {
  x: number;
  y: number;
  text: string;
  show: boolean;
  active: boolean;
  reduceMotion?: boolean | null;
}) {
  if (!show) return null;
  return (
    <motion.text
      x={x}
      y={y}
      className={cn(
        "fill-current text-[8px] font-semibold uppercase tracking-wider",
        active ? "text-primary" : "text-muted-foreground",
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { delay: 0.35, duration: 0.35 }
      }
    >
      {text}
    </motion.text>
  );
}

export function DraftBoard({
  geometry: g,
  visible,
  activeStep,
  className,
  premiumGrid = false,
}: DraftBoardProps) {
  const reduceMotion = useReducedMotion();
  const is = (id: ConstructionStepId) => activeStep === id;
  const pathProps = { reduceMotion };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/40 shadow-[0_18px_50px_-24px_rgba(15,23,28,0.35)] dark:border-white/10",
        premiumGrid
          ? "bg-[linear-gradient(160deg,oklch(0.97_0.01_185)_0%,oklch(0.94_0.02_200)_45%,oklch(0.92_0.015_185)_100%)] dark:bg-[linear-gradient(160deg,oklch(0.22_0.02_200)_0%,oklch(0.18_0.02_185)_100%)]"
          : "bg-gradient-to-b from-primary/8 via-card/75 to-muted/40 dark:from-primary/10",
        className,
      )}
    >
      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply dark:opacity-25 dark:mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 10%, transparent) 1px, transparent 0)",
          backgroundSize: "10px 10px",
        }}
      />
      {/* Fine blueprint grid */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          premiumGrid ? "opacity-50 dark:opacity-35" : "opacity-30 dark:opacity-20",
        )}
        style={{
          backgroundImage: premiumGrid
            ? [
                "linear-gradient(color-mix(in oklch, var(--primary) 18%, transparent) 1px, transparent 1px)",
                "linear-gradient(90deg, color-mix(in oklch, var(--primary) 18%, transparent) 1px, transparent 1px)",
                "linear-gradient(color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)",
                "linear-gradient(90deg, color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)",
              ].join(",")
            : "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 0)",
          backgroundSize: premiumGrid
            ? "48px 48px, 48px 48px, 12px 12px, 12px 12px"
            : "12px 12px",
        }}
      />

      <svg
        viewBox={`0 0 ${DRAFT_VIEWBOX.width} ${DRAFT_VIEWBOX.height}`}
        role="img"
        aria-label="Animated half-front blouse draft construction"
        className="relative z-10 h-[340px] w-full sm:h-[400px]"
      >
        <g
          stroke="currentColor"
          className="text-foreground/10"
          strokeWidth="0.4"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={20 + i * 22}
              y1={16}
              x2={20 + i * 22}
              y2={DRAFT_VIEWBOX.height - 16}
            />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={16}
              y1={20 + i * 20}
              x2={DRAFT_VIEWBOX.width - 16}
              y2={20 + i * 20}
            />
          ))}
        </g>

        <DrawPath
          d={`M ${g.centerTop.x} ${g.centerTop.y} L ${g.centerBottom.x} ${g.centerBottom.y}`}
          show={visible["center-line"]}
          active={is("center-line")}
          {...pathProps}
        />
        <Label
          x={g.centerTop.x + 5}
          y={g.centerTop.y + 12}
          text="CF"
          show={visible["center-line"]}
          active={is("center-line")}
          {...pathProps}
        />

        <DrawPath
          d={`M ${g.centerTop.x} ${g.bustEnd.y} L ${g.bustEnd.x} ${g.bustEnd.y}`}
          show={visible["bust-line"]}
          active={is("bust-line")}
          dashed
          {...pathProps}
        />
        <Label
          x={g.bustEnd.x + 4}
          y={g.bustEnd.y - 4}
          text="Bust"
          show={visible["bust-line"]}
          active={is("bust-line")}
          {...pathProps}
        />
        {visible["bust-line"] ? (
          <motion.circle
            cx={g.apex.x}
            cy={g.apex.y}
            r={is("bust-line") ? 3.2 : 2.4}
            className={is("bust-line") ? "fill-primary" : "fill-foreground/50"}
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : drawTransition}
          />
        ) : null}

        <DrawPath
          d={`M ${g.centerTop.x} ${g.waistEnd.y} L ${g.waistEnd.x} ${g.waistEnd.y}`}
          show={visible["waist-line"]}
          active={is("waist-line")}
          dashed
          {...pathProps}
        />
        <Label
          x={g.waistEnd.x + 4}
          y={g.waistEnd.y - 4}
          text="Waist"
          show={visible["waist-line"]}
          active={is("waist-line")}
          {...pathProps}
        />

        <DrawPath
          d={g.paths.neck}
          show={visible.neck}
          active={is("neck")}
          {...pathProps}
        />
        <Label
          x={g.neckDepth.x + 6}
          y={g.neckDepth.y + 10}
          text="Neck"
          show={visible.neck}
          active={is("neck")}
          {...pathProps}
        />

        <DrawPath
          d={`M ${g.neckOut.x} ${g.neckOut.y} L ${g.shoulderOut.x} ${g.shoulderOut.y}`}
          show={visible.shoulder}
          active={is("shoulder")}
          {...pathProps}
        />
        <Label
          x={g.shoulderOut.x - 22}
          y={g.shoulderOut.y - 6}
          text="Shoulder"
          show={visible.shoulder}
          active={is("shoulder")}
          {...pathProps}
        />

        <DrawPath
          d={g.paths.armhole}
          show={visible.armhole}
          active={is("armhole")}
          {...pathProps}
        />
        <Label
          x={g.underarm.x - 32}
          y={(g.shoulderOut.y + g.underarm.y) / 2}
          text="Armhole"
          show={visible.armhole}
          active={is("armhole")}
          {...pathProps}
        />

        <DrawPath
          d={g.paths.sideSeam}
          show={visible["side-seam"]}
          active={is("side-seam")}
          {...pathProps}
        />
        <Label
          x={g.waistEnd.x + 4}
          y={(g.underarm.y + g.waistEnd.y) / 2}
          text="Side"
          show={visible["side-seam"]}
          active={is("side-seam")}
          {...pathProps}
        />

        {visible.darts ? (
          <g>
            <DrawPath
              d={`M ${g.dartLeft.x} ${g.dartLeft.y} L ${g.dartTip.x} ${g.dartTip.y}`}
              show
              active={is("darts")}
              {...pathProps}
            />
            <DrawPath
              d={`M ${g.dartRight.x} ${g.dartRight.y} L ${g.dartTip.x} ${g.dartTip.y}`}
              show
              active={is("darts")}
              {...pathProps}
            />
            <motion.circle
              cx={g.dartTip.x}
              cy={g.dartTip.y}
              r={2.2}
              className={is("darts") ? "fill-primary" : "fill-foreground/50"}
              initial={reduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : drawTransition}
            />
            <Label
              x={g.dartTip.x + 6}
              y={g.dartTip.y + 12}
              text="Dart"
              show
              active={is("darts")}
              {...pathProps}
            />
          </g>
        ) : null}

        <DrawPath
          d={`M ${g.centerBottom.x} ${g.centerBottom.y} L ${g.hemEnd.x} ${g.hemEnd.y}`}
          show={visible.hem}
          active={is("hem")}
          {...pathProps}
        />
        <Label
          x={(g.centerBottom.x + g.hemEnd.x) / 2 - 8}
          y={g.hemEnd.y + 12}
          text="Hem"
          show={visible.hem}
          active={is("hem")}
          {...pathProps}
        />
      </svg>
    </div>
  );
}
