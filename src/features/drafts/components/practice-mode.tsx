"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Dices,
  Eye,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { DraftBoard } from "@/features/drafts/components/draft-board";
import {
  buildDraftGeometry,
  stepLineVisibility,
} from "@/features/drafts/lib/draft-geometry";
import { PRACTICE_FIELDS, type PracticeFieldId } from "@/features/drafts/lib/practice";
import { CONSTRUCTION_STEPS } from "@/features/drafts/data/construction-steps";
import { useDraftLearningStore } from "@/stores/draft-learning-store";
import { useUnit } from "@/hooks/use-unit";
import { formatFromCm, getLabel } from "@/utils/units";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PracticeMode() {
  const { unit, label } = useUnit();
  const {
    practiceBody,
    practiceInputs,
    practiceGuesses,
    practiceAnswers,
    practiceChecked,
    practiceFieldResults,
    practiceAttempts,
    practiceCompletions,
    practiceBestScore,
    lastScore,
    newPracticeRound,
    setPracticeGuess,
    checkPractice,
    revealPractice,
  } = useDraftLearningStore(
    useShallow((s) => ({
      practiceBody: s.practiceBody,
      practiceInputs: s.practiceInputs,
      practiceGuesses: s.practiceGuesses,
      practiceAnswers: s.practiceAnswers,
      practiceChecked: s.practiceChecked,
      practiceFieldResults: s.practiceFieldResults,
      practiceAttempts: s.practiceAttempts,
      practiceCompletions: s.practiceCompletions,
      practiceBestScore: s.practiceBestScore,
      lastScore: s.lastScore,
      newPracticeRound: s.newPracticeRound,
      setPracticeGuess: s.setPracticeGuess,
      checkPractice: s.checkPractice,
      revealPractice: s.revealPractice,
    })),
  );

  const geometry = useMemo(
    () => buildDraftGeometry(practiceBody, practiceInputs),
    [practiceBody, practiceInputs],
  );

  // Show full draft only after check/reveal so practice stays "blind" first
  const showDraft = practiceChecked;
  const visible = stepLineVisibility(
    showDraft ? CONSTRUCTION_STEPS.length - 1 : -1,
  );

  const score = lastScore;
  const total = PRACTICE_FIELDS.length;
  const perfect = practiceChecked && score === total;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Practice Mode
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Convert the random body chart into drafting values, then compare.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={newPracticeRound}
        >
          <Dices aria-hidden="true" />
          New measurements
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["Attempts", practiceAttempts],
            ["Completions", practiceCompletions],
            ["Best score", `${practiceBestScore}/${total}`],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-border/60 bg-card/70 px-3 py-2.5 text-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Random body chart */}
      <section
        aria-label="Random body measurements"
        className="rounded-3xl border border-border/60 bg-card/70 p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Body chart</h3>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            Randomised
          </Badge>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {(
            [
              ["Bust", practiceBody.bust],
              ["Waist", practiceBody.waist],
              ["Neck", practiceBody.neck],
              ["Shoulder", practiceBody.shoulder],
              ["Blouse length", practiceBody.blouseLength],
              ["Apex distance", practiceBody.apexDistance],
              ["Apex depth", practiceBody.apexDepth],
              ["Bust ease", practiceInputs.bustEase],
              ["Waist ease", practiceInputs.waistEase],
              ["Seam allowance", practiceInputs.seamAllowance],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-muted/45 px-3 py-2">
              <dt className="text-[11px] text-muted-foreground">{label}</dt>
              <dd className="font-semibold tabular-nums">
                {formatFromCm(value, unit)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Drafting worksheet */}
      <section aria-label="Your drafting worksheet" className="space-y-3">
        <h3 className="text-sm font-semibold tracking-tight">Your draft values</h3>
        <div className="space-y-2">
          {PRACTICE_FIELDS.map((field) => {
            const result = practiceFieldResults[field.id as PracticeFieldId];
            const answer = practiceAnswers?.[field.id as PracticeFieldId];
            return (
              <label
                key={field.id}
                className={cn(
                  "flex flex-col gap-1.5 rounded-2xl border px-3.5 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between",
                  practiceChecked
                    ? result
                      ? "border-primary/40 bg-primary/5"
                      : "border-destructive/30 bg-destructive/5"
                    : "border-border/60 bg-card/70",
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{field.label}</p>
                  <p className="text-[11px] text-muted-foreground">{field.formula}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={practiceGuesses[field.id] ?? ""}
                    onChange={(event) =>
                      setPracticeGuess(field.id, event.target.value)
                    }
                    disabled={practiceChecked}
                    aria-label={`${field.label} in ${label}`}
                    className="h-10 w-24 rounded-xl border border-border bg-background px-3 text-right text-sm font-semibold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">{getLabel(unit)}</span>
                  {practiceChecked ? (
                    result ? (
                      <CheckCircle2
                        className="size-5 text-primary"
                        aria-label="Correct"
                      />
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
                        <XCircle className="size-4" aria-hidden="true" />
                        {answer !== undefined ? formatFromCm(answer, unit) : "—"}
                      </span>
                    )
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="rounded-xl"
          disabled={practiceChecked}
          onClick={checkPractice}
        >
          Check my draft
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={revealPractice}
        >
          <Eye aria-hidden="true" />
          Reveal solution
        </Button>
        {practiceChecked ? (
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={newPracticeRound}
          >
            <RotateCcw aria-hidden="true" />
            Try another
          </Button>
        ) : null}
      </div>

      <AnimatePresence>
        {practiceChecked ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-medium ring-1",
              perfect
                ? "bg-primary/10 text-primary ring-primary/25"
                : "bg-muted/60 text-foreground ring-border/60",
            )}
          >
            {perfect
              ? `Perfect — ${score}/${total}. This block is drafted correctly.`
              : `Score ${score}/${total}. Wrong fields show the correct value — study them, then try a new chart.`}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Solution draft board */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-tight">
          {showDraft ? "Correct construction" : "Construction preview"}
        </h3>
        {!showDraft ? (
          <p className="text-xs text-muted-foreground">
            Check or reveal to unlock the animated solution draft for these measurements.
          </p>
        ) : null}
        {showDraft ? (
          <DraftBoard
            geometry={geometry}
            visible={visible}
            activeStep="hem"
            unit={unit}
          />
        ) : (
          <div className="flex h-[200px] items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/30 text-sm text-muted-foreground">
            Solution draft locked
          </div>
        )}
      </div>
    </div>
  );
}
