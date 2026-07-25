import type { Metadata } from "next";
import { JournalView } from "@/features/journal/components/journal-view";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Offline atelier journal — projects, fabric, measurements, drafts, and learning progress.",
};

export default function JournalPage() {
  return <JournalView />;
}
