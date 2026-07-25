"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import { CONSTRUCTION_STEPS } from "@/features/drafts/data/construction-steps";
import { FORMULAS } from "@/features/drafts/data/formulas";
import { DraftBoard } from "@/features/drafts/components/draft-board";
import {
  buildDraftGeometry,
  stepLineVisibility,
} from "@/features/drafts/lib/draft-geometry";
import { useDraftLearningStore } from "@/stores/draft-learning-store";
import { roundCm } from "@/features/drafts/data/formulas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function ConstructionLesson() {
  const stepIndex = useDraftLearningStore((s) => s.stepIndex);
  const completedSteps = useDraftLearningStore((s) => s.completedSteps);
  const lessonBody = useDraftLearningStore((s) => s.lessonBody);
  const lessonInputs = useDraftLearningStore((s) => s.lessonInputs);
  const nextStep = useDraftLearningStore((s) => s.nextStep);
  const prevStep = useDraftLearningStore((s) => s.prevStep);
  const goToStep = useDraftLearningStore((s) => s.goToStep);
  const markStepComplete = useDraftLearningStore((s) => s.markStepComplete);

  const step = CONSTRUCTION_STEPS[stepIndex];
  const geometry = useMemo(
    () => buildDraftGeometry(lessonBody, lessonInputs),
    [lessonBody, lessonInputs],
  );
  const visible = stepLineVisibility(stepIndex);
  const m = geometry.measurements;

  const related = FORMULAS.filter((f) => step.relatedFormulas.includes(f.id));

  const formulaValues: Record<string, number> = {
    "bust-quarter": m.bustQuarter,
    "waist-quarter": m.waistQuarter,
    "neck-width": m.neckWidth,
    "shoulder-drop": m.shoulderDrop,
    armhole: m.armholeDepth,
    princess: m.princess,
    darts: m.dartIntake,
    "ease-allowance": m.bustEase,
    "seam-allowance": m.seamAllowance,
  };

  return (
    <div className="space-y-5">
      {/* Step rail */}
      <nav aria-label="Construction steps" className="overflow-x-auto pb-1">
        <ol className="flex min-w-max gap-1.5">
          {CONSTRUCTION_STEPS.map((item, index) => {
            const active = index === stepIndex;
            const done = completedSteps.includes(item.id) || index < stepIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide ring-1 transition-colors",
                    active
                      ? "bg-primary text-primary-foreground ring-primary"
                      : done
                        ? "bg-primary/10 text-primary ring-primary/20"
                        : "bg-card/70 text-muted-foreground ring-border/60 hover:text-foreground",
                  )}
                >
                  {done && !active ? (
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                  ) : (
                    <span className="tabular-nums opacity-70">{index + 1}</span>
                  )}
                  {item.shortLabel}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <DraftBoard
        key={step.id}
        geometry={geometry}
        visible={visible}
        activeStep={step.id}
        premiumGrid
      />

      <AnimatePresence mode="wait">
        <motion.article
          key={step.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4 rounded-3xl border border-white/40 bg-card/80 p-5 shadow-[0_14px_40px_-20px_rgba(15,23,28,0.3)] backdrop-blur-xl dark:border-white/10 glass-panel"
        >
          <header className="space-y-2">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em]">
              Step {stepIndex + 1} of {CONSTRUCTION_STEPS.length}
            </Badge>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {step.label}
            </h2>
            <p className="text-sm font-medium text-primary">{step.formulaHint}</p>
          </header>

          <section aria-label="Why this line exists" className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
              </span>
              Why this line exists
            </h3>
            <p className="pl-8 text-sm leading-relaxed text-muted-foreground">
              {step.whyItExists}
            </p>
          </section>

          <section aria-label="How it is drawn" className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListOrdered className="size-3.5" aria-hidden="true" />
              </span>
              How to draw it
            </h3>
            <ol className="list-decimal space-y-1.5 pl-12 text-sm leading-relaxed text-muted-foreground marker:font-semibold marker:text-primary">
              {step.howItIsDrawn.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </section>

          {related.length > 0 ? (
            <section aria-label="Related formulas" className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="size-3.5" aria-hidden="true" />
                </span>
                Measurement → drafting
              </h3>
              <ul className="space-y-2 pl-8">
                {related.map((formula) => (
                  <li
                    key={formula.id}
                    className="rounded-2xl bg-muted/50 px-3.5 py-2.5 ring-1 ring-border/50"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold">{formula.label}</p>
                      <p className="font-display text-lg font-semibold tabular-nums text-primary">
                        {roundCm(formulaValues[formula.id] ?? 0)}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">
                          cm
                        </span>
                      </p>
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {formula.formula}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {formula.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={stepIndex === 0}
              onClick={prevStep}
            >
              <ChevronLeft aria-hidden="true" />
              Back
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              onClick={() => {
                markStepComplete(step.id);
                if (stepIndex < CONSTRUCTION_STEPS.length - 1) {
                  nextStep();
                }
              }}
            >
              {stepIndex === CONSTRUCTION_STEPS.length - 1
                ? "Complete lesson"
                : "Next Step"}
              {stepIndex < CONSTRUCTION_STEPS.length - 1 ? (
                <ChevronRight aria-hidden="true" />
              ) : (
                <CheckCircle2 aria-hidden="true" />
              )}
            </Button>
          </div>
        </motion.article>
      </AnimatePresence>

      {/* Body measurement reference */}
      <details className="rounded-2xl border border-border/60 bg-card/60 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold tracking-tight">
          Sample body measurements used in this lesson
        </summary>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {(
            [
              ["Bust", lessonBody.bust],
              ["Waist", lessonBody.waist],
              ["Neck", lessonBody.neck],
              ["Shoulder", lessonBody.shoulder],
              ["Blouse length", lessonBody.blouseLength],
              ["Apex distance", lessonBody.apexDistance],
              ["Apex depth", lessonBody.apexDepth],
              ["Bust ease", lessonInputs.bustEase],
              ["Seam allowance", lessonInputs.seamAllowance],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-muted/40 px-2.5 py-2">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-semibold tabular-nums">
                {value} cm
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
