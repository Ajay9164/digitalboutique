import type { Metadata } from "next";
import { CinematicLandingView } from "@/features/measurements/components/cinematic-landing-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Atelier Overture",
  description:
    "Scroll the cinematic dress form — then enter the Digital Atelier.",
};

/**
 * Full-bleed cinematic landing — no max-width / padded app chrome.
 * The 3D stage is fixed viewport; typography scrolls over it.
 */
export default function HomePage() {
  return (
    <main id="main-content" className="relative w-full bg-black text-foreground">
      <FeatureErrorBoundary
        title="Cinema failed to load"
        description="The overture hit an error. Open Measurements from the nav to continue."
      >
        <CinematicLandingView />
      </FeatureErrorBoundary>
    </main>
  );
}
