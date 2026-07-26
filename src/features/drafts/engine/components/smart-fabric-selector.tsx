"use client";

import { Sparkles } from "lucide-react";
import {
  FABRIC_OPTIONS,
  FABRIC_PROFILES,
  type FabricId,
} from "@/features/drafts/engine/fabric-profiles";
import { cn } from "@/lib/utils";

type SmartFabricSelectorProps = {
  value: FabricId | null;
  onChange: (fabric: FabricId | null) => void;
  className?: string;
};

/**
 * Silk vs Cotton selector — drives shrinkage & seam-allowance adjustments
 * before the Konva blueprint redraws.
 */
export function SmartFabricSelector({
  value,
  onChange,
  className,
}: SmartFabricSelectorProps) {
  return (
    <section
      className={cn("glass-panel space-y-3 rounded-3xl p-4", className)}
      aria-labelledby="smart-fabric-title"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3
            id="smart-fabric-title"
            className="font-display text-base font-semibold tracking-tight"
          >
            Smart Fabric Selector
          </h3>
          <p className="text-xs text-muted-foreground">
            Choose cloth behaviour — the engine pre-shrinks the block and widens
            seam allowances before drawing the blueprint.
          </p>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Fabric type"
        className="grid grid-cols-3 gap-2"
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          onClick={() => onChange(null)}
          className={cn(
            "rounded-2xl px-3 py-3 text-left transition",
            "ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === null
              ? "bg-primary text-primary-foreground ring-primary"
              : "bg-card/70 ring-border/70 hover:bg-muted/60",
          )}
        >
          <span className="block text-sm font-semibold">Net</span>
          <span
            className={cn(
              "mt-0.5 block text-[10px] leading-snug",
              value === null
                ? "text-primary-foreground/80"
                : "text-muted-foreground",
            )}
          >
            No fabric AI
          </span>
        </button>

        {FABRIC_OPTIONS.map((id) => {
          const profile = FABRIC_PROFILES[id];
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(id)}
              className={cn(
                "rounded-2xl px-3 py-3 text-left transition",
                "ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card/70 ring-border/70 hover:bg-muted/60",
              )}
            >
              <span className="block text-sm font-semibold">{profile.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[10px] leading-snug",
                  active
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
                )}
              >
                {Math.round((profile.shrinkageFactor - 1) * 100)}% shrink · SA +
                {profile.seamAllowanceDelta}
              </span>
            </button>
          );
        })}
      </div>

      {value ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {FABRIC_PROFILES[value].description}
        </p>
      ) : null}
    </section>
  );
}
