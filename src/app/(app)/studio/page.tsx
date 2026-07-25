import type { Metadata } from "next";
import { StudioView } from "@/features/studio/components/studio-view";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Professional tailoring studio — capture fabric, freeze frames, and overlay neckline patterns.",
};

export default function StudioPage() {
  return <StudioView />;
}
