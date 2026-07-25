import type { Metadata } from "next";
import { JourneyDashboardView } from "@/features/journey/components/journey-dashboard-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Learning Journey",
  description:
    "Guided Tailor Academy — structured lessons from foundations to a complete blouse project.",
};

export default function JourneyPage() {
  return (
    <FeatureErrorBoundary
      title="Journey failed to load"
      description="Your other atelier tools stay available. Retry this panel when ready."
    >
      <JourneyDashboardView />
    </FeatureErrorBoundary>
  );
}
