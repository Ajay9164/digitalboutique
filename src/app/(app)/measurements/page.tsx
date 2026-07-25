import type { Metadata } from "next";
import { MeasurementsView } from "@/features/measurements/components/measurements-view";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

export const metadata: Metadata = {
  title: "Measurements",
  description:
    "Interactive 3D tailoring lessons — learn every blouse and bodice measurement hands-on.",
};

export default function MeasurementsPage() {
  return (
    <FeatureErrorBoundary
      title="Measurements failed to load"
      description="WebGL or the lesson panel hit an error. Retry without leaving Tailor."
    >
      <MeasurementsView />
    </FeatureErrorBoundary>
  );
}
