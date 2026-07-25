export type OverlayTransform = {
  /** Translation from workspace center, in CSS pixels. */
  x: number;
  y: number;
  /** Uniform scale of the pattern SVG. */
  scale: number;
  /** Degrees. */
  rotation: number;
  /** 0–1 */
  opacity: number;
};

export type CropRect = {
  /** Normalized 0–1 relative to the fabric frame. */
  x: number;
  y: number;
  width: number;
  height: number;
};

export type StudioTool =
  | "move"
  | "scale"
  | "rotate"
  | "crop";

export const DEFAULT_OVERLAY: OverlayTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 0.92,
};

export const DEFAULT_CROP: CropRect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

/** Snap threshold in CSS pixels. */
export const SNAP_THRESHOLD = 8;

export function snapValue(value: number, targets: number[], threshold = SNAP_THRESHOLD): number {
  for (const target of targets) {
    if (Math.abs(value - target) <= threshold) return target;
  }
  return value;
}

export function snapPoint(
  x: number,
  y: number,
  width: number,
  height: number,
  enabled: boolean,
): { x: number; y: number; snappedX: boolean; snappedY: boolean } {
  if (!enabled) return { x, y, snappedX: false, snappedY: false };

  const xTargets = [0, -width / 4, width / 4, -width / 2, width / 2];
  const yTargets = [0, -height / 4, height / 4, -height / 2, height / 2];

  const nextX = snapValue(x, xTargets);
  const nextY = snapValue(y, yTargets);

  return {
    x: nextX,
    y: nextY,
    snappedX: nextX !== x,
    snappedY: nextY !== y,
  };
}
