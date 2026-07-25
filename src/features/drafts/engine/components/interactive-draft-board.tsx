"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type Konva from "konva";
import { Stage, Layer, Line, Circle, Text, Group, Rect } from "react-konva";
import type { EngineCalculations } from "@/features/drafts/engine/calculations";
import {
  ENGINE_GRID_SIZE,
  buildEngineBoardGeometry,
  defaultControlPoints,
  snapToGrid,
  type ControlPointId,
  type Point,
} from "@/features/drafts/engine/konva-geometry";
import { cn } from "@/lib/utils";

export type DraftBoardHandle = {
  getStage: () => Konva.Stage | null;
};

type InteractiveDraftBoardProps = {
  calculations: EngineCalculations;
  showGrid: boolean;
  snapEnabled: boolean;
  className?: string;
};

const CONTROL_IDS: ControlPointId[] = [
  "neckOut",
  "neckMid",
  "shoulderOut",
  "armPitch",
  "underarm",
  "sideMid",
  "waistEnd",
  "hipEnd",
  "hemEnd",
  "dartTip",
  "sleeveEnd",
];

function sampleQuad(a: Point, b: Point, c: Point, steps = 24): number[] {
  const points: number[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * a.x + 2 * u * t * b.x + t * t * c.x;
    const y = u * u * a.y + 2 * u * t * b.y + t * t * c.y;
    points.push(x, y);
  }
  return points;
}

