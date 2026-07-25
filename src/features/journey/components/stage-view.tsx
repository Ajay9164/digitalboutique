"use client";

import Link from "next/link";
import { Lock, Check, ChevronRight } from "lucide-react";
import { formatEta, lessonHref } from "@/features/journey/lib/engine";
import type { JourneyStageState } from "@/features/journey/lib/engine";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StageView({ stage }: { stage: JourneyStageState }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={stage.subtitle}
        title={stage.title}
        description={stage.description}
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/journey">All stages</Link>
          </Button>
        }
      />

      <div className="glass-panel rounded-3xl p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">
            Stage progress
          </span>
          <span className="tabular-nums font-semibold">
            {stage.completeCount}/{stage.lessons.length} · {stage.percent}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${stage.percent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Estimated {formatEta(stage.etaMinutes)} for this stage
        </p>
      </div>

      {stage.locked ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border/70 px-6 py-12 text-center">
          <Lock className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm font-semibold">Stage locked</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Complete the previous stage, or enable Free explore on the Journey
            dashboard.
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {stage.lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <Link
                href={lesson.locked ? "#" : lessonHref(lesson.id)}
                aria-disabled={lesson.locked}
                className={cn(
                  "glass-panel flex items-center gap-3 rounded-2xl p-3 transition",
                  lesson.locked
                    ? "pointer-events-none opacity-55"
                    : "hover:border-primary/35",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                    lesson.complete
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {lesson.complete ? (
                    <Check className="size-4" aria-hidden />
                  ) : lesson.locked ? (
                    <Lock className="size-3.5" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{lesson.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {lesson.subtitle} · {formatEta(lesson.etaMinutes)} · +
                    {lesson.xp} XP
                  </p>
                </div>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
