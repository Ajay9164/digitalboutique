import type { Metadata } from "next";
import { StudioView } from "@/features/studio/components/studio-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Professional tailoring studio — capture fabric, freeze frames, and overlay neckline patterns.",
};

export default function StudioPage() {
  return (
    <FeatureErrorBoundary
      title="Studio failed to load"
      description="Camera or overlay tools hit an error. Retry this panel — Journal and Journey keep working."
    >
      <StudioView />
    </FeatureErrorBoundary>
  );
}
