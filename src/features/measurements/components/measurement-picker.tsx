"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import {
  MEASUREMENTS,
  MEASUREMENT_GROUPS,
} from "@/features/measurements/data/measurements";
import { useMeasurementStore } from "@/stores/measurement-store";
import { cn } from "@/lib/utils";

export function MeasurementPicker() {
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const learnedIds = useMeasurementStore((s) => s.learnedIds);
  const select = useMeasurementStore((s) => s.select);

  return (
    <div className="space-y-4">
      {MEASUREMENT_GROUPS.map((group) => {
        const items = MEASUREMENTS.filter((m) => m.group === group);
        return (
          <section key={group} aria-label={group}>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => {
                const active = selectedId === item.id;
                const learned = learnedIds.includes(item.id);
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => select(active ? null : item.id)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
                      active
                        ? "neon-measure bg-[color-mix(in_oklch,var(--neon)_18%,black)] text-neon ring-neon/60"
                        : "bg-card/70 text-foreground ring-border/70 hover:bg-muted",
                    )}
                  >
                    {learned ? (
                      <CheckCircle2
                        className={cn(
                          "size-3.5",
                          active ? "text-neon" : "text-primary",
                        )}
                        aria-label="Learned"
                      />
                    ) : null}
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
