"use client";

import type { ComponentType, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Info,
  ListOrdered,
  Ruler,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import {
  MEASUREMENT_MAP,
  type MeasurementGuide,
  type MeasurementId,
} from "@/features/measurements/data/measurements";
import {
  FOUNDATION_MODULE,
  measurementModuleTitle,
} from "@/features/measurements/data/academy-modules";
import { MeasurementIllustration } from "@/features/measurements/components/measurement-illustration";
import { useMeasurementStore } from "@/stores/measurement-store";
import { useUnit } from "@/hooks/use-unit";
import {
  formatRangeCm,
  resolveMeasureLines,
  resolveMeasureTemplate,
} from "@/utils/units";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
}) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
      <span className="flex size-7 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Icon className="size-3.5" aria-hidden />
      </span>
      {children}
    </h3>
  );
}

function FoundationModuleCard({
  learnedIds,
  onSelectTopic,
}: {
  learnedIds: MeasurementId[];
  onSelectTopic: (id: MeasurementId) => void;
}) {
  const topics = FOUNDATION_MODULE.topicIds
    .map((id) => MEASUREMENT_MAP[id])
    .filter(Boolean);
  const learnedInModule = topics.filter((t) => learnedIds.includes(t.id)).length;

  return (
    <motion.article
      key="foundation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      aria-label={FOUNDATION_MODULE.title}
      className={cn(
        "glass-panel flex h-full min-h-[380px] flex-col overflow-hidden rounded-[1.75rem]",
        "shadow-[0_24px_60px_-28px_rgba(15,23,28,0.4)]",
      )}
    >
      <div className="relative overflow-hidden px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/14 via-transparent to-transparent"
        />
        <div className="relative space-y-2">
          <Badge
            variant="secondary"
            className="text-[10px] uppercase tracking-[0.18em]"
          >
            Academy · Module {FOUNDATION_MODULE.moduleNumber}
          </Badge>
          <h2 className="font-display text-[1.45rem] font-semibold leading-[1.2] tracking-tight sm:text-2xl">
            {FOUNDATION_MODULE.title}
          </h2>
          <p className="text-xs font-medium text-muted-foreground">
            {learnedInModule} of {topics.length} foundation topics learned
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={topics.length}
            aria-valuenow={learnedInModule}
            aria-label="Foundation module progress"
            className="h-1.5 overflow-hidden rounded-full bg-muted/80"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{
                width: `${topics.length ? (learnedInModule / topics.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-5 px-5 pb-6 sm:px-6">
        <section aria-label="Module overview">
          <SectionHeading icon={Info}>Module title & overview</SectionHeading>
          <p className="rounded-2xl border border-white/12 bg-background/40 px-3.5 py-3 text-sm leading-relaxed text-foreground/90">
            {FOUNDATION_MODULE.overview}
          </p>
        </section>

        <section
          aria-label="Why it matters for tailoring"
          className="rounded-2xl border border-white/15 bg-white/35 p-4 dark:bg-white/5"
        >
          <SectionHeading icon={Sparkles}>
            Why it matters for tailoring
          </SectionHeading>
          <p className="pl-9 text-sm leading-relaxed text-muted-foreground">
            {FOUNDATION_MODULE.whyItMatters}
          </p>
        </section>

        <section aria-label="Foundation topics">
          <SectionHeading icon={ListOrdered}>
            Upper-body learning topics
          </SectionHeading>
          <ul className="space-y-2">
            {topics.map((topic, index) => {
              const learned = learnedIds.includes(topic.id);
              return (
                <li key={topic.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTopic(topic.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                      "border-white/12 bg-background/40 hover:border-primary/35 hover:bg-primary/5",
                    )}
                  >
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight">
                          {topic.label}
                        </span>
                        {learned ? (
                          <CheckCircle2
                            className="size-3.5 text-primary"
                            aria-label="Learned"
                          />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                        {topic.definition}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside
          role="note"
          className="rounded-2xl border border-primary/20 bg-primary/8 p-4"
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Next step: </span>
            Tap a glowing region on the dress form, or open a topic above, for
            step-by-step tape placement, mistakes, tools, and checkpoints.
          </p>
        </aside>
      </div>
    </motion.article>
  );
}

function MeasurementModuleCard({
  guide,
  learned,
  unit,
  onClose,
  onToggleLearned,
}: {
  guide: MeasurementGuide;
  learned: boolean;
  unit: "in" | "cm";
  onClose: () => void;
  onToggleLearned: () => void;
}) {
  const howTo = resolveMeasureLines(guide.howToMeasure, unit);
  const tips = resolveMeasureLines(guide.proTips, unit);
  const mistakes = resolveMeasureLines(guide.commonMistakes, unit);
  const checkpoints = resolveMeasureLines(guide.checkpoints, unit);
  const tools = guide.tools;
  const why = resolveMeasureTemplate(guide.whyItMatters, unit);
  const purpose = resolveMeasureTemplate(guide.purpose, unit);
  const definition = resolveMeasureTemplate(guide.definition, unit);
  const title = measurementModuleTitle(guide.id);

  return (
    <motion.article
      key={guide.id}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-label={title}
      className={cn(
        "glass-panel flex h-full min-h-[380px] flex-col overflow-hidden rounded-[1.75rem]",
        "shadow-[0_24px_60px_-28px_rgba(15,23,28,0.4)]",
      )}
    >
      {/* Module Title & Overview */}
      <div className="relative overflow-hidden px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/14 via-transparent to-transparent"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="text-[10px] uppercase tracking-[0.18em]"
              >
                {guide.group}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.14em]"
              >
                {guide.kind}
              </Badge>
            </div>
            <h2 className="font-display text-[1.45rem] font-semibold leading-[1.15] tracking-tight sm:text-2xl">
              {title}
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
            aria-label="Back to foundation module"
            onClick={onClose}
          >
            <X aria-hidden />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-5 px-5 pb-6 sm:px-6">
        <div className="flex justify-center rounded-2xl bg-muted/35 py-4 ring-1 ring-white/15">
          <MeasurementIllustration
            overlay={guide.illustration}
            title={guide.label}
          />
        </div>

        <section aria-label="Module overview">
          <SectionHeading icon={Info}>Module title & overview</SectionHeading>
          <p className="rounded-2xl border border-white/12 bg-background/40 px-3.5 py-3 text-sm leading-relaxed text-foreground/90">
            {definition}
          </p>
          <p className="mt-2 pl-1 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Purpose: </span>
            {purpose}
          </p>
        </section>

        <section
          aria-label="Why it matters for tailoring"
          className="rounded-2xl border border-white/15 bg-white/35 p-4 dark:bg-white/5"
        >
          <SectionHeading icon={Sparkles}>
            Why it matters for tailoring
          </SectionHeading>
          <p className="pl-9 text-sm leading-relaxed text-muted-foreground">
            {why}
          </p>
        </section>

        <section aria-label="Step-by-step measuring instructions">
          <SectionHeading icon={ListOrdered}>
            Step-by-step measuring instructions
          </SectionHeading>
          <ol className="space-y-3">
            {howTo.map((step, index) => (
              <li
                key={`${guide.id}-step-${index}`}
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

        <section aria-label="Common beginner mistakes and pro tips">
          <SectionHeading icon={AlertTriangle}>
            Common beginner mistakes & pro tips
          </SectionHeading>
          <div className="space-y-3">
            <aside
              role="note"
              className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 dark:border-amber-400/20 dark:bg-amber-400/10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
                Mistakes to avoid
              </p>
              <ul className="mt-2 space-y-2">
                {mistakes.map((item, index) => (
                  <li
                    key={`${guide.id}-mistake-${index}`}
                    className="flex gap-2 text-sm leading-relaxed text-amber-950/85 dark:text-amber-50/85"
                  >
                    <AlertTriangle
                      className="mt-0.5 size-3.5 shrink-0 text-amber-700 dark:text-amber-300"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="rounded-2xl border border-white/12 bg-background/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Atelier pro tips
              </p>
              <ul className="mt-2 space-y-2">
                {tips.map((tip, index) => (
                  <li
                    key={`${guide.id}-tip-${index}`}
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
            </div>
          </div>
        </section>

        <section
          aria-label="Checkpoints and required tools"
          className="grid gap-3 sm:grid-cols-2"
        >
          <div className="rounded-2xl border border-white/12 bg-background/40 p-4">
            <SectionHeading icon={CheckSquare}>Checkpoints</SectionHeading>
            <ul className="space-y-2 pl-1">
              {checkpoints.map((item, index) => (
                <li
                  key={`${guide.id}-check-${index}`}
                  className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                >
                  <CheckCircle2
                    className="mt-0.5 size-3.5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/12 bg-background/40 p-4">
            <SectionHeading icon={Wrench}>Required tools</SectionHeading>
            <ul className="space-y-2 pl-1">
              {tools.map((tool) => (
                <li
                  key={`${guide.id}-tool-${tool}`}
                  className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                >
                  <Wrench
                    className="mt-0.5 size-3.5 shrink-0 text-primary/70"
                    aria-hidden
                  />
                  <span>{tool}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Button
          type="button"
          className="mt-auto h-11 w-full rounded-2xl text-sm font-semibold"
          variant={learned ? "secondary" : "default"}
          onClick={onToggleLearned}
        >
          <CheckCircle2 aria-hidden />
          {learned ? "Learned — tap to unmark" : "Mark as learned"}
        </Button>
      </div>
    </motion.article>
  );
}

/**
 * Module-wise LearningPanel — never empty.
 * Defaults to Module 1 Foundation; switches to a body-part module on Zustand select.
 */
export function LearningCard() {
  const { unit } = useUnit();
  const { selectedId, learnedIds, select, toggleLearned } = useMeasurementStore(
    useShallow((s) => ({
      selectedId: s.selectedId,
      learnedIds: s.learnedIds,
      select: s.select,
      toggleLearned: s.toggleLearned,
    })),
  );

  const guide = selectedId ? MEASUREMENT_MAP[selectedId] : null;
  const learned = guide ? learnedIds.includes(guide.id) : false;

  return (
    <AnimatePresence mode="wait">
      {guide ? (
        <MeasurementModuleCard
          key={guide.id}
          guide={guide}
          learned={learned}
          unit={unit}
          onClose={() => select(null)}
          onToggleLearned={() => toggleLearned(guide.id)}
        />
      ) : (
        <FoundationModuleCard
          key="foundation"
          learnedIds={learnedIds}
          onSelectTopic={(id) => select(id)}
        />
      )}
    </AnimatePresence>
  );
}

/** Alias — masterclass panel driven by `selectedId` in the measurement store. */
export const LearningPanel = LearningCard;
