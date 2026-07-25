import type {
  BodyMeasurements,
  DraftingInputs,
  DraftingMeasurements,
} from "@/features/drafts/data/formulas";
import {
  DEFAULT_DRAFTING_INPUTS,
  computeDraftingMeasurements,
} from "@/features/drafts/data/formulas";
import type { ConstructionStepId } from "@/features/drafts/data/construction-steps";

/**
 * SVG coordinate geometry for a half-front blouse block.
 * Origin (0,0) is top-left of the paper; drafting origin sits inset.
 */

export type Point = { x: number; y: number };

export type DraftGeometry = {
  /** Pixels per centimetre. */
  scale: number;
  origin: Point;
  centerTop: Point;
  centerBottom: Point;
  neckOut: Point;
  neckDepth: Point;
  shoulderOut: Point;
  underarm: Point;
  bustEnd: Point;
  waistEnd: Point;
  hemEnd: Point;
  apex: Point;
  dartTip: Point;
  dartLeft: Point;
  dartRight: Point;
  measurements: DraftingMeasurements;
  /** Path strings for curved construction. */
  paths: {
    neck: string;
    armhole: string;
    sideSeam: string;
  };
};

const SCALE = 6.2;
const ORIGIN_X = 36;
const ORIGIN_Y = 28;

function px(cm: number, scale = SCALE): number {
  return cm * scale;
}

export function buildDraftGeometry(
  body: BodyMeasurements,
  inputs: DraftingInputs = DEFAULT_DRAFTING_INPUTS,
): DraftGeometry {
  const m = computeDraftingMeasurements(body, inputs);
  const o: Point = { x: ORIGIN_X, y: ORIGIN_Y };

  const centerTop = { ...o };
  const centerBottom = { x: o.x, y: o.y + px(m.blouseLength) };

  const neckOut = { x: o.x + px(m.neckWidth), y: o.y };
  const neckDepth = { x: o.x, y: o.y + px(m.neckDepthFront) };

  const shoulderOut = {
    x: neckOut.x + px(m.shoulderLength) * 0.92,
    y: neckOut.y + px(m.shoulderDrop),
  };

  const bustY = o.y + px(m.apexDepth);
  const bustEnd = { x: o.x + px(m.bustQuarter), y: bustY };
  const apex = { x: o.x + px(m.apexFromCenter), y: bustY };

  const underarm = {
    x: o.x + px(m.bustQuarter),
    y: shoulderOut.y + px(m.armholeDepth),
  };

  // Keep underarm near bust line for a coherent scye
  underarm.y = Math.max(underarm.y, bustY - px(1));
  underarm.y = Math.min(underarm.y, bustY + px(2));

  const waistY = o.y + px(Math.min(m.blouseLength - 2, m.apexDepth + 12));
  const waistEnd = { x: o.x + px(m.waistQuarter), y: waistY };

  const hemEnd = {
    x: o.x + px(m.hemWidth),
    y: centerBottom.y,
  };

  const dartTip = {
    x: apex.x,
    y: apex.y + px(2.8),
  };
  const halfIntake = px(m.dartIntake / 2);
  const dartLeft = { x: apex.x - halfIntake, y: waistY };
  const dartRight = { x: apex.x + halfIntake, y: waistY };

  // Neck curve: neckOut → mid → neckDepth
  const neckMid = {
    x: o.x + px(m.neckWidth * 0.55),
    y: o.y + px(m.neckDepthFront * 0.7),
  };
  const neck = `M ${neckOut.x} ${neckOut.y} Q ${neckMid.x} ${neckMid.y} ${neckDepth.x} ${neckDepth.y}`;

  // Armhole: shoulderOut → pitch → underarm
  const armPitch = {
    x: shoulderOut.x + px(1.2),
    y: shoulderOut.y + (underarm.y - shoulderOut.y) * 0.45,
  };
  const armhole = `M ${shoulderOut.x} ${shoulderOut.y} Q ${armPitch.x} ${armPitch.y} ${underarm.x} ${underarm.y}`;

  // Side seam: underarm → waist → hem
  const sideMid = {
    x: (underarm.x + waistEnd.x) / 2 + px(0.4),
    y: (underarm.y + waistEnd.y) / 2,
  };
  const sideSeam = `M ${underarm.x} ${underarm.y} Q ${sideMid.x} ${sideMid.y} ${waistEnd.x} ${waistEnd.y} L ${hemEnd.x} ${hemEnd.y}`;

  return {
    scale: SCALE,
    origin: o,
    centerTop,
    centerBottom,
    neckOut,
    neckDepth,
    shoulderOut,
    underarm,
    bustEnd,
    waistEnd,
    hemEnd,
    apex,
    dartTip,
    dartLeft,
    dartRight,
    measurements: m,
    paths: { neck, armhole, sideSeam },
  };
}

export function stepLineVisibility(
  stepIndex: number,
): Record<ConstructionStepId, boolean> {
  const ids: ConstructionStepId[] = [
    "center-line",
    "bust-line",
    "waist-line",
    "neck",
    "shoulder",
    "armhole",
    "side-seam",
    "darts",
    "hem",
  ];
  const visible = {} as Record<ConstructionStepId, boolean>;
  ids.forEach((id, index) => {
    visible[id] = stepIndex >= 0 && index <= stepIndex;
  });
  return visible;
}

export const DRAFT_VIEWBOX = { width: 280, height: 320 };
