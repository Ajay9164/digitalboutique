import type { Metadata } from "next";
import { JourneyDashboardView } from "@/features/journey/components/journey-dashboard-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Learning Journey",
  description:
    "Guided Tailor Academy — structured lessons from foundations to a complete blouse project.",
};

export default function HomePage() {
  return (
    <FeatureErrorBoundary
      title="Academy failed to load"
      description="The learning journey hit an error. Retry without leaving Tailor."
    >
      <JourneyDashboardView />
    </FeatureErrorBoundary>
  );
}