function InteractiveDraftBoardInner(
  {
    calculations,
    showGrid,
    snapEnabled,
    className,
  }: InteractiveDraftBoardProps,
  ref: React.Ref<DraftBoardHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [size, setSize] = useState({ width: 360, height: 420 });
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef<{ x: number; y: number; sx: number; sy: number } | null>(
    null,
  );

  const baseGeo = useMemo(
    () => buildEngineBoardGeometry(calculations),
    [calculations],
  );

  const [controls, setControls] = useState(() => defaultControlPoints(baseGeo));
  const [history, setHistory] = useState<Array<Record<ControlPointId, Point>>>(() => [
    defaultControlPoints(baseGeo),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const skipHistory = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.floor(entry.contentRect.width);
      const height = Math.max(360, Math.floor(width * 1.15));
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
  }));

  const pushHistory = useCallback((next: Record<ControlPointId, Point>) => {
    if (skipHistory.current) return;
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, next].slice(-40);
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    skipHistory.current = true;
    setHistoryIndex(nextIndex);
    setControls(history[nextIndex]);
    skipHistory.current = false;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    skipHistory.current = true;
    setHistoryIndex(nextIndex);
    setControls(history[nextIndex]);
    skipHistory.current = false;
  }, [history, historyIndex]);

  const moveControl = (id: ControlPointId, x: number, y: number, commit: boolean) => {
    const nextPoint = {
      x: snapToGrid(x, ENGINE_GRID_SIZE, snapEnabled),
      y: snapToGrid(y, ENGINE_GRID_SIZE, snapEnabled),
    };
    setControls((prev) => {
      const next = { ...prev, [id]: nextPoint };
      if (commit) pushHistory(next);
      return next;
    });
  };

  const onWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const scaleBy = 1.08;
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(3, Math.max(0.4, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy));

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    setScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const g = baseGeo;
  const c = controls;

  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    const lines: React.ReactNode[] = [];
    const { width, height } = g.paper;
    for (let x = 0; x <= width; x += ENGINE_GRID_SIZE) {
      lines.push(
        <Line
          key={`vx-${x}`}
          points={[x, 0, x, height]}
          stroke="rgba(30,40,50,0.08)"
          strokeWidth={1}
          listening={false}
        />,
      );
    }
    for (let y = 0; y <= height; y += ENGINE_GRID_SIZE) {
      lines.push(
        <Line
          key={`hy-${y}`}
          points={[0, y, width, y]}
          stroke="rgba(30,40,50,0.08)"
          strokeWidth={1}
          listening={false}
        />,
      );
    }
    return lines;
  }, [g.paper, showGrid]);

  const neckCurve = sampleQuad(c.neckOut, c.neckMid, g.neckDepth);
  const armholeCurve = sampleQuad(c.shoulderOut, c.armPitch, c.underarm);
  const sideCurve = [
    ...sampleQuad(c.underarm, c.sideMid, c.waistEnd),
    c.hipEnd.x,
    c.hipEnd.y,
    c.hemEnd.x,
    c.hemEnd.y,
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Scroll to zoom · Space/middle-drag to pan · Drag teal handles to reshape curves
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-border/60 disabled:opacity-40"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            Undo
          </button>
          <button
            type="button"
            className="rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-border/60 disabled:opacity-40"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            Redo
          </button>
          <button
            type="button"
            className="rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-border/60"
            onClick={() => {
              setScale(1);
              setStagePos({ x: 0, y: 0 });
            }}
          >
            Reset view
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden rounded-3xl border border-white/40 bg-[#F4F1EA] shadow-[0_18px_50px_-24px_rgba(15,23,28,0.35)] dark:border-white/10 dark:bg-zinc-900"
        onMouseDown={(event) => {
          if (event.button === 1 || event.shiftKey) {
            setIsPanning(true);
            panRef.current = {
              x: event.clientX,
              y: event.clientY,
              sx: stagePos.x,
              sy: stagePos.y,
            };
          }
        }}
        onMouseMove={(event) => {
          if (!isPanning || !panRef.current) return;
          setStagePos({
            x: panRef.current.sx + (event.clientX - panRef.current.x),
            y: panRef.current.sy + (event.clientY - panRef.current.y),
          });
        }}
        onMouseUp={() => {
          setIsPanning(false);
          panRef.current = null;
        }}
        onMouseLeave={() => {
          setIsPanning(false);
          panRef.current = null;
        }}
      >
        <Stage
          ref={(node) => {
            stageRef.current = node;
          }}
          width={size.width}
          height={size.height}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={onWheel}
          draggable={false}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={g.paper.width}
              height={g.paper.height}
              fill="#F7F4EE"
              listening={false}
            />
            {gridLines}

            {/* Center line */}
            <Line
              points={[g.centerTop.x, g.centerTop.y, g.centerBottom.x, g.centerBottom.y]}
              stroke="#1F2A32"
              strokeWidth={1.8}
              listening={false}
            />

            {/* Bust / waist / hip construction */}
            <Line
              points={[g.centerTop.x, g.bustEnd.y, g.bustEnd.x, g.bustEnd.y]}
              stroke="#7A8792"
              strokeWidth={1.2}
              dash={[6, 4]}
              listening={false}
            />
            <Line
              points={[g.centerTop.x, g.waistEnd.y, c.waistEnd.x, c.waistEnd.y]}
              stroke="#7A8792"
              strokeWidth={1.2}
              dash={[6, 4]}
              listening={false}
            />
            <Line
              points={[g.centerTop.x, g.hipEnd.y, c.hipEnd.x, c.hipEnd.y]}
              stroke="#7A8792"
              strokeWidth={1.2}
              dash={[6, 4]}
              listening={false}
            />

            {/* Shoulder */}
            <Line
              points={[c.neckOut.x, c.neckOut.y, c.shoulderOut.x, c.shoulderOut.y]}
              stroke="#1A6B5A"
              strokeWidth={2}
              listening={false}
            />

            {/* Neck curve */}
            <Line
              points={neckCurve}
              stroke="#1A6B5A"
              strokeWidth={2}
              lineCap="round"
              listening={false}
            />

            {/* Armhole curve */}
            <Line
              points={armholeCurve}
              stroke="#1A6B5A"
              strokeWidth={2}
              lineCap="round"
              listening={false}
            />

            {/* Side seam + hip + hem */}
            <Line
              points={sideCurve}
              stroke="#1A6B5A"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
              listening={false}
            />

            {/* Hem */}
            <Line
              points={[g.centerBottom.x, g.centerBottom.y, c.hemEnd.x, c.hemEnd.y]}
              stroke="#1A6B5A"
              strokeWidth={2}
              listening={false}
            />

            {/* Darts */}
            <Line
              points={[g.dartLeft.x, g.dartLeft.y, c.dartTip.x, c.dartTip.y]}
              stroke="#C45C26"
              strokeWidth={1.6}
              listening={false}
            />
            <Line
              points={[g.dartRight.x, g.dartRight.y, c.dartTip.x, c.dartTip.y]}
              stroke="#C45C26"
              strokeWidth={1.6}
              listening={false}
            />

            {/* Sleeve guide */}
            <Line
              points={[c.shoulderOut.x, c.shoulderOut.y, c.sleeveEnd.x, c.sleeveEnd.y]}
              stroke="#5B7C99"
              strokeWidth={1.5}
              dash={[4, 4]}
              listening={false}
            />

            {/* Apex */}
            <Circle
              x={g.apex.x}
              y={g.apex.y}
              radius={3}
              fill="#1A6B5A"
              listening={false}
            />

            {/* Measurement labels */}
            {g.labels.map((label) => (
              <Text
                key={label.id}
                x={label.at.x}
                y={label.at.y}
                text={label.text}
                fontSize={11}
                fontFamily="Outfit, sans-serif"
                fill="#3D4A54"
                listening={false}
              />
            ))}

            {/* Control points */}
            <Group>
              {CONTROL_IDS.map((id) => (
                <Circle
                  key={id}
                  x={c[id].x}
                  y={c[id].y}
                  radius={6}
                  fill="#2DD4BF"
                  stroke="#0F766E"
                  strokeWidth={1.5}
                  draggable
                  onDragMove={(event) => {
                    moveControl(id, event.target.x(), event.target.y(), false);
                  }}
                  onDragEnd={(event) => {
                    moveControl(id, event.target.x(), event.target.y(), true);
                  }}
                />
              ))}
            </Group>
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export const InteractiveDraftBoard = forwardRef(InteractiveDraftBoardInner);
InteractiveDraftBoard.displayName = "InteractiveDraftBoard";
