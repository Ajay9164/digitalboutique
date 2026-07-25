import type { Metadata } from "next";
import { StagePageClient } from "@/features/journey/components/stage-page-client";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
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
  return (
    <FeatureErrorBoundary
      title="Stage failed to load"
      description="Return to the journey dashboard or retry this stage."
    >
      <StagePageClient stageId={stageId} />
    </FeatureErrorBoundary>
  );
}
