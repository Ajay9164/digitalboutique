"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
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

/** Draw-on chalk stroke — 1.5s ease-in-out as specified for Phase 3. */
const drawTransition = {
  duration: 1.5,
  ease: [0.42, 0, 0.58, 1] as const,
};

/** Tiny formula tooltips that fade in after the stroke finishes. */
const labelTransition = {
  delay: 1.15,
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

const FORMULA_LABELS: Record<ConstructionStepId, string> = {
  "center-line": "Blouse Length",
  "bust-line": 'Bust/4 + 1.5"',
  "waist-line": "Waist/4",
  neck: "Neck/6 + 0.5\"",
  shoulder: "Shoulder + Drop",
  armhole: 'Bust/4 − 1.5"',
  "side-seam": "Underarm → Hem",
  darts: "Bust¼ − Waist¼",
  hem: "Hem Level",
};

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
      strokeWidth={active ? 2.8 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? "5 4" : undefined}
      className={active ? "text-primary" : "text-foreground/70"}
      initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { ...drawTransition, delay: active ? 0.04 : 0 }
      }
    />
  );
}

function FormulaLabel({
  x,
  y,
  stepId,
  show,
  active,
  reduceMotion,
  anchor = "start",
}: {
  x: number;
  y: number;
  stepId: ConstructionStepId;
  show: boolean;
  active: boolean;
  reduceMotion?: boolean | null;
  anchor?: "start" | "middle" | "end";
}) {
  if (!show) return null;
  return (
    <motion.g
      initial={reduceMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : labelTransition}
    >
      <rect
        x={anchor === "end" ? x - 52 : anchor === "middle" ? x - 26 : x - 2}
        y={y - 9}
        width={54}
        height={12}
        rx={3}
        className={
          active
            ? "fill-primary/15 stroke-primary/35"
            : "fill-card/80 stroke-border/50"
        }
        strokeWidth={0.5}
      />
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        className={cn(
          "fill-current text-[6.5px] font-semibold tracking-wide",
          active ? "text-primary" : "text-foreground/75",
        )}
      >
        {FORMULA_LABELS[stepId]}
      </text>
    </motion.g>
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
        "relative overflow-hidden rounded-3xl",
        /* Cutting-table glass edge + inner shadow */
        "border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-12px_28px_-18px_rgba(15,23,28,0.18),0_22px_50px_-28px_rgba(15,23,28,0.4)]",
        "dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-14px_32px_-16px_rgba(0,0,0,0.45),0_22px_50px_-28px_rgba(0,0,0,0.55)]",
        premiumGrid
          ? "bg-[linear-gradient(165deg,oklch(0.975_0.008_185)_0%,oklch(0.945_0.016_200)_48%,oklch(0.92_0.012_185)_100%)] dark:bg-[linear-gradient(165deg,oklch(0.24_0.018_200)_0%,oklch(0.18_0.016_185)_100%)]"
          : "bg-gradient-to-b from-primary/8 via-card/75 to-muted/40 dark:from-primary/10",
        className,
      )}
    >
      {/* Soft table wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_55%)]"
      />

      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply dark:opacity-20 dark:mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 10%, transparent) 1px, transparent 0)",
          backgroundSize: "10px 10px",
        }}
      />

      {/* Engineering / cutting-table dual grid */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          premiumGrid ? "opacity-55 dark:opacity-40" : "opacity-30 dark:opacity-20",
        )}
        style={{
          backgroundImage: premiumGrid
            ? [
                "linear-gradient(color-mix(in oklch, var(--primary) 20%, transparent) 1px, transparent 1px)",
                "linear-gradient(90deg, color-mix(in oklch, var(--primary) 20%, transparent) 1px, transparent 1px)",
                "linear-gradient(color-mix(in oklch, var(--foreground) 9%, transparent) 1px, transparent 1px)",
                "linear-gradient(90deg, color-mix(in oklch, var(--foreground) 9%, transparent) 1px, transparent 1px)",
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
        aria-label="Animated blouse draft construction — chalk lines draw as you advance steps"
        className="relative z-10 h-[min(52vh,420px)] w-full min-h-[300px]"
      >
        <DrawPath
          d={`M ${g.centerTop.x} ${g.centerTop.y} L ${g.centerBottom.x} ${g.centerBottom.y}`}
          show={visible["center-line"]}
          active={is("center-line")}
          {...pathProps}
        />
        <FormulaLabel
          x={g.centerTop.x + 6}
          y={g.centerTop.y + 14}
          stepId="center-line"
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
        <FormulaLabel
          x={g.bustEnd.x + 4}
          y={g.bustEnd.y - 5}
          stepId="bust-line"
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
        <FormulaLabel
          x={g.waistEnd.x + 4}
          y={g.waistEnd.y - 5}
          stepId="waist-line"
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
        <FormulaLabel
          x={g.neckDepth.x + 8}
          y={g.neckDepth.y + 12}
          stepId="neck"
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
        <FormulaLabel
          x={g.shoulderOut.x - 4}
          y={g.shoulderOut.y - 8}
          stepId="shoulder"
          show={visible.shoulder}
          active={is("shoulder")}
          anchor="end"
          {...pathProps}
        />

        <DrawPath
          d={g.paths.armhole}
          show={visible.armhole}
          active={is("armhole")}
          {...pathProps}
        />
        <FormulaLabel
          x={g.underarm.x - 4}
          y={(g.shoulderOut.y + g.underarm.y) / 2}
          stepId="armhole"
          show={visible.armhole}
          active={is("armhole")}
          anchor="end"
          {...pathProps}
        />

        <DrawPath
          d={g.paths.sideSeam}
          show={visible["side-seam"]}
          active={is("side-seam")}
          {...pathProps}
        />
        <FormulaLabel
          x={g.waistEnd.x + 4}
          y={(g.underarm.y + g.waistEnd.y) / 2}
          stepId="side-seam"
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
            <FormulaLabel
              x={g.dartTip.x + 6}
              y={g.dartTip.y + 14}
              stepId="darts"
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
        <FormulaLabel
          x={(g.centerBottom.x + g.hemEnd.x) / 2}
          y={g.hemEnd.y + 14}
          stepId="hem"
          show={visible.hem}
          active={is("hem")}
          anchor="middle"
          {...pathProps}
        />
      </svg>
    </div>
  );
}
