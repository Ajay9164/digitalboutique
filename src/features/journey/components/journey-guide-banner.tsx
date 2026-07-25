"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { useEffect } from "react";
import { useJourneyStore } from "@/stores/journey-store";
import { Button } from "@/components/ui/button";

/**
 * Soft guidance banner — keeps free exploration available while steering
 * learners back to the recommended next lesson.
 */
export function JourneyGuideBanner({
  feature,
}: {
  feature: "measurements" | "drafts" | "studio" | "journal";
}) {
  const hydrate = useJourneyStore((s) => s.hydrate);
  const dashboard = useJourneyStore((s) => s.dashboard);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!dashboard || dashboard.progress.freeExplore) return null;

  const next = dashboard.nextLesson ?? dashboard.currentLesson;
  if (!next) return null;

  const copy: Record<typeof feature, string> = {
    measurements:
      "Guided mode recommends finishing measurement stages in the academy first — or continue exploring freely.",
    drafts:
      "Draft tools are available now. For the structured path, follow Measurement Marking & Practice Drafting in the Journey.",
    studio:
      "Studio works anytime. Fabric Placement stages teach grain and alignment step by step.",
    journal:
      "Save projects anytime. Stage 8 walks you through a complete blouse archive.",
  };

  return (
    <div className="glass-panel flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Compass className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {copy[feature]} Next up:{" "}
          <span className="font-semibold text-foreground">{next.title}</span>
        </p>
      </div>
      <Button asChild size="sm" variant="outline" className="shrink-0 rounded-xl">
        <Link href={`/journey/${next.stageId}/${next.id}`}>Resume</Link>
      </Button>
    </div>
  );
}
