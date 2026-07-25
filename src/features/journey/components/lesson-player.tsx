"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  FabricAlignPracticeSurface,
  FabricCameraCalloutSurface,
  FabricSwatchesSurface,
  DraftPracticeSurface,
  MannequinCalloutSurface,
  MarkingAnimationSurface,
  MeasurePracticeSurface,
  MistakesQuizSurface,
  PostureSurface,
  ProjectWorkflowSurface,
  TapeDemoSurface,
  TerminologySurface,
  ToolsGridSurface,
} from "@/features/journey/components/interactive-surfaces";
import { speakCue, stopNarration } from "@/features/journey/lib/narration";
import { formatEta, lessonHref } from "@/features/journey/lib/engine";
import type { JourneyLessonState } from "@/features/journey/lib/engine";
import { useJourneyStore } from "@/stores/journey-store";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function InteractiveForLesson({
  lesson,
  onScored,
}: {
  lesson: JourneyLessonState;
  onScored: (score: number, total: number) => void;
}) {
  const section = lesson.sections[0];
  const key = section?.interactive;

  switch (key) {
    case "tools-grid":
      return <ToolsGridSurface />;
    case "tape-demo":
      return <TapeDemoSurface />;
    case "fabric-swatches":
      return <FabricSwatchesSurface />;
    case "terminology":
      return <TerminologySurface />;
    case "mistakes-quiz":
      return <MistakesQuizSurface onScored={onScored} />;
    case "posture":
      return <PostureSurface />;
    case "mannequin":
      return <MannequinCalloutSurface />;
    case "measure-practice":
      return (
        <MeasurePracticeSurface
          difficulty={lesson.difficulty === "advanced" ? "hard" : "easy"}
          onScored={onScored}
        />
      );
    case "marking-animation": {
      const focus =
        lesson.id === "s4-neck-shoulder"
          ? ["neck", "shoulder"]
          : lesson.id === "s4-armhole-bust"
            ? ["armhole", "bust"]
            : lesson.id === "s4-waist-princess"
              ? ["waist", "princess"]
              : ["darts", "side", "sa"];
      return <MarkingAnimationSurface focusIds={focus} />;
    }
    case "draft-practice":
      return (
        <DraftPracticeSurface
          hintLimit={
            lesson.difficulty === "beginner"
              ? 6
              : lesson.difficulty === "intermediate"
                ? 3
                : 0
          }
          targetScore={
            lesson.difficulty === "beginner"
              ? 7
              : lesson.difficulty === "intermediate"
                ? 8
                : 9
          }
          onScored={onScored}
        />
      );
    case "fabric-camera":
      return <FabricCameraCalloutSurface />;
    case "fabric-align-practice":
      return (
        <FabricAlignPracticeSurface
          target={lesson.id === "s7-overlay" ? 90 : 80}
          comparison={lesson.id === "s7-overlay"}
          liveHints={lesson.id === "s7-realtime"}
          onScored={onScored}
        />
      );
    case "project-workflow": {
      const highlight =
        lesson.id === "s8-measure"
          ? 0
          : lesson.id === "s8-draft"
            ? 1
            : lesson.id === "s8-fabric"
              ? 2
              : lesson.id === "s8-journal"
                ? 3
                : 4;
      return <ProjectWorkflowSurface highlight={highlight} />;
    }
    default:
      return null;
  }
}

