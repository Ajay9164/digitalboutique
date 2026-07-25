import type { Metadata } from "next";
import { LearningHubView } from "@/features/learning/components/learning-hub-view";

export const metadata: Metadata = {
  title: "Progress",
  description:
    "Skill progress, streaks, achievements, timelines, and practice charts.",
};

export default function ProgressPage() {
  return <LearningHubView />;
}
