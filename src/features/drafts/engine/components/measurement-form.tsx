"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DEFAULT_ENGINE_VALUES,
  ENGINE_FIELD_META,
  engineFormSchema,
  type EngineFormValues,
} from "@/features/drafts/engine/schema";
import { cn } from "@/lib/utils";

type MeasurementFormProps = {
  onChange: (values: EngineFormValues) => void;
  className?: string;
};

export function MeasurementForm({ onChange, className }: MeasurementFormProps) {
  const {
    register,
    getValues,
    formState: { errors, isValid },
    reset,
  } = useForm<EngineFormValues>({
    resolver: zodResolver(engineFormSchema),
    defaultValues: DEFAULT_ENGINE_VALUES,
    mode: "onChange",
  });

  const emitIfValid = () => {
    const next = engineFormSchema.safeParse(getValues());
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
            React Hook Form + Zod · centimetres
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border/60 hover:bg-muted"
          onClick={() => {
            reset(DEFAULT_ENGINE_VALUES);
            onChange(DEFAULT_ENGINE_VALUES);
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
            (field) => (
              <label key={field.name} className="block space-y-1">
                <span className="text-xs font-semibold">{field.label}</span>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  aria-invalid={!!errors[field.name]}
                  aria-describedby={`${field.name}-hint`}
                  className={cn(
                    "h-10 w-full rounded-xl border bg-background px-3 text-sm font-semibold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    errors[field.name]
                      ? "border-destructive"
                      : "border-border",
                  )}
                  {...register(field.name, { valueAsNumber: true })}
                />
                <span
                  id={`${field.name}-hint`}
                  className="block text-[10px] text-muted-foreground"
                >
                  {errors[field.name]?.message?.toString() ?? field.hint}
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Ease & seam
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ENGINE_FIELD_META.filter((field) => field.group === "ease").map(
            (field) => (
              <label key={field.name} className="block space-y-1">
                <span className="text-xs font-semibold">{field.label}</span>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  aria-invalid={!!errors[field.name]}
                  className={cn(
                    "h-10 w-full rounded-xl border bg-background px-3 text-sm font-semibold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    errors[field.name]
                      ? "border-destructive"
                      : "border-border",
                  )}
                  {...register(field.name, { valueAsNumber: true })}
                />
                <span className="block text-[10px] text-muted-foreground">
                  {errors[field.name]?.message?.toString() ?? field.hint}
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>

      {!isValid ? (
        <p className="text-xs text-destructive" role="status">
          Fix the highlighted fields to update the draft board.
        </p>
      ) : null}
    </form>
  );
}
