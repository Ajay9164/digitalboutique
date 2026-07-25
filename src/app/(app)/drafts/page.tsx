import type { Metadata } from "next";
import { DraftLearningView } from "@/features/drafts/components/draft-learning-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Draft Learning",
  description:
    "Learn how body measurements become drafting lines — animated construction and practice mode.",
};

export default function DraftsPage() {
  return (
    <FeatureErrorBoundary
      title="Drafts failed to load"
      description="The draft board or lesson panel hit an error. Retry without losing your journey progress."
    >
      <DraftLearningView />
    </FeatureErrorBoundary>
  );
}
