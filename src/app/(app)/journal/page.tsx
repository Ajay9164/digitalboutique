import type { Metadata } from "next";
import { JournalView } from "@/features/journal/components/journal-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Offline atelier journal — projects, fabric, measurements, drafts, and learning progress.",
};

export default function JournalPage() {
  return (
    <FeatureErrorBoundary
      title="Journal failed to load"
      description="Your other atelier tools stay available. Retry this panel when ready."
    >
      <JournalView />
    </FeatureErrorBoundary>
  );
}
