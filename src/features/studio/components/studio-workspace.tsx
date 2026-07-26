"use client";

import { useCallback, useEffect, useRef } from "react";
import { AlignmentGrid } from "@/features/studio/components/alignment-grid";
import { MeasurementRuler } from "@/features/studio/components/measurement-ruler";
import { PatternOverlay } from "@/features/studio/components/pattern-overlay";
import { snapPoint } from "@/features/studio/lib/overlay";
import { PATTERN_MAP } from "@/features/studio/data/patterns";
import { useStudioStore } from "@/stores/studio-store";
import { cn } from "@/lib/utils";

type StudioWorkspaceProps = {
  className?: string;
};

/**
 * Zoom via native wheel listener with `{ passive: false }`.
 * React's synthetic `onWheel` is passive, so preventDefault() there
 * triggers: "Unable to preventDefault inside passive event listener".
 */
function useNonPassiveWheelZoom(
  elementRef: React.RefObject<HTMLElement | null>,
  onZoom: (deltaY: number) => void,
) {
  const onZoomRef = useRef(onZoom);
  useEffect(() => {
    onZoomRef.current = onZoom;
  }, [onZoom]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      onZoomRef.current(event.deltaY);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [elementRef]);
}

export function StudioWorkspace({ className }: StudioWorkspaceProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: "move" | "scale" | "rotate" | "crop";
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originScale: number;
    originRotation: number;
    originCropX: number;
    originCropY: number;
    originCropW: number;
    originCropH: number;
  } | null>(null);

  const photos = useStudioStore((s) => s.photos);
  const activePhotoId = useStudioStore((s) => s.activePhotoId);
  const overlay = useStudioStore((s) => s.overlay);
  const crop = useStudioStore((s) => s.crop);
  const tool = useStudioStore((s) => s.tool);
  const zoom = useStudioStore((s) => s.zoom);
  const showGrid = useStudioStore((s) => s.showGrid);
  const showRuler = useStudioStore((s) => s.showRuler);
  const snapEnabled = useStudioStore((s) => s.snapEnabled);
  const patternId = useStudioStore((s) => s.patternId);
  const setOverlay = useStudioStore((s) => s.setOverlay);
  const setCrop = useStudioStore((s) => s.setCrop);
  const setZoom = useStudioStore((s) => s.setZoom);

  const photo = photos.find((item) => item.id === activePhotoId) ?? null;
  const pattern = PATTERN_MAP[patternId];

  const handleZoomDelta = useCallback(
    (deltaY: number) => {
      const delta = deltaY > 0 ? -0.08 : 0.08;
      setZoom(zoom + delta);
    },
    [setZoom, zoom],
  );

  useNonPassiveWheelZoom(frameRef, handleZoomDelta);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!photo) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        mode: tool,
        startX: event.clientX,
        startY: event.clientY,
        originX: overlay.x,
        originY: overlay.y,
        originScale: overlay.scale,
        originRotation: overlay.rotation,
        originCropX: crop.x,
        originCropY: crop.y,
        originCropW: crop.width,
        originCropH: crop.height,
      };
    },
    [crop, overlay, photo, tool],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const frame = frameRef.current;
      if (!drag || !frame) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const rect = frame.getBoundingClientRect();

      if (drag.mode === "move") {
        const snapped = snapPoint(
          drag.originX + dx,
          drag.originY + dy,
          rect.width,
          rect.height,
          snapEnabled,
        );
        setOverlay({ x: snapped.x, y: snapped.y });
        return;
      }

      if (drag.mode === "scale") {
        const next = drag.originScale + dx / 180;
        setOverlay({ scale: Math.min(3, Math.max(0.25, next)) });
        return;
      }

      if (drag.mode === "rotate") {
        setOverlay({ rotation: drag.originRotation + dx * 0.45 });
        return;
      }

      if (drag.mode === "crop") {
        setCrop({
          x: drag.originCropX + dx / rect.width,
          y: drag.originCropY + dy / rect.height,
          width: drag.originCropW,
          height: drag.originCropH,
        });
      }
    },
    [setCrop, setOverlay, snapEnabled],
  );

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }, []);

  if (!photo) {
    return (
      <div
        className={cn(
          "flex h-[360px] items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/30 px-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Capture and save a fabric photo to open the studio workspace.
      </div>
    );
  }

  const clipPath = `inset(${crop.y * 100}% ${(1 - crop.x - crop.width) * 100}% ${(1 - crop.y - crop.height) * 100}% ${crop.x * 100}%)`;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {photo.label}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {pattern.label} · drag to {tool} · scroll to zoom
          </p>
        </div>
        <p className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold tabular-nums uppercase tracking-wider text-muted-foreground">
          {Math.round(zoom * 100)}%
        </p>
      </div>

      <div
        ref={frameRef}
        role="application"
        aria-label="Studio workspace. Use tools to move, scale, rotate, or crop the pattern overlay."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "relative touch-none overflow-hidden rounded-3xl border border-white/40 bg-zinc-900 shadow-[0_18px_50px_-24px_rgba(15,23,28,0.5)] dark:border-white/10",
          "aspect-[3/4] w-full cursor-grab active:cursor-grabbing sm:aspect-[4/5]",
          tool === "crop" && "cursor-crosshair",
        )}
      >
        <div
          className="absolute inset-0 origin-center transition-transform duration-150"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.displayUrl}
            alt="Captured fabric"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover"
            style={{ clipPath }}
          />

          {tool === "crop" ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black/45"
              style={{
                clipPath: `polygon(
                  0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                  ${crop.x * 100}% ${crop.y * 100}%,
                  ${crop.x * 100}% ${(crop.y + crop.height) * 100}%,
                  ${(crop.x + crop.width) * 100}% ${(crop.y + crop.height) * 100}%,
                  ${(crop.x + crop.width) * 100}% ${crop.y * 100}%,
                  ${crop.x * 100}% ${crop.y * 100}%
                )`,
              }}
            />
          ) : null}

          {showGrid ? <AlignmentGrid /> : null}
          {showRuler ? <MeasurementRuler /> : null}

          <PatternOverlay />
        </div>

        {tool === "crop" ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute border-2 border-primary"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.width * 100}%`,
              height: `${crop.height * 100}%`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
