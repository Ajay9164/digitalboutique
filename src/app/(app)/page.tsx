import type { Metadata } from "next";
import { CinematicLandingView } from "@/features/measurements/components/cinematic-landing-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Atelier Overture",
  description:
    "Scroll the cinematic dress form — then enter the Digital Atelier.",
};

export default function HomePage() {
  return (
    <FeatureErrorBoundary
      title="Cinema failed to load"
      description="The overture hit an error. Open Measurements from the nav to continue."
    >
      <CinematicLandingView />
    </FeatureErrorBoundary>
  );
}
