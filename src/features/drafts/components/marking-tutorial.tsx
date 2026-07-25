"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import {
  CONSTRUCTION_STEPS,
  type ConstructionStep,
  type ConstructionStepId,
} from "@/features/drafts/data/construction-steps";
import {
  DEFAULT_DRAFTING_INPUTS,
  SAMPLE_BODY,
} from "@/features/drafts/data/formulas";
import { DraftBoard } from "@/features/drafts/components/draft-board";
import {
  buildDraftGeometry,
  stepLineVisibility,
} from "@/features/drafts/lib/draft-geometry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Journey focus tokens → construction step ids */
const FOCUS_TO_STEP: Record<string, ConstructionStepId> = {
  neck: "neck",
  shoulder: "shoulder",
  armhole: "armhole",
  bust: "bust-line",
  waist: "waist-line",
  princess: "darts",
  darts: "darts",
  side: "side-seam",
  sa: "hem",
};

const BEGINNER_BLURBS: Partial<Record<ConstructionStepId, string>> = {
  "center-line":
    "Think of this as the fold of a book — everything mirrors from here.",
  "bust-line":
    "This is the fullest part of the chest. Later lines hang from this width.",
  "waist-line":
    "Where the blouse cinches. Compare it to the bust line to see dart size.",
  neck: "A soft curve from shoulder to center front — never a sharp corner.",
  shoulder: "Connects neck to the top of the armhole. Length + a small drop.",
  armhole: "The sleeve opening. Curve gently — too tight and arms cannot move.",
  "side-seam": "Joins front to back from underarm down to the hem.",
  darts: "Two legs meeting at a tip — they shape flat paper into a 3D bust.",
  hem: "The bottom edge. Keep it level so the blouse sits evenly.",
};

function resolveTutorialSteps(focusIds?: string[]): ConstructionStep[] {
  if (!focusIds?.length) return CONSTRUCTION_STEPS;
  const seen = new Set<ConstructionStepId>();
  const ordered: ConstructionStep[] = [];
  for (const focus of focusIds) {
    const id = FOCUS_TO_STEP[focus];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const step = CONSTRUCTION_STEPS.find((s) => s.id === id);
    if (step) ordered.push(step);
  }
  return ordered.length > 0 ? ordered : CONSTRUCTION_STEPS;
}

type MarkingTutorialProps = {
  focusIds?: string[];
  className?: string;
  /** Compact shell for journey lesson embeds */
  embedded?: boolean;
};

/**
 * Phase 3 — Animated Draft Marking Tutorial.
 * Premium grid board + pathLength draw-on + beginner stepper with glass cards.
 */
export function MarkingTutorial({
  focusIds,
  className,
  embedded = false,
}: MarkingTutorialProps) {
  const reduceMotion = useReducedMotion();
  const steps = useMemo(() => resolveTutorialSteps(focusIds), [focusIds]);
  const [stepIndex, setStepIndex] = useState(0);

  const geometry = useMemo(
    () => buildDraftGeometry(SAMPLE_BODY, DEFAULT_DRAFTING_INPUTS),
    [],
  );

  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const globalIndex = CONSTRUCTION_STEPS.findIndex((s) => s.id === current?.id);
  const visible = stepLineVisibility(Math.max(0, globalIndex));

  const goNext = () =>
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));

  const body = (
    <div className={cn("space-y-4", className)}>
      {/* Step chips */}
      <nav aria-label="Marking tutorial steps" className="overflow-x-auto pb-0.5">
        <ol className="flex min-w-max gap-1.5">
          {steps.map((item, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setStepIndex(index)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide ring-1 transition-colors",
                    active
                      ? "bg-primary text-primary-foreground ring-primary"
                      : done
                        ? "bg-primary/10 text-primary ring-primary/25"
                        : "bg-card/80 text-muted-foreground ring-border/60 hover:text-foreground",
                  )}
                >
                  {done && !active ? (
                    <CheckCircle2 className="size-3" aria-hidden />
                  ) : (
                    <span className="tabular-nums opacity-80">{index + 1}</span>
                  )}
                  {item.shortLabel}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <DraftBoard
        key={current?.id}
        geometry={geometry}
        visible={visible}
        activeStep={current?.id ?? "center-line"}
        premiumGrid
      />

      <AnimatePresence mode="wait">
        {current ? (
          <motion.article
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel space-y-3 rounded-3xl p-4 sm:p-5"
            aria-live="polite"
          >
            <header className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Step {stepIndex + 1} of {steps.length}
              </p>
              <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                {current.label}
              </h3>
              <p className="text-sm font-medium text-primary/90">
                {current.formulaHint}
              </p>
            </header>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" aria-hidden />
                Why this mark exists
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {BEGINNER_BLURBS[current.id] ?? current.whyItExists}
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ListOrdered className="size-3.5 text-primary" aria-hidden />
                How to draw it
              </h4>
              <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-semibold marker:text-primary">
                {current.howItIsDrawn.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </section>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={stepIndex === 0}
                onClick={goPrev}
              >
                <ChevronLeft aria-hidden />
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                disabled={stepIndex >= steps.length - 1}
                onClick={goNext}
              >
                {stepIndex >= steps.length - 1 ? "Complete" : "Next Step"}
                {stepIndex >= steps.length - 1 ? (
                  <CheckCircle2 aria-hidden />
                ) : (
                  <ChevronRight aria-hidden />
                )}
              </Button>
            </div>
          </motion.article>
        ) : null}
      </AnimatePresence>
    </div>
  );

  if (embedded) {
    return (
      <div className="glass-panel space-y-3 rounded-3xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Interactive · Animated draft marking
        </p>
        {body}
      </div>
    );
  }

  return body;
}
