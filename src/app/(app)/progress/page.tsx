import type { Metadata } from "next";
import { LearningHubView } from "@/features/learning/components/learning-hub-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Progress",
  description:
    "Skill progress, streaks, achievements, timelines, and practice charts.",
};

export default function ProgressPage() {
  return (
    <FeatureErrorBoundary
      title="Progress failed to load"
      description="Charts or local learning data hit an error. Retry without leaving Tailor."
    >
      <LearningHubView />
    </FeatureErrorBoundary>
  );
}
