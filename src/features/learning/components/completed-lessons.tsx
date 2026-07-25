"use client";

import { useMemo } from "react";
import { ListChecks } from "lucide-react";
import { DashboardCard } from "@/features/learning/components/dashboard-card";
import { completedLessonLabels } from "@/features/learning/lib/ecosystem";
import { useLearningHubStore } from "@/stores/learning-hub-store";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";

export function CompletedLessons() {
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [stepIds, setStepIds] = useState<string[]>([]);
  const constructionCompleted = useLearningHubStore(
    (s) => s.snapshot?.constructionCompleted ?? 0,
  );
  const measurementsLearned = useLearningHubStore(
    (s) => s.snapshot?.measurementsLearned ?? 0,
  );

  useEffect(() => {
    void (async () => {
      const [learned, draft] = await Promise.all([
        db.learning.toArray(),
        db.draftLearning.get("draft-learning"),
      ]);
      setLearnedIds(learned.map((row) => row.id));
      setStepIds(draft?.completedSteps ?? []);
    })();
  }, [constructionCompleted, measurementsLearned]);

  const lessons = useMemo(
    () =>
      completedLessonLabels({
        learnedMeasurementIds: learnedIds,
        constructionStepIds: stepIds,
      }),
    [learnedIds, stepIds],
  );

  return (
    <DashboardCard
      title="Completed lessons"
      subtitle={`${lessons.length} lessons finished`}
      icon={ListChecks}
      delay={0.14}
    >
      {lessons.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-3 py-8 text-center text-xs text-muted-foreground">
          Completed measurement and construction lessons will collect here.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
            >
              <span className="opacity-60">{lesson.group} · </span>
              {lesson.label}
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
