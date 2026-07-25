"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/features/journey/components/lesson-player";
import { JOURNEY_LESSON_MAP } from "@/features/journey/data/curriculum";
import { useJourneyStore } from "@/stores/journey-store";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export function LessonPageClient({
  stageId,
  lessonId,
}: {
  stageId: string;
  lessonId: string;
}) {
  const hydrate = useJourneyStore((s) => s.hydrate);
  const refresh = useJourneyStore((s) => s.refresh);
  const hydrated = useJourneyStore((s) => s.hydrated);
  const dashboard = useJourneyStore((s) => s.dashboard);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    void refresh();
  }, [lessonId, refresh]);

  const def = JOURNEY_LESSON_MAP[lessonId];
  if (!def || def.stageId !== stageId) {
    notFound();
  }

  if (!hydrated || !dashboard) {
    return <PageSkeleton />;
  }

  const lesson = dashboard.stages
    .flatMap((s) => s.lessons)
    .find((l) => l.id === lessonId);

  if (!lesson) notFound();

  return (
    <LessonPlayer
      lesson={lesson}
      nextLessonId={dashboard.nextLesson?.id ?? null}
    />
  );
}
