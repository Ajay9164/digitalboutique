"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import {
  FOCUS_TO_MASTERCLASS,
  MARKING_MASTERCLASS_STEPS,
  masterclassLineVisibility,
  type MarkingMasterclassStep,
} from "@/features/drafts/data/marking-masterclass";
import {
  DEFAULT_DRAFTING_INPUTS,
  SAMPLE_BODY,
} from "@/features/drafts/data/formulas";
import { DraftBoard } from "@/features/drafts/components/draft-board";
import { buildDraftGeometry } from "@/features/drafts/lib/draft-geometry";
import { useDraftLearningStore } from "@/stores/draft-learning-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function resolveMasterclassSteps(
  focusIds?: string[],
): MarkingMasterclassStep[] {
  if (!focusIds?.length) return MARKING_MASTERCLASS_STEPS;
  const seen = new Set<string>();
  const ordered: MarkingMasterclassStep[] = [];
  for (const focus of focusIds) {
    const id = FOCUS_TO_MASTERCLASS[focus];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const step = MARKING_MASTERCLASS_STEPS.find((s) => s.id === id);
    if (step) ordered.push(step);
  }
  return ordered.length > 0 ? ordered : MARKING_MASTERCLASS_STEPS;
}

type MarkingTutorialProps = {
  focusIds?: string[];
  className?: string;
  /** Compact shell for journey lesson embeds */
  embedded?: boolean;
};

/**
 * Phase 3 — Animated Draft Marking Tutorial.
 * Digital cutting table + pathLength chalk draw-on + vertical LessonStepper.
 */
export function MarkingTutorial({
  focusIds,
  className,
  embedded = false,
}: MarkingTutorialProps) {
  const reduceMotion = useReducedMotion();
  const markStepComplete = useDraftLearningStore((s) => s.markStepComplete);
  const steps = useMemo(() => resolveMasterclassSteps(focusIds), [focusIds]);
  const [stepIndex, setStepIndex] = useState(0);

  const geometry = useMemo(
    () => buildDraftGeometry(SAMPLE_BODY, DEFAULT_DRAFTING_INPUTS),
    [],
  );

  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const fullIndex = MARKING_MASTERCLASS_STEPS.findIndex(
    (s) => s.id === current?.id,
  );
  const visible = masterclassLineVisibility(Math.max(0, fullIndex));

  useEffect(() => {
    if (!current) return;
    for (const id of current.reveals) {
      markStepComplete(id);
    }
  }, [current, markStepComplete]);

  const goNext = () =>
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));

  const body = (
    <div
      className={cn(
        "grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-start lg:gap-6",
        className,
      )}
    >
      {/* —— DraftingBoard (top / left) —— */}
      <section
        aria-labelledby="drafting-board-heading"
        className="space-y-3 lg:sticky lg:top-4"
      >
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div>
            <p
              id="drafting-board-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Digital drafting paper
            </p>
            <p className="mt-0.5 text-sm font-medium tracking-tight">
              Chalk lines draw as you advance
            </p>
          </div>
          <p className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Step {stepIndex + 1}/{steps.length}
          </p>
        </div>

        <DraftBoard
          geometry={geometry}
          visible={visible}
          activeStep={current?.activeLine ?? "center-line"}
          premiumGrid
        />
      </section>

      {/* —— LessonStepper (bottom / right) —— */}
      <section aria-label="Marking masterclass stepper" className="space-y-3">
        <ol className="space-y-2.5">
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
                    "glass-panel interactive-lift w-full rounded-2xl p-3.5 text-left transition-colors sm:p-4",
                    active
                      ? "border-primary/35 ring-1 ring-primary/25"
                      : done
                        ? "opacity-90"
                        : "opacity-75 hover:opacity-100",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                        active
                          ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_rgba(15,23,28,0.45)]"
                          : done
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                      aria-hidden
                    >
                      {done && !active ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold tracking-tight">
                        {item.title.replace(/^\d+\.\s*/, "")}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] font-semibold text-foreground">
                        {item.formula}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        <AnimatePresence mode="wait">
          {current ? (
            <motion.article
              key={current.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel space-y-4 rounded-3xl p-4 sm:p-5"
              aria-live="polite"
            >
              <header className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Lesson {stepIndex + 1} of {steps.length}
                </p>
                <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  {current.title}
                </h3>
              </header>

              <section className="space-y-1.5 rounded-2xl bg-primary/8 px-3.5 py-3 ring-1 ring-primary/15">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Calculator className="size-3.5" aria-hidden />
                  The chalk math
                </h4>
                <p className="font-mono text-sm font-semibold tracking-tight text-foreground">
                  {current.formula}
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {current.mathExplainer}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" aria-hidden />
                  Why it matters
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {current.whyItMatters}
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ListOrdered className="size-3.5 text-primary" aria-hidden />
                  How to draw it
                </h4>
                <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-semibold marker:text-primary">
                  {current.howToDraw.map((line) => (
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
                  Previous Step
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
      </section>
    </div>
  );

  if (embedded) {
    return (
      <div className="glass-panel space-y-4 rounded-3xl p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Interactive · Animated draft marking
        </p>
        {body}
      </div>
    );
  }

  return body;
}
