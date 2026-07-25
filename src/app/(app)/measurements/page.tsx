import type { Metadata } from "next";
import { MeasurementsView } from "@/features/measurements/components/measurements-view";

export const metadata: Metadata = {
  title: "Measurements",
  description:
    "Interactive 3D tailoring lessons — learn every blouse and bodice measurement hands-on.",
};

export default function MeasurementsPage() {
  return <MeasurementsView />;
}
