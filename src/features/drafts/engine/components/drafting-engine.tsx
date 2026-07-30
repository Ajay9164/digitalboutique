"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FileDown, FileImage, Grid3x3, Magnet, Printer } from "lucide-react";
import type { DraftBoardHandle } from "@/features/drafts/engine/components/interactive-draft-board";
import { MeasurementForm } from "@/features/drafts/engine/components/measurement-form";
import { CalculationPanel } from "@/features/drafts/engine/components/calculation-panel";
import { SmartFabricSelector } from "@/features/drafts/engine/components/smart-fabric-selector";
import { computeEngineCalculations } from "@/features/drafts/engine/calculations";
import {
  applyFabricAdjustments,
  type FabricId,
} from "@/features/drafts/engine/fabric-profiles";
import {
  DEFAULT_ENGINE_VALUES,
  type EngineFormValues,
} from "@/features/drafts/engine/schema";
import {
  exportStagePdf,
  exportStagePng,
  openPrintLayout,
} from "@/features/drafts/engine/export";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useUnit } from "@/hooks/use-unit";
import { formatFromCm } from "@/utils/units";
import { cn } from "@/lib/utils";

const InteractiveDraftBoard = dynamic(
  () =>
    import("@/features/drafts/engine/components/interactive-draft-board").then(
      (mod) => mod.InteractiveDraftBoard,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[420px] w-full rounded-3xl" />,
  },
);

/** Typing stays instant; Konva + formula panel update after this quiet period. */
const DRAFT_CALC_DEBOUNCE_MS = 180;

export function DraftingEngine({ className }: { className?: string }) {
  const boardRef = useRef<DraftBoardHandle>(null);
  const { unit } = useUnit();
  const [values, setValues] = useState<EngineFormValues>(DEFAULT_ENGINE_VALUES);
  const [fabric, setFabric] = useState<FabricId | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [exportError, setExportError] = useState<string | null>(null);

  const debouncedValues = useDebouncedValue(values, DRAFT_CALC_DEBOUNCE_MS);

  const calculations = useMemo(
    () =>
      applyFabricAdjustments(
        computeEngineCalculations(debouncedValues),
        fabric,
      ),
    [debouncedValues, fabric],
  );

  const withStage = (
    action: (
      stage: NonNullable<ReturnType<DraftBoardHandle["getStage"]>>,
    ) => void,
  ) => {
    const stage = boardRef.current?.getStage();
    if (!stage) {
      setExportError("Draft board is not ready yet.");
      return;
    }
    try {
      setExportError(null);
      action(stage);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Export failed.",
      );
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Intelligent drafting engine
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter body measurements — pick Silk or Cotton for smart shrinkage,
          then the engine calculates every drafting value, draws the block, and
          exports print-ready files.
        </p>
      </div>

      <MeasurementForm values={values} onChange={setValues} />

      <SmartFabricSelector value={fabric} onChange={setFabric} />

      <CalculationPanel results={calculations.results} />

      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant={showGrid ? "default" : "outline"}
          className="rounded-xl"
          aria-pressed={showGrid}
          onClick={() => setShowGrid((value) => !value)}
        >
          <Grid3x3 aria-hidden="true" />
          Grid
        </Button>
        <Button
          type="button"
          size="sm"
          variant={snapEnabled ? "default" : "outline"}
          className="rounded-xl"
          aria-pressed={snapEnabled}
          onClick={() => setSnapEnabled((value) => !value)}
        >
          <Magnet aria-hidden="true" />
          Snap
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() =>
            withStage((stage) => exportStagePng(stage, "tailor-draft.png"))
          }
        >
          <FileImage aria-hidden="true" />
          PNG
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() =>
            withStage((stage) => {
              void exportStagePdf(stage, "tailor-draft.pdf");
            })
          }
        >
          <FileDown aria-hidden="true" />
          PDF
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() =>
            withStage((stage) =>
              openPrintLayout(
                stage,
                calculations.results.map((result) => ({
                  label: result.label,
                  formula: result.formula,
                  value: formatFromCm(result.value, unit),
                })),
              ),
            )
          }
        >
          <Printer aria-hidden="true" />
          Print layout
        </Button>
      </div>

      {exportError ? (
        <p className="text-xs text-destructive" role="alert">
          {exportError}
        </p>
      ) : null}

      <InteractiveDraftBoard
        ref={boardRef}
        calculations={calculations}
        showGrid={showGrid}
        snapEnabled={snapEnabled}
      />
    </div>
  );
}
