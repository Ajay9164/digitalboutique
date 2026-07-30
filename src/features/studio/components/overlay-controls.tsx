"use client";

import { PATTERN_MAP } from "@/features/studio/data/patterns";
import { useStudioStore } from "@/stores/studio-store";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold tracking-tight">{label}</span>
        <span className="tabular-nums text-muted-foreground">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </label>
  );
}

export function OverlayControls({ className }: { className?: string }) {
  const { overlay, crop, zoom, patternId, setOverlay, setCrop, setZoom } =
    useStudioStore(
      useShallow((s) => ({
        overlay: s.overlay,
        crop: s.crop,
        zoom: s.zoom,
        patternId: s.patternId,
        setOverlay: s.setOverlay,
        setCrop: s.setCrop,
        setZoom: s.setZoom,
      })),
    );
  const pattern = PATTERN_MAP[patternId];

  return (
    <div
      className={cn(
        "space-y-4 rounded-3xl border border-border/60 bg-card/75 p-4 backdrop-blur-sm",
        className,
      )}
    >
      <div>
        <h3 className="font-display text-base font-semibold tracking-tight">
          Overlay controls
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{pattern.description}</p>
      </div>

      <SliderRow
        label="Scale"
        value={overlay.scale}
        min={0.25}
        max={3}
        step={0.01}
        display={`${Math.round(overlay.scale * 100)}%`}
        onChange={(scale) => setOverlay({ scale })}
      />
      <SliderRow
        label="Rotate"
        value={overlay.rotation}
        min={-180}
        max={180}
        step={1}
        display={`${Math.round(overlay.rotation)}°`}
        onChange={(rotation) => setOverlay({ rotation })}
      />
      <SliderRow
        label="Opacity"
        value={overlay.opacity}
        min={0.15}
        max={1}
        step={0.01}
        display={`${Math.round(overlay.opacity * 100)}%`}
        onChange={(opacity) => setOverlay({ opacity })}
      />
      <SliderRow
        label="Move X"
        value={overlay.x}
        min={-160}
        max={160}
        step={1}
        display={`${Math.round(overlay.x)}px`}
        onChange={(x) => setOverlay({ x })}
      />
      <SliderRow
        label="Move Y"
        value={overlay.y}
        min={-200}
        max={200}
        step={1}
        display={`${Math.round(overlay.y)}px`}
        onChange={(y) => setOverlay({ y })}
      />
      <SliderRow
        label="Zoom"
        value={zoom}
        min={0.5}
        max={3}
        step={0.01}
        display={`${Math.round(zoom * 100)}%`}
        onChange={setZoom}
      />
      <SliderRow
        label="Crop width"
        value={crop.width}
        min={0.2}
        max={1}
        step={0.01}
        display={`${Math.round(crop.width * 100)}%`}
        onChange={(width) => setCrop({ width })}
      />
      <SliderRow
        label="Crop height"
        value={crop.height}
        min={0.2}
        max={1}
        step={0.01}
        display={`${Math.round(crop.height * 100)}%`}
        onChange={(height) => setCrop({ height })}
      />
    </div>
  );
}
