import type { EngineCalculations } from "@/features/drafts/engine/calculations";

export type Point = { x: number; y: number };

export type ControlPointId =
  | "neckOut"
  | "neckMid"
  | "shoulderOut"
  | "armPitch"
  | "underarm"
  | "sideMid"
  | "waistEnd"
  | "hipEnd"
  | "hemEnd"
  | "dartTip"
  | "sleeveEnd";

export type DraftLabel = {
  id: string;
  text: string;
  at: Point;
};

export type EngineBoardGeometry = {
  /** Pixels per centimetre. */
  pxPerCm: number;
  origin: Point;
  centerTop: Point;
  centerBottom: Point;
  neckOut: Point;
  neckMid: Point;
  neckDepth: Point;
  shoulderOut: Point;
  armPitch: Point;
  underarm: Point;
  bustEnd: Point;
  waistEnd: Point;
  hipEnd: Point;
  hemEnd: Point;
  apex: Point;
  dartTip: Point;
  dartLeft: Point;
  dartRight: Point;
  sleeveEnd: Point;
  labels: DraftLabel[];
  /** Paper size in px for the stage content. */
  paper: { width: number; height: number };
};

const PX_PER_CM = 7;

function px(cm: number): number {
  return cm * PX_PER_CM;
}

export function buildEngineBoardGeometry(
  calc: EngineCalculations,
): EngineBoardGeometry {
  const d = calc.draft;
  const origin: Point = { x: 48, y: 40 };

  const centerTop = { ...origin };
  const centerBottom = { x: origin.x, y: origin.y + px(d.blouseLength) };

  const neckOut = { x: origin.x + px(d.neckWidth), y: origin.y };
  const neckDepth = { x: origin.x, y: origin.y + px(d.neckDepthFront) };
  const neckMid = {
    x: origin.x + px(d.neckWidth * 0.55),
    y: origin.y + px(d.neckDepthFront * 0.7),
  };

  const shoulderOut = {
    x: neckOut.x + px(d.shoulderLength) * 0.92,
    y: neckOut.y + px(d.shoulderDrop),
  };

  const bustY = origin.y + px(d.apexDepth);
  const bustEnd = { x: origin.x + px(d.bustQuarter), y: bustY };
  const apex = { x: origin.x + px(d.apexFromCenter), y: bustY };

  let underarmY = shoulderOut.y + px(d.armholeDepth);
  underarmY = Math.max(underarmY, bustY - px(1));
  underarmY = Math.min(underarmY, bustY + px(2.5));
  const underarm = { x: origin.x + px(d.bustQuarter), y: underarmY };

  const armPitch = {
    x: shoulderOut.x + px(1.4),
    y: shoulderOut.y + (underarm.y - shoulderOut.y) * 0.45,
  };

  const waistY = origin.y + px(Math.min(d.blouseLength - 3, d.apexDepth + 12));
  const waistEnd = { x: origin.x + px(d.waistQuarter), y: waistY };

  const hipY = origin.y + px(Math.min(d.blouseLength - 1, d.apexDepth + 18));
  const hipEnd = { x: origin.x + px(d.hipQuarter), y: hipY };

  const hemEnd = {
    x: origin.x + px(Math.max(d.waistQuarter, d.hipQuarter * 0.92)),
    y: centerBottom.y,
  };

  const dartTip = { x: apex.x, y: apex.y + px(2.8) };
  const half = px(d.dartIntake / 2);
  const dartLeft = { x: apex.x - half, y: waistY };
  const dartRight = { x: apex.x + half, y: waistY };

  const sleeveEnd = {
    x: shoulderOut.x + px(d.sleeveLength) * 0.35,
    y: shoulderOut.y + px(d.sleeveLength) * 0.85,
  };

  const labels: DraftLabel[] = [
    { id: "cf", text: "CF", at: { x: centerTop.x + 6, y: centerTop.y + 14 } },
    {
      id: "bust",
      text: `Bust ${(d.bustQuarter).toFixed(1)}`,
      at: { x: bustEnd.x + 6, y: bustEnd.y - 6 },
    },
    {
      id: "waist",
      text: `Waist ${d.waistQuarter.toFixed(1)}`,
      at: { x: waistEnd.x + 6, y: waistEnd.y - 6 },
    },
    {
      id: "hip",
      text: `Hip ${d.hipQuarter.toFixed(1)}`,
      at: { x: hipEnd.x + 6, y: hipEnd.y - 6 },
    },
    {
      id: "neck",
      text: `Neck ${d.neckWidth.toFixed(1)}`,
      at: { x: neckMid.x + 4, y: neckMid.y + 12 },
    },
    {
      id: "armhole",
      text: `AH ${d.armholeDepth.toFixed(1)}`,
      at: { x: armPitch.x - 36, y: armPitch.y },
    },
    {
      id: "dart",
      text: `Dart ${d.dartIntake.toFixed(1)}`,
      at: { x: dartTip.x + 8, y: dartTip.y + 14 },
    },
    {
      id: "sleeve",
      text: `Sleeve ${d.sleeveLength.toFixed(1)}`,
      at: { x: sleeveEnd.x + 4, y: sleeveEnd.y },
    },
    {
      id: "sa",
      text: `SA ${d.seamAllowance}`,
      at: { x: origin.x + 8, y: centerBottom.y + 18 },
    },
  ];

  const maxX = Math.max(bustEnd.x, hipEnd.x, hemEnd.x, sleeveEnd.x) + 60;
  const maxY = centerBottom.y + 48;

  return {
    pxPerCm: PX_PER_CM,
    origin,
    centerTop,
    centerBottom,
    neckOut,
    neckMid,
    neckDepth,
    shoulderOut,
    armPitch,
    underarm,
    bustEnd,
    waistEnd,
    hipEnd,
    hemEnd,
    apex,
    dartTip,
    dartLeft,
    dartRight,
    sleeveEnd,
    labels,
    paper: {
      width: Math.max(360, maxX),
      height: Math.max(420, maxY),
    },
  };
}

/** Default draggable control points derived from geometry. */
export function defaultControlPoints(
  geo: EngineBoardGeometry,
): Record<ControlPointId, Point> {
  const sideMid = {
    x: (geo.underarm.x + geo.waistEnd.x) / 2 + 4,
    y: (geo.underarm.y + geo.waistEnd.y) / 2,
  };
  return {
    neckOut: { ...geo.neckOut },
    neckMid: { ...geo.neckMid },
    shoulderOut: { ...geo.shoulderOut },
    armPitch: { ...geo.armPitch },
    underarm: { ...geo.underarm },
    sideMid,
    waistEnd: { ...geo.waistEnd },
    hipEnd: { ...geo.hipEnd },
    hemEnd: { ...geo.hemEnd },
    dartTip: { ...geo.dartTip },
    sleeveEnd: { ...geo.sleeveEnd },
  };
}

export function snapToGrid(
  value: number,
  gridSize: number,
  enabled: boolean,
): number {
  if (!enabled || gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

export const ENGINE_GRID_SIZE = 10;