export function LessonPlayer({
  lesson,
  nextLessonId,
}: {
  lesson: JourneyLessonState;
  nextLessonId?: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const openLesson = useJourneyStore((s) => s.openLesson);
  const markSection = useJourneyStore((s) => s.markSection);
  const finishLesson = useJourneyStore((s) => s.finishLesson);
  const savePractice = useJourneyStore((s) => s.savePractice);
  const toggleNarration = useJourneyStore((s) => s.toggleNarration);
  const narrationEnabled =
    useJourneyStore((s) => s.dashboard?.progress.narrationEnabled) ?? false;

  const [sectionIndex, setSectionIndex] = useState(0);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [completing, setCompleting] = useState(false);

  const section = lesson.sections[sectionIndex];

  useEffect(() => {
    void openLesson(lesson.id);
    return () => stopNarration();
  }, [lesson.id, openLesson]);

  useEffect(() => {
    if (!section || !narrationEnabled) return;
    speakCue(
      { title: section.title, what: section.what, why: section.why },
      true,
    );
  }, [section, narrationEnabled]);

  const progressLabel = useMemo(() => {
    const done = lesson.record?.completedSections.length ?? 0;
    return `${Math.min(done + (lesson.complete ? 0 : 0), lesson.sections.length)} / ${lesson.sections.length} sections`;
  }, [lesson]);

  if (lesson.locked) {
    return (
      <div className="glass-panel flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
        <Lock className="size-8 text-muted-foreground" aria-hidden />
        <h2 className="font-display text-xl font-semibold">Lesson locked</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Complete the previous lesson first — or enable Free explore from the
          Journey dashboard.
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/journey">Back to journey</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Stage lesson · ${formatEta(lesson.etaMinutes)}`}
        title={lesson.title}
        description={lesson.subtitle}
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            aria-pressed={narrationEnabled}
            onClick={() => void toggleNarration(!narrationEnabled)}
          >
            {narrationEnabled ? (
              <Volume2 aria-hidden />
            ) : (
              <VolumeX aria-hidden />
            )}
            Voice
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
          {lesson.kind}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 font-semibold capitalize">
          {lesson.difficulty}
        </span>
        <span>+{lesson.xp} XP</span>
        <span>{progressLabel}</span>
        {lesson.complete ? (
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            <Check className="size-3.5" aria-hidden />
            Complete
          </span>
        ) : null}
      </div>

      {section ? (
        <motion.article
          key={section.id}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel space-y-4 rounded-3xl p-5"
        >
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Section {sectionIndex + 1} of {lesson.sections.length}
            </p>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {section.title}
            </h2>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-primary/8 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                What to do
              </p>
              <p className="mt-1 text-sm leading-relaxed">{section.what}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Why
              </p>
              <p className="mt-1 text-sm leading-relaxed">{section.why}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              How
            </p>
            <ol className="mt-2 space-y-1.5">
              {section.how.map((step) => (
                <li
                  key={step}
                  className="flex gap-2 text-sm leading-relaxed text-foreground/90"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
                Common mistakes
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {section.commonMistakes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Professional tips
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {section.proTips.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {section.practicePrompt ? (
            <p className="rounded-2xl border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
              Practice: {section.practicePrompt}
            </p>
          ) : null}
        </motion.article>
      ) : null}

      <InteractiveForLesson
        lesson={lesson}
        onScored={(score, total) => {
          setLastScore({ score, total });
          void savePractice(lesson.id, score, total);
        }}
      />

      {lesson.exploreHref ? (
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href={lesson.exploreHref}>Open related atelier tool</Link>
        </Button>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={sectionIndex === 0}
          onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
        >
          <ArrowLeft aria-hidden />
          Previous
        </Button>
        {sectionIndex < lesson.sections.length - 1 ? (
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => {
              if (section) void markSection(lesson.id, section.id);
              setSectionIndex((i) => i + 1);
            }}
          >
            Next section
            <ArrowRight aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            className="rounded-xl"
            disabled={completing || lesson.complete}
            onClick={async () => {
              setCompleting(true);
              if (section) await markSection(lesson.id, section.id);
              await finishLesson(
                lesson.id,
                lastScore ?? undefined,
              );
              setCompleting(false);
            }}
          >
            {lesson.complete ? "Already complete" : "Complete lesson"}
            <Check aria-hidden />
          </Button>
        )}
        {lesson.complete && nextLessonId ? (
          <Button asChild variant="secondary" className="rounded-xl">
            <Link href={lessonHref(nextLessonId)}>Next recommended</Link>
          </Button>
        ) : null}
      </div>

      <p className={cn("text-center text-[11px] text-muted-foreground")}>
        Status: {lesson.complete ? "Completed" : "In progress"} · Resume anytime
        from the Journey dashboard
      </p>
    </div>
  );
}
