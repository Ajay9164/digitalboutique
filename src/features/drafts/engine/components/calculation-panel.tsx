"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, ChevronDown } from "lucide-react";
import type {
  CalculationBreakdownRow,
  CalculationResult,
} from "@/features/drafts/engine/calculations";
import { useUnit } from "@/hooks/use-unit";
import { formatFromCm, resolveMeasureTemplate } from "@/utils/units";
import { cn } from "@/lib/utils";

function formatBreakdownRow(
  row: CalculationBreakdownRow,
  unit: "in" | "cm",
): string {
  if (row.cm != null) return formatFromCm(row.cm, unit);
  return row.text ?? "—";
}

type CalculationPanelProps = {
  results: CalculationResult[];
  className?: string;
};

export function CalculationPanel({ results, className }: CalculationPanelProps) {
  const { unit } = useUnit();
  const [openId, setOpenId] = useState<string | null>(results[0]?.id ?? null);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Calculator className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Auto calculations
          </h2>
          <p className="text-xs text-muted-foreground">
            Every formula explained — tap a row for the breakdown
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {results.map((result) => {
          const open = openId === result.id;
          return (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : result.id)}
                aria-expanded={open}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                  open
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 bg-card/70 hover:bg-muted/50",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tracking-tight">
                    {result.label}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {resolveMeasureTemplate(result.formula, unit)}
                  </p>
                </div>
                <p className="font-display text-lg font-semibold tabular-nums text-primary">
                  {formatFromCm(result.value, unit)}
                </p>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 px-3.5 pb-3 pt-2">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {resolveMeasureTemplate(result.explanation, unit)}
                      </p>
                      <dl className="grid grid-cols-2 gap-1.5">
                        {result.breakdown.map((row) => (
                          <div
                            key={row.label}
                            className="rounded-xl bg-muted/50 px-2.5 py-2"
                          >
                            <dt className="text-[10px] text-muted-foreground">
                              {row.label}
                            </dt>
                            <dd className="text-xs font-semibold tabular-nums">
                              {formatBreakdownRow(row, unit)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
