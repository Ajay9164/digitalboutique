import { z } from "zod";

const length = (min: number, max: number, label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .min(min, `${label} is too small`)
    .max(max, `${label} is too large`);

/**
 * Body + drafting inputs for the intelligent drafting engine.
 * All values stored in centimetres (converted from display unit at the form edge).
 */
export const engineFormSchema = z.object({
  bust: length(70, 140, "Bust"),
  waist: length(50, 130, "Waist"),
  hip: length(70, 150, "Hip"),
  neck: length(28, 50, "Neck"),
  shoulder: length(9, 20, "Shoulder"),
  sleeveLength: length(10, 70, "Sleeve length"),
  blouseLength: length(28, 55, "Blouse length"),
  apexDistance: length(12, 30, "Apex distance"),
  apexDepth: length(16, 35, "Apex depth"),
  bustEase: length(0, 12, "Bust ease"),
  waistEase: length(0, 10, "Waist ease"),
  hipEase: length(0, 12, "Hip ease"),
  seamAllowance: length(0.5, 3, "Seam allowance"),
});

export type EngineFormValues = z.infer<typeof engineFormSchema>;

export const DEFAULT_ENGINE_VALUES: EngineFormValues = {
  bust: 88,
  waist: 72,
  hip: 96,
  neck: 36,
  shoulder: 13,
  sleeveLength: 22,
  blouseLength: 38,
  apexDistance: 18,
  apexDepth: 24,
  bustEase: 4,
  waistEase: 2,
  hipEase: 3,
  seamAllowance: 1,
};

export const ENGINE_FIELD_META: Array<{
  name: keyof EngineFormValues;
  label: string;
  group: "body" | "ease";
  hint: string;
}> = [
  { name: "bust", label: "Bust", group: "body", hint: "Fullest bust girth" },
  { name: "waist", label: "Waist", group: "body", hint: "Natural waist girth" },
  { name: "hip", label: "Hip", group: "body", hint: "Fullest hip / seat girth" },
  { name: "neck", label: "Neck", group: "body", hint: "Neck base girth" },
  { name: "shoulder", label: "Shoulder", group: "body", hint: "Neck base to shoulder bone" },
  { name: "sleeveLength", label: "Sleeve length", group: "body", hint: "Shoulder to sleeve end" },
  { name: "blouseLength", label: "Blouse length", group: "body", hint: "Shoulder to hem" },
  { name: "apexDistance", label: "Apex distance", group: "body", hint: "Apex to apex" },
  { name: "apexDepth", label: "Apex depth", group: "body", hint: "Neck base to apex" },
  { name: "bustEase", label: "Bust ease", group: "ease", hint: "Working ease on bust" },
  { name: "waistEase", label: "Waist ease", group: "ease", hint: "Working ease on waist" },
  { name: "hipEase", label: "Hip ease", group: "ease", hint: "Working ease on hip" },
  { name: "seamAllowance", label: "Seam allowance", group: "ease", hint: "Added when cutting" },
];
