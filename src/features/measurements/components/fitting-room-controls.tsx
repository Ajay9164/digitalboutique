"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, Shirt, Sparkles } from "lucide-react";
import {
  BODY_MORPH_MAX,
  BODY_MORPH_MIN,
  type BodyMorph,
  useMeasurementStore,
} from "@/stores/measurement-store";
import { useStudioStore } from "@/stores/studio-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MORPH_SLIDERS: Array<{
  key: keyof BodyMorph;
  label: string;
  hint: string;
}> = [
  { key: "bust", label: "Bust", hint: "Chest circumference" },
  { key: "waist", label: "Waist", hint: "Natural waist" },
  { key: "hips", label: "Hips", hint: "Fullest hip" },
];

function morphPercent(value: number): string {
  const pct = Math.round((value - 1) * 100);
  if (pct === 0) return "Baseline";
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Parametric fitting-room controls — body morph sliders + Studio fabric drape.
 */
export function FittingRoomControls({ className }: { className?: string }) {
  const bodyMorph = useMeasurementStore((s) => s.bodyMorph);
  const setBodyMorph = useMeasurementStore((s) => s.setBodyMorph);
  const resetBodyMorph = useMeasurementStore((s) => s.resetBodyMorph);
  const fabricDrapeEnabled = useMeasurementStore((s) => s.fabricDrapeEnabled);
  const setFabricDrapeEnabled = useMeasurementStore((s) => s.setFabricDrapeEnabled);
  const fabricPhotoId = useMeasurementStore((s) => s.fabricPhotoId);
  const setFabricPhotoId = useMeasurementStore((s) => s.setFabricPhotoId);

  const hydrateStudio = useStudioStore((s) => s.hydrate);
  const photos = useStudioStore((s) => s.photos);
  const activePhotoId = useStudioStore((s) => s.activePhotoId);

  useEffect(() => {
    void hydrateStudio();
  }, [hydrateStudio]);

  const selectedId = fabricPhotoId ?? activePhotoId;
  const hasFabric = photos.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-panel space-y-4 rounded-3xl p-4 sm:p-5", className)}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Fitting room
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
            Body morph & fabric drape
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Shape the dress form in real time, then project a Studio fabric
            capture onto the silk surface.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 rounded-xl"
          onClick={() => resetBodyMorph()}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </Button>
      </header>

      <div className="space-y-3.5">
        {MORPH_SLIDERS.map((slider) => (
          <label key={slider.key} className="block space-y-1.5">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold tracking-tight">
                {slider.label}
              </span>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-primary">
                {morphPercent(bodyMorph[slider.key])}
              </span>
            </span>
            <input
              type="range"
              min={BODY_MORPH_MIN}
              max={BODY_MORPH_MAX}
              step={0.01}
              value={bodyMorph[slider.key]}
              onChange={(event) =>
                setBodyMorph(slider.key, Number(event.target.value))
              }
              aria-valuetext={`${slider.label} ${morphPercent(bodyMorph[slider.key])}`}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <span className="text-[11px] text-muted-foreground">{slider.hint}</span>
          </label>
        ))}
      </div>

      <div className="space-y-3 border-t border-white/15 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Shirt className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">AR fabric drape</p>
              <p className="text-[11px] text-muted-foreground">
                Wrap a captured fabric onto the form
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={fabricDrapeEnabled}
            disabled={!hasFabric}
            onClick={() => setFabricDrapeEnabled(!fabricDrapeEnabled)}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
              fabricDrapeEnabled ? "bg-primary" : "bg-muted",
              !hasFabric && "opacity-50",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                fabricDrapeEnabled ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        {!hasFabric ? (
          <p className="rounded-2xl bg-muted/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            No fabric photos yet.{" "}
            <Link href="/studio" className="font-semibold text-primary underline-offset-2 hover:underline">
              Capture fabric in Studio
            </Link>{" "}
            first, then return here to drape it.
          </p>
        ) : (
          <ul className="flex gap-2 overflow-x-auto pb-0.5" aria-label="Fabric photos">
            {photos.slice(0, 8).map((photo) => {
              const active = selectedId === photo.id && fabricDrapeEnabled;
              return (
                <li key={photo.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFabricPhotoId(photo.id);
                      setFabricDrapeEnabled(true);
                    }}
                    className={cn(
                      "relative overflow-hidden rounded-xl ring-2 transition",
                      active
                        ? "neon-measure ring-neon"
                        : "ring-transparent hover:ring-border",
                    )}
                    aria-pressed={active}
                    aria-label={`Drape ${photo.label}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local IndexedDB data URL */}
                    <img
                      src={photo.dataUrl || photo.displayUrl}
                      alt=""
                      className="size-14 object-cover"
                    />
                    {active ? (
                      <span className="absolute inset-x-0 bottom-0 bg-neon/90 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-navy">
                        Live
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {fabricDrapeEnabled && hasFabric ? (
          <p className="flex items-center gap-1.5 text-[11px] text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            Fabric print projected onto MeshPhysicalMaterial — rotate to inspect
            borders and motifs.
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
