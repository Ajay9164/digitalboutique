import type { Metadata } from "next";
import { DraftLearningView } from "@/features/drafts/components/draft-learning-view";

export const metadata: Metadata = {
  title: "Draft Learning",
  description:
    "Learn how body measurements become drafting lines — animated construction and practice mode.",
};

export default function DraftsPage() {
  return <DraftLearningView />;
}
