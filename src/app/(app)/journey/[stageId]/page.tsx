import type { Metadata } from "next";
import { StagePageClient } from "@/features/journey/components/stage-page-client";
import { JOURNEY_STAGES } from "@/features/journey/data/curriculum";

type Props = { params: Promise<{ stageId: string }> };

export function generateStaticParams() {
  return JOURNEY_STAGES.map((stage) => ({ stageId: stage.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stageId } = await params;
  const stage = JOURNEY_STAGES.find((s) => s.id === stageId);
  return {
    title: stage?.title ?? "Stage",
    description: stage?.description,
  };
}

export default async function JourneyStagePage({ params }: Props) {
  const { stageId } = await params;
  return <StagePageClient stageId={stageId} />;
}
