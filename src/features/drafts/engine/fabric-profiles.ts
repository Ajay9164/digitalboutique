/**
 * Smart Fabric profiles — shrinkage + seam-allowance deltas for the drafting engine.
 * Adjustments run after base calculations and before the Konva blueprint is drawn.
 */

import { roundCm } from "@/features/drafts/data/formulas";
import type {
  EngineCalculations,
  CalculationResult,
} from "@/features/drafts/engine/calculations";

export type FabricId = "cotton" | "silk";

export type FabricProfile = {
  id: FabricId;
  label: string;
  /** Multiply linear draft dims (pre-shrink so finished garment matches body). */
  shrinkageFactor: number;
  /** Added to base seam allowance (cm). */
  seamAllowanceDelta: number;
  /** Extra bust ease for drapey fabrics (cm) — applied to bust quarter only. */
  bustEaseDelta: number;
  description: string;
};

export const FABRIC_PROFILES: Record<FabricId, FabricProfile> = {
  cotton: {
    id: "cotton",
    label: "Cotton",
    shrinkageFactor: 1.03,
    seamAllowanceDelta: 0.25,
    bustEaseDelta: 0,
    description:
      "+3% pre-shrink on block lengths & widths, +0.25 cm seam allowance for stable woven cotton.",
  },
  silk: {
    id: "silk",
    label: "Silk",
    shrinkageFactor: 1.01,
    seamAllowanceDelta: 0.5,
    bustEaseDelta: 1,
    description:
      "+1% dimensional ease, +0.5 cm seam allowance for slip, +1 cm bust ease for fluid drape.",
  },
};

export const FABRIC_OPTIONS: FabricId[] = ["cotton", "silk"];

function scale(value: number, factor: number): number {
  return roundCm(value * factor);
}

/**
 * Apply fabric shrinkage / seam rules to engine calculations for the Konva board.
 */
export function applyFabricAdjustments(
  base: EngineCalculations,
  fabricId: FabricId | null,
): EngineCalculations {
  if (!fabricId) return base;

  const profile = FABRIC_PROFILES[fabricId];
  const f = profile.shrinkageFactor;
  const draft = base.draft;

  const bustEaseBoost = profile.bustEaseDelta / 4;
  const bustQuarter = scale(draft.bustQuarter + bustEaseBoost, f);
  const waistQuarter = scale(draft.waistQuarter, f);
  const hipQuarter = scale(draft.hipQuarter, f);
  const seamAllowance = roundCm(
    draft.seamAllowance + profile.seamAllowanceDelta,
  );
  const dartIntake = roundCm(Math.max(0.5, bustQuarter - waistQuarter));

  const adjustedDraft: EngineCalculations["draft"] = {
    ...draft,
    bustQuarter,
    waistQuarter,
    hipQuarter,
    neckWidth: scale(draft.neckWidth, f),
    neckDepthFront: scale(draft.neckDepthFront, f),
    shoulderDrop: scale(draft.shoulderDrop, f),
    shoulderLength: scale(draft.shoulderLength, f),
    armholeDepth: scale(draft.armholeDepth, f),
    princess: scale(draft.princess, f),
    sleeveLength: scale(draft.sleeveLength, f),
    dartIntake,
    dartLength: scale(draft.dartLength, f),
    blouseLength: scale(draft.blouseLength, f),
    apexFromCenter: scale(draft.apexFromCenter, f),
    apexDepth: scale(draft.apexDepth, f),
    bustEase: roundCm(draft.bustEase + profile.bustEaseDelta),
    seamAllowance,
  };

  const fabricResult: CalculationResult = {
    id: "fabric",
    label: `Smart Fabric · ${profile.label}`,
    formula: `${Math.round((f - 1) * 100)}% shrink · SA +${profile.seamAllowanceDelta} cm`,
    value: seamAllowance,
    unit: "cm",
    explanation: profile.description,
    breakdown: [
      { label: "Shrinkage factor", value: `×${f}` },
      { label: "SA delta", value: `+${profile.seamAllowanceDelta} cm` },
      { label: "Bust ease delta", value: `+${profile.bustEaseDelta} cm` },
      { label: "Adjusted SA", value: `${seamAllowance} cm` },
      { label: "Adjusted bust¼", value: `${bustQuarter} cm` },
    ],
  };

  const results = [
    fabricResult,
    ...base.results.map((row) => {
      if (row.id === "seam-allowance") {
        return {
          ...row,
          value: seamAllowance,
          formula: `${row.formula} → ${profile.label}`,
          explanation: `${row.explanation} Smart Fabric (${profile.label}): ${profile.description}`,
          breakdown: [
            ...row.breakdown,
            { label: `${profile.label} SA`, value: `${seamAllowance} cm` },
          ],
        };
      }
      if (row.id === "bust-quarter") {
        return {
          ...row,
          value: bustQuarter,
          explanation: `${row.explanation} Adjusted for ${profile.label} (shrink ×${f}${
            profile.bustEaseDelta
              ? `, +${profile.bustEaseDelta} cm ease`
              : ""
          }).`,
          breakdown: [
            ...row.breakdown,
            { label: `${profile.label} bust¼`, value: `${bustQuarter} cm` },
          ],
        };
      }
      if (row.id === "waist-quarter") {
        return {
          ...row,
          value: waistQuarter,
          breakdown: [
            ...row.breakdown,
            { label: `${profile.label} waist¼`, value: `${waistQuarter} cm` },
          ],
        };
      }
      if (row.id === "armhole") {
        return {
          ...row,
          value: adjustedDraft.armholeDepth,
          breakdown: [
            ...row.breakdown,
            {
              label: `${profile.label} armhole`,
              value: `${adjustedDraft.armholeDepth} cm`,
            },
          ],
        };
      }
      if (row.id === "darts") {
        return {
          ...row,
          value: dartIntake,
          breakdown: [
            ...row.breakdown,
            { label: `${profile.label} intake`, value: `${dartIntake} cm` },
          ],
        };
      }
      if (row.id === "ease") {
        return {
          ...row,
          value: adjustedDraft.bustEase,
          breakdown: [
            ...row.breakdown,
            {
              label: `${profile.label} bust ease`,
              value: `${adjustedDraft.bustEase} cm`,
            },
          ],
        };
      }
      return row;
    }),
  ];

  const map = {
    ...base.map,
    fabric: seamAllowance,
    "bust-quarter": bustQuarter,
    "waist-quarter": waistQuarter,
    "hip-quarter": hipQuarter,
    armhole: adjustedDraft.armholeDepth,
    darts: dartIntake,
    "seam-allowance": seamAllowance,
    ease: adjustedDraft.bustEase,
  };

  return {
    results,
    map,
    draft: adjustedDraft,
  };
}
