import type { Metadata } from "next";
import { LessonPageClient } from "@/features/journey/components/lesson-page-client";
import {
  ALL_JOURNEY_LESSONS,
  JOURNEY_LESSON_MAP,
} from "@/features/journey/data/curriculum";

type Props = {
  params: Promise<{ stageId: string; lessonId: string }>;
};

export function generateStaticParams() {
  return ALL_JOURNEY_LESSONS.map((lesson) => ({
    stageId: lesson.stageId,
    lessonId: lesson.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = JOURNEY_LESSON_MAP[lessonId];
  return {
    title: lesson?.title ?? "Lesson",
    description: lesson?.subtitle,
  };
}

export default async function JourneyLessonPage({ params }: Props) {
  const { stageId, lessonId } = await params;
  return <LessonPageClient stageId={stageId} lessonId={lessonId} />;
}
