"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ListOrdered,
  Ruler,
  Sparkles,
  X,
} from "lucide-react";
import { MEASUREMENT_MAP } from "@/features/measurements/data/measurements";
import { MeasurementIllustration } from "@/features/measurements/components/measurement-illustration";
import { useMeasurementStore } from "@/stores/measurement-store";
import { formatRangeCm } from "@/utils/units";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LearningCard() {
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const unit = useMeasurementStore((s) => s.unit);
  const learnedIds = useMeasurementStore((s) => s.learnedIds);
  const select = useMeasurementStore((s) => s.select);
  const toggleLearned = useMeasurementStore((s) => s.toggleLearned);

  const guide = selectedId ? MEASUREMENT_MAP[selectedId] : null;
  const learned = guide ? learnedIds.includes(guide.id) : false;
  const primaryWarning = guide?.commonMistakes[0];

  return (
    <AnimatePresence mode="wait">
      {guide ? (
        <motion.article
          key={guide.id}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-label={`${guide.label} lesson`}
          className={cn(
            "glass-panel overflow-hidden rounded-[1.75rem]",
            "shadow-[0_24px_60px_-28px_rgba(15,23,28,0.4)]",
          )}
        >
          {/* Editorial header */}
          <div className="relative overflow-hidden px-6 pb-5 pt-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/14 via-transparent to-transparent"
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase tracking-[0.18em]"
                >
                  {guide.group}
                </Badge>
                <h2 className="font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-3xl">
                  The {guide.label} Measurement
                </h2>
                {guide.typicalRangeCm ? (
                  <p className="text-xs font-medium text-muted-foreground">
                    Typical adult range{" "}
                    <span className="font-semibold text-primary">
                      {formatRangeCm(guide.typicalRangeCm, unit)}
                    </span>
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 rounded-full"
                aria-label="Close lesson"
                onClick={() => select(null)}
              >
                <X aria-hidden />
              </Button>
            </div>
          </div>

          <div className="space-y-6 px-6 pb-6">
            <div className="flex justify-center rounded-2xl bg-muted/35 py-4 ring-1 ring-white/15">
              <MeasurementIllustration
                overlay={guide.illustration}
                title={guide.label}
              />
            </div>

            {/* Why it matters */}
            <section
              aria-label="Why it matters"
              className="rounded-2xl border border-white/15 bg-white/35 p-4 dark:bg-white/5"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <span className="flex size-7 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Info className="size-3.5" aria-hidden />
                </span>
                Why it matters
              </h3>
              <p className="mt-2 pl-9 text-sm leading-relaxed text-muted-foreground">
                {guide.whyItMatters}
              </p>
              <p className="mt-2 pl-9 text-sm leading-relaxed text-muted-foreground/90">
                {guide.purpose}
              </p>
            </section>

            {/* Step-by-step */}
            <section aria-label="Step by step how to measure">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
                <span className="flex size-7 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <ListOrdered className="size-3.5" aria-hidden />
                </span>
                Step-by-step — place the tape
              </h3>
              <ol className="space-y-3">
                {guide.howToMeasure.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-3 rounded-2xl border border-white/12 bg-background/40 px-3.5 py-3 backdrop-blur-sm"
                  >
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-[0_8px_20px_-10px_rgba(15,23,28,0.5)]"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed text-foreground/90">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Crucial warning */}
            {primaryWarning ? (
              <aside
                role="note"
                aria-label="Crucial warning"
                className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 dark:border-amber-400/20 dark:bg-amber-400/10"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-amber-900 dark:text-amber-100">
                  <span className="flex size-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-200">
                    <AlertTriangle className="size-3.5" aria-hidden />
                  </span>
                  Crucial warning
                </h3>
                <p className="mt-2 pl-9 text-sm leading-relaxed text-amber-950/80 dark:text-amber-50/85">
                  {primaryWarning}
                  {guide.commonMistakes.length > 1
                    ? ` Also watch for: ${guide.commonMistakes.slice(1, 3).join(" · ")}`
                    : null}
                </p>
              </aside>
            ) : null}

            {/* Pro tips strip */}
            <section aria-label="Professional tips" className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <span className="flex size-7 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Sparkles className="size-3.5" aria-hidden />
                </span>
                Atelier tips
              </h3>
              <ul className="space-y-2 pl-1">
                {guide.proTips.slice(0, 3).map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <Ruler
                      className="mt-0.5 size-3.5 shrink-0 text-primary/70"
                      aria-hidden
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>

            <Button
              type="button"
              className="h-11 w-full rounded-2xl text-sm font-semibold"
              variant={learned ? "secondary" : "default"}
              onClick={() => toggleLearned(guide.id)}
            >
              <CheckCircle2 aria-hidden />
              {learned ? "Learned — tap to unmark" : "Mark as learned"}
            </Button>
          </div>
        </motion.article>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel rounded-[1.75rem] px-6 py-10 text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Learning panel
          </p>
          <p className="mt-2 font-display text-lg font-semibold tracking-tight">
            Tap a glowing region to open your lesson
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Each body part opens an editorial guide — why it matters, exactly
            where to place the tape, and warnings beginners need.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
