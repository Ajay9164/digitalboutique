"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Images, Shapes } from "lucide-react";
import { CameraCapture } from "@/features/studio/components/camera-capture";
import { OverlayControls } from "@/features/studio/components/overlay-controls";
import { PatternLibrary } from "@/features/studio/components/pattern-library";
import { PhotoLibrary } from "@/features/studio/components/photo-library";
import { StudioToolbar } from "@/features/studio/components/studio-toolbar";
import { StudioWorkspace } from "@/features/studio/components/studio-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";
import { JourneyGuideBanner } from "@/features/journey/components/journey-guide-banner";
import { useStudioStore, type StudioPhase } from "@/stores/studio-store";
import { cn } from "@/lib/utils";

const TABS: Array<{
  id: StudioPhase;
  label: string;
  icon: typeof Camera;
}> = [
  { id: "camera", label: "Camera", icon: Camera },
  { id: "workspace", label: "Workspace", icon: Images },
  { id: "library", label: "Patterns", icon: Shapes },
];

export function StudioView() {
  const hydrate = useStudioStore((s) => s.hydrate);
  const phase = useStudioStore((s) => s.phase);
  const setPhase = useStudioStore((s) => s.setPhase);
  const photos = useStudioStore((s) => s.photos);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="space-y-6">
      <JourneyGuideBanner feature="studio" />
      <PageHeader
        eyebrow="Atelier"
        title="Studio"
        description="Capture fabric under good light, save it on this device, then overlay neckline patterns."
      />

      {photos.length > 0 ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground"
        >
          {photos.length} fabric photo{photos.length === 1 ? "" : "s"} saved on this device
        </motion.p>
      ) : null}

      <div
        role="tablist"
        aria-label="Studio sections"
        className="grid grid-cols-3 gap-1.5 rounded-2xl bg-muted/70 p-1.5 ring-1 ring-border/50"
      >
        {TABS.map((tab) => {
          const active = phase === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPhase(tab.id)}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold sm:text-sm",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="studio-tab-pill"
                  className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="size-3.5" aria-hidden="true" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {phase === "camera" ? (
        <FeatureErrorBoundary title="Camera panel failed">
          <CameraCapture />
        </FeatureErrorBoundary>
      ) : null}

      {phase === "workspace" ? (
        <div className="space-y-5">
          <StudioWorkspace />
          <StudioToolbar />
          <OverlayControls />
          <section aria-label="Saved fabric photos" className="space-y-2">
            <h2 className="text-sm font-semibold tracking-tight">Saved photos</h2>
            <PhotoLibrary />
          </section>
        </div>
      ) : null}

      {phase === "library" ? <PatternLibrary /> : null}
    </div>
  );
}
