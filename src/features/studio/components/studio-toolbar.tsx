"use client";

import {
  Crop,
  Grid3x3,
  Magnet,
  Move,
  RotateCcw,
  RotateCw,
  Ruler,
  Scaling,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useStudioStore } from "@/stores/studio-store";
import type { StudioTool } from "@/features/studio/lib/overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOOLS: Array<{ id: StudioTool; label: string; icon: typeof Move }> = [
  { id: "move", label: "Move", icon: Move },
  { id: "scale", label: "Scale", icon: Scaling },
  { id: "rotate", label: "Rotate", icon: RotateCw },
  { id: "crop", label: "Crop", icon: Crop },
];

export function StudioToolbar({ className }: { className?: string }) {
  const tool = useStudioStore((s) => s.tool);
  const setTool = useStudioStore((s) => s.setTool);
  const zoom = useStudioStore((s) => s.zoom);
  const setZoom = useStudioStore((s) => s.setZoom);
  const showGrid = useStudioStore((s) => s.showGrid);
  const showRuler = useStudioStore((s) => s.showRuler);
  const snapEnabled = useStudioStore((s) => s.snapEnabled);
  const toggleGrid = useStudioStore((s) => s.toggleGrid);
  const toggleRuler = useStudioStore((s) => s.toggleRuler);
  const toggleSnap = useStudioStore((s) => s.toggleSnap);
  const resetOverlay = useStudioStore((s) => s.resetOverlay);
  const resetCrop = useStudioStore((s) => s.resetCrop);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="toolbar"
        aria-label="Overlay tools"
        className="flex flex-wrap gap-1.5"
      >
        {TOOLS.map((item) => {
          const Icon = item.icon;
          const active = tool === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className="rounded-xl"
              aria-pressed={active}
              onClick={() => setTool(item.id)}
            >
              <Icon aria-hidden="true" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div
        role="toolbar"
        aria-label="View aids"
        className="flex flex-wrap gap-1.5"
      >
        <Button
          type="button"
          size="sm"
          variant={showGrid ? "default" : "outline"}
          className="rounded-xl"
          aria-pressed={showGrid}
          onClick={toggleGrid}
        >
          <Grid3x3 aria-hidden="true" />
          Grid
        </Button>
        <Button
          type="button"
          size="sm"
          variant={showRuler ? "default" : "outline"}
          className="rounded-xl"
          aria-pressed={showRuler}
          onClick={toggleRuler}
        >
          <Ruler aria-hidden="true" />
          Ruler
        </Button>
        <Button
          type="button"
          size="sm"
          variant={snapEnabled ? "default" : "outline"}
          className="rounded-xl"
          aria-pressed={snapEnabled}
          onClick={toggleSnap}
        >
          <Magnet aria-hidden="true" />
          Snap
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => setZoom(zoom - 0.15)}
          aria-label="Zoom out"
        >
          <ZoomOut aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => setZoom(zoom + 0.15)}
          aria-label="Zoom in"
        >
          <ZoomIn aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-xl"
          onClick={() => {
            resetOverlay();
            resetCrop();
            setZoom(1);
          }}
        >
          <RotateCcw aria-hidden="true" />
          Reset
        </Button>
      </div>
    </div>
  );
}
