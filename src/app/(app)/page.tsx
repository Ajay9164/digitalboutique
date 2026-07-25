import type { Metadata } from "next";
import { JourneyDashboardView } from "@/features/journey/components/journey-dashboard-view";

export const metadata: Metadata = {
  title: "Learning Journey",
  description:
    "Guided Tailor Academy — structured lessons from foundations to a complete blouse project.",
};

export default function HomePage() {
  return <JourneyDashboardView />;
}
