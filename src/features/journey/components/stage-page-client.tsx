"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { StageView } from "@/features/journey/components/stage-view";
import { JOURNEY_STAGE_MAP, type JourneyStageId } from "@/features/journey/data/curriculum";
import { useJourneyStore } from "@/stores/journey-store";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export function StagePageClient({ stageId }: { stageId: string }) {
  const hydrate = useJourneyStore((s) => s.hydrate);
  const hydrated = useJourneyStore((s) => s.hydrated);
  const dashboard = useJourneyStore((s) => s.dashboard);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!JOURNEY_STAGE_MAP[stageId as JourneyStageId]) {
    notFound();
  }

  if (!hydrated || !dashboard) {
    return <PageSkeleton />;
  }

  const stage = dashboard.stages.find((s) => s.id === stageId);
  if (!stage) notFound();

  return <StageView stage={stage} />;
}
