"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  PATTERN_TYPE_OPTIONS,
  fileToDataUrl,
  type PatternTypeOption,
} from "@/features/journal/lib/project";
import type { ProjectMeasurements } from "@/lib/db";
import { useJournalStore } from "@/stores/journal-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MEASUREMENT_FIELDS: Array<{
  key: keyof ProjectMeasurements;
  label: string;
}> = [
  { key: "bust", label: "Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "neck", label: "Neck" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeveLength", label: "Sleeve" },
  { key: "blouseLength", label: "Blouse length" },
  { key: "apexDistance", label: "Apex distance" },
  { key: "apexDepth", label: "Apex depth" },
];

type ProjectFormProps = {
  title: string;
  onCancel: () => void;
};

export function ProjectForm({ title, onCancel }: ProjectFormProps) {
  const fabricRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef<HTMLInputElement>(null);

  const draft = useJournalStore((s) => s.draft);
  const setDraft = useJournalStore((s) => s.setDraft);
  const setDraftMeasurements = useJournalStore((s) => s.setDraftMeasurements);
  const setDraftLearning = useJournalStore((s) => s.setDraftLearning);
  const saveDraft = useJournalStore((s) => s.saveDraft);
  const errorMessage = useJournalStore((s) => s.errorMessage);

  const onImage = async (
    file: File | undefined,
    field: "fabricPhoto" | "draftImage",
  ) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setDraft({ [field]: dataUrl });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="rounded-full"
          aria-label="Close"
          onClick={onCancel}
        >
          <X aria-hidden="true" />
        </Button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project name
          </span>
          <input
            type="text"
            value={draft.name}
            onChange={(event) => setDraft({ name: event.target.value })}
            placeholder="e.g. Meera — silk blouse"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </span>
            <input
              type="date"
              value={toDateInput(draft.date)}
              onChange={(event) =>
                setDraft({ date: new Date(`${event.target.value}T12:00:00`) })
              }
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pattern type
            </span>
            <select
              value={draft.patternType}
              onChange={(event) =>
                setDraft({
                  patternType: event.target.value as PatternTypeOption,
                })
              }
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {PATTERN_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ImageField
            label="Fabric photo"
            src={draft.fabricPhoto}
            onPick={() => fabricRef.current?.click()}
            onClear={() => setDraft({ fabricPhoto: null })}
          />
          <ImageField
            label="Draft image"
            src={draft.draftImage}
            onPick={() => draftRef.current?.click()}
            onClear={() => setDraft({ draftImage: null })}
          />
          <input
            ref={fabricRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) =>
              void onImage(event.target.files?.[0], "fabricPhoto")
            }
          />
          <input
            ref={draftRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) =>
              void onImage(event.target.files?.[0], "draftImage")
            }
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Measurements (cm)
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {MEASUREMENT_FIELDS.map((field) => (
              <label key={field.key} className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  {field.label}
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={
                    typeof draft.measurements[field.key] === "number"
                      ? draft.measurements[field.key]
                      : ""
                  }
                  onChange={(event) => {
                    const raw = event.target.value;
                    setDraftMeasurements({
                      [field.key]:
                        raw === "" ? undefined : Number.parseFloat(raw),
                    });
                  }}
                  className="h-9 w-full rounded-xl border border-border bg-background px-2 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Alteration notes
          </span>
          <textarea
            value={draft.alterationNotes}
            onChange={(event) =>
              setDraft({ alterationNotes: event.target.value })
            }
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Take in side seam 0.5 cm, deepen neck…"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Observations
          </span>
          <textarea
            value={draft.observations}
            onChange={(event) => setDraft({ observations: event.target.value })}
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Client prefers soft ease, fabric slips on bias…"
          />
        </label>

        <fieldset className="space-y-2 rounded-2xl border border-border/60 bg-muted/30 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Learning progress
          </legend>
          <label className="block space-y-1">
            <span className="text-[11px] text-muted-foreground">
              Percent complete
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={draft.learningProgress.percentComplete}
              onChange={(event) =>
                setDraftLearning({
                  percentComplete: Number(event.target.value),
                })
              }
              className="w-full accent-primary"
            />
            <span className="text-xs font-semibold tabular-nums">
              {draft.learningProgress.percentComplete}%
            </span>
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] text-muted-foreground">
              Practice completions
            </span>
            <input
              type="number"
              min={0}
              value={draft.learningProgress.practiceCompletions}
              onChange={(event) =>
                setDraftLearning({
                  practiceCompletions: Number(event.target.value) || 0,
                })
              }
              className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] text-muted-foreground">
              Learning notes
            </span>
            <textarea
              value={draft.learningProgress.notes ?? ""}
              onChange={(event) =>
                setDraftLearning({ notes: event.target.value })
              }
              rows={2}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </fieldset>

        {errorMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <footer className="flex gap-2 border-t border-border/60 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 rounded-xl"
          onClick={() => void saveDraft()}
        >
          Save project
        </Button>
      </footer>
    </div>
  );
}

function toDateInput(date: Date): string {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ImageField({
  label,
  src,
  onPick,
  onClear,
}: {
  label: string;
  src: string | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <button
        type="button"
        onClick={onPick}
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/80 bg-muted/40",
          src && "border-solid",
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <ImagePlus className="size-5" aria-hidden="true" />
            Add image
          </span>
        )}
      </button>
      {src ? (
        <button
          type="button"
          className="text-[11px] font-semibold text-destructive"
          onClick={onClear}
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}
