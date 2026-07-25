import type { MeasurementId } from "@/features/measurements/data/measurements";

/**
 * 3D anchors for every interactive body region.
 *
 * This config is the single contract between the mannequin geometry and the
 * interaction layer. To swap the primitive mannequin for a GLTF model later,
 * keep these anchors (or re-map coordinates) and replace only `MannequinBody`
 * in `interactive-mannequin.tsx` — selection, hover, highlight, and animation
 * logic never touch the underlying geometry.
 */

export type Vec3 = [number, number, number];

export type RegionAnchor =
  | {
      type: "ring";
      /** "body" = world-space around the torso; "arm" = local space inside the left arm group. */
      attach: "body" | "arm";
      center: Vec3;
      radius: number;
    }
  | {
      type: "line";
      attach: "body" | "arm";
      from: Vec3;
      to: Vec3;
      /** Optional control point — renders as a quadratic curve hugging the body. */
      via?: Vec3;
    }
  | {
      type: "point";
      attach: "body";
      at: Vec3;
      radius?: number;
    };

/** Left arm group transform (shoulder pivot). Mirrored for the right arm. */
export const ARM_PIVOT: Vec3 = [0.19, 1.49, 0];
export const ARM_TILT = -0.12; // radians, hangs slightly outward

export const REGION_ANCHORS: Record<MeasurementId, RegionAnchor> = {
  // Core girths — horizontal rings around the torso
  neck: { type: "ring", attach: "body", center: [0, 1.585, 0], radius: 0.068 },
  "upper-bust": { type: "ring", attach: "body", center: [0, 1.42, 0], radius: 0.158 },
  bust: { type: "ring", attach: "body", center: [0, 1.32, 0], radius: 0.188 },
  waist: { type: "ring", attach: "body", center: [0, 1.06, 0], radius: 0.128 },
  hip: { type: "ring", attach: "body", center: [0, 0.88, 0], radius: 0.188 },

  // Shoulders & back — lines hugging the upper torso
  shoulder: {
    type: "line",
    attach: "body",
    from: [0.055, 1.575, 0],
    to: [0.19, 1.49, 0],
  },
  "front-shoulder": {
    type: "line",
    attach: "body",
    from: [-0.15, 1.47, 0.075],
    via: [0, 1.48, 0.125],
    to: [0.15, 1.47, 0.075],
  },
  "back-shoulder": {
    type: "line",
    attach: "body",
    from: [-0.155, 1.48, -0.07],
    via: [0, 1.49, -0.115],
    to: [0.155, 1.48, -0.07],
  },
  "cross-front": {
    type: "line",
    attach: "body",
    from: [-0.135, 1.42, 0.09],
    via: [0, 1.43, 0.15],
    to: [0.135, 1.42, 0.09],
  },
  "cross-back": {
    type: "line",
    attach: "body",
    from: [-0.14, 1.44, -0.08],
    via: [0, 1.45, -0.135],
    to: [0.14, 1.44, -0.08],
  },

  // Arms — rings and a length line in arm-local space
  armhole: { type: "ring", attach: "arm", center: [0, -0.01, 0], radius: 0.078 },
  "arm-round": { type: "ring", attach: "arm", center: [0, -0.16, 0], radius: 0.064 },
  elbow: { type: "ring", attach: "arm", center: [0, -0.3, 0], radius: 0.058 },
  wrist: { type: "ring", attach: "arm", center: [0, -0.5, 0], radius: 0.048 },
  "sleeve-length": {
    type: "line",
    attach: "arm",
    from: [0.062, -0.01, 0],
    to: [0.05, -0.5, 0],
  },

  // Neck depths
  "front-neck": {
    type: "line",
    attach: "body",
    from: [-0.05, 1.57, 0.05],
    via: [0, 1.485, 0.105],
    to: [0.05, 1.57, 0.05],
  },
  "back-neck": {
    type: "line",
    attach: "body",
    from: [-0.05, 1.57, -0.05],
    via: [0, 1.505, -0.1],
    to: [0.05, 1.57, -0.05],
  },

  // Blouse drafting
  "princess-length": {
    type: "line",
    attach: "body",
    from: [0.085, 1.53, 0.035],
    via: [0.105, 1.32, 0.2],
    to: [0.095, 1.06, 0.105],
  },
  "katori-height": {
    type: "line",
    attach: "body",
    from: [0.095, 1.32, 0.175],
    to: [0.09, 1.21, 0.13],
  },
  "apex-distance": {
    type: "line",
    attach: "body",
    from: [-0.095, 1.32, 0.165],
    via: [0, 1.32, 0.195],
    to: [0.095, 1.32, 0.165],
  },
  "blouse-length": {
    type: "line",
    attach: "body",
    from: [0.05, 1.56, 0.03],
    via: [0.075, 1.3, 0.195],
    to: [0.07, 1.02, 0.115],
  },
  apex: { type: "point", attach: "body", at: [0.095, 1.32, 0.168], radius: 0.02 },
  "dart-point": {
    type: "point",
    attach: "body",
    at: [0.072, 1.275, 0.155],
    radius: 0.016,
  },
};
