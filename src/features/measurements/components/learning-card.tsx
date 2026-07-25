"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Lightbulb,
  ListOrdered,
  Ruler,
  Sparkles,
  Target,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MEASUREMENT_MAP } from "@/features/measurements/data/measurements";
import { MeasurementIllustration } from "@/features/measurements/components/measurement-illustration";
import { useMeasurementStore } from "@/stores/measurement-store";
import { formatRangeCm } from "@/utils/units";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        {title}
      </h3>
      <div className="pl-8 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Circle className="mt-1.5 size-1.5 shrink-0 fill-current text-primary/60" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LearningCard() {
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const unit = useMeasurementStore((s) => s.unit);
  const learnedIds = useMeasurementStore((s) => s.learnedIds);
  const select = useMeasurementStore((s) => s.select);
  const toggleLearned = useMeasurementStore((s) => s.toggleLearned);

  const guide = selectedId ? MEASUREMENT_MAP[selectedId] : null;
  const learned = guide ? learnedIds.includes(guide.id) : false;

  return (
    <AnimatePresence mode="wait">
      {guide ? (
        <motion.article
          key={guide.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          aria-label={`${guide.label} lesson`}
          className={cn(
            "overflow-hidden rounded-3xl border border-white/40 bg-card/80 shadow-[0_18px_50px_-20px_rgba(15,23,28,0.35)]",
            "backdrop-blur-xl dark:border-white/10",
          )}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/12 via-transparent to-transparent px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-[0.16em]">
                  {guide.group}
                </Badge>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {guide.label}
                </h2>
                {guide.typicalRangeCm ? (
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Typical adult range:{" "}
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
                className="rounded-full"
                aria-label="Close lesson"
                onClick={() => select(null)}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="space-y-5 px-5 pb-5">
            {/* Illustration */}
            <div className="flex justify-center rounded-2xl bg-muted/40 py-3 ring-1 ring-border/50">
              <MeasurementIllustration overlay={guide.illustration} title={guide.label} />
            </div>

            <Section icon={BookOpen} title="Definition">
              <p>{guide.definition}</p>
            </Section>

            <Section icon={Target} title="Purpose">
              <p>{guide.purpose}</p>
            </Section>

            <Section icon={Sparkles} title="Why it matters">
              <p>{guide.whyItMatters}</p>
            </Section>

            <Separator />

            <Section icon={ListOrdered} title="How to measure">
              <ol className="list-decimal space-y-1.5 pl-4 marker:font-semibold marker:text-primary">
                {guide.howToMeasure.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Section>

            <Section icon={Lightbulb} title="Professional tips">
              <BulletList items={guide.proTips} />
            </Section>

            <Section icon={AlertTriangle} title="Common mistakes">
              <BulletList items={guide.commonMistakes} />
            </Section>

            <Separator />

            <Section icon={Wrench} title="Required tools">
              <div className="flex flex-wrap gap-1.5">
                {guide.tools.map((tool) => (
                  <Badge key={tool} variant="outline" className="font-normal">
                    <Ruler className="size-3" aria-hidden="true" />
                    {tool}
                  </Badge>
                ))}
              </div>
            </Section>

            <Section icon={ClipboardCheck} title="Measurement checkpoints">
              <ul className="space-y-1.5">
                {guide.checkpoints.map((checkpoint) => (
                  <li key={checkpoint} className="flex gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{checkpoint}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Button
              type="button"
              className="w-full rounded-xl"
              variant={learned ? "secondary" : "default"}
              onClick={() => toggleLearned(guide.id)}
            >
              <CheckCircle2 aria-hidden="true" />
              {learned ? "Learned — tap to unmark" : "Mark as learned"}
            </Button>
          </div>
        </motion.article>
      ) : null}
    </AnimatePresence>
  );
}
