"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  DEFAULT_ENGINE_VALUES,
  ENGINE_FIELD_META,
  engineFormSchema,
  type EngineFormValues,
} from "@/features/drafts/engine/schema";
import { useUnit } from "@/hooks/use-unit";
import { cmToDisplayNumber, displayToCm } from "@/utils/units";
import { cn } from "@/lib/utils";

type MeasurementFormProps = {
  /** Engine chart in centimetres (source of truth). */
  values: EngineFormValues;
  onChange: (values: EngineFormValues) => void;
  className?: string;
};

function toDisplayValues(
  cmValues: EngineFormValues,
  unit: "in" | "cm",
): EngineFormValues {
  const next = { ...cmValues };
  for (const key of Object.keys(next) as Array<keyof EngineFormValues>) {
    next[key] = cmToDisplayNumber(cmValues[key], unit);
  }
  return next;
}

function toCmValues(
  displayValues: EngineFormValues,
  unit: "in" | "cm",
): EngineFormValues {
  const next = { ...displayValues };
  for (const key of Object.keys(next) as Array<keyof EngineFormValues>) {
    next[key] = displayToCm(displayValues[key], unit);
  }
  return next;
}

export function MeasurementForm({
  values,
  onChange,
  className,
}: MeasurementFormProps) {
  const { unit, ready, label } = useUnit();
  const [chartValid, setChartValid] = useState(true);
  const prevUnit = useRef(unit);

  const { register, getValues, reset } = useForm<EngineFormValues>({
    defaultValues: toDisplayValues(values, unit),
    mode: "onChange",
  });

  // Convert visible inputs when the global unit flips — keep parent cm chart
  // so user entries are never cleared, only re-labeled.
  useEffect(() => {
    if (!ready) return;
    if (prevUnit.current === unit) return;
    prevUnit.current = unit;
    reset(toDisplayValues(values, unit));
  }, [unit, ready, values, reset]);

  const emitIfValid = () => {
    const asCm = toCmValues(getValues(), unit);
    const next = engineFormSchema.safeParse(asCm);
    setChartValid(next.success);
    if (next.success) onChange(next.data);
  };

  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={(event) => event.preventDefault()}
      onInput={emitIfValid}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Body chart
          </h2>
          <p className="text-xs text-muted-foreground">
            Smart calculator · live unit ({label})
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/80">
            Header toggle converts fields in place — draft math stays consistent offline.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border/60 hover:bg-muted"
          onClick={() => {
            onChange(DEFAULT_ENGINE_VALUES);
            reset(toDisplayValues(DEFAULT_ENGINE_VALUES, unit));
            setChartValid(true);
          }}
        >
          Reset
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Body measurements
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ENGINE_FIELD_META.filter((field) => field.group === "body").map(
            (field) => {
              const displayDefault = cmToDisplayNumber(
                DEFAULT_ENGINE_VALUES[field.name],
                unit,
              );
              return (
                <label key={field.name} className="block space-y-1">
                  <span className="text-xs font-semibold">
                    {field.label} ({label})
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder={`${displayDefault} ${label}`}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register(field.name, { valueAsNumber: true })}
                  />
                  <span className="block text-[10px] text-muted-foreground">
                    {field.hint}
                  </span>
                </label>
              );
            },
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Ease & seam
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ENGINE_FIELD_META.filter((field) => field.group === "ease").map(
            (field) => {
              const displayDefault = cmToDisplayNumber(
                DEFAULT_ENGINE_VALUES[field.name],
                unit,
              );
              return (
                <label key={field.name} className="block space-y-1">
                  <span className="text-xs font-semibold">
                    {field.label} ({label})
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder={`${displayDefault} ${label}`}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register(field.name, { valueAsNumber: true })}
                  />
                  <span className="block text-[10px] text-muted-foreground">
                    {field.hint}
                  </span>
                </label>
              );
            },
          )}
        </div>
      </fieldset>

      {!chartValid ? (
        <p className="text-xs text-destructive" role="status">
          Enter valid body numbers ({label}) to update the draft board.
        </p>
      ) : null}
    </form>
  );
}
