import { create } from "zustand";
import { db } from "@/lib/db";
import { quietDbWrite } from "@/lib/db/safe";
import {
  MEASUREMENT_MAP,
  type MeasurementId,
} from "@/features/measurements/data/measurements";
import { useMasteryStore } from "@/stores/mastery-store";
import type { UnitSystem } from "@/stores/unit-store";

/** @deprecated Import `UnitSystem` from `@/stores/unit-store`. */
export type MeasurementUnit = UnitSystem;

/** Relative body morph multipliers (1 = dress-form baseline). */
export type BodyMorph = {
  bust: number;
  waist: number;
  hips: number;
};

export const DEFAULT_BODY_MORPH: BodyMorph = {
  bust: 1,
  waist: 1,
  hips: 1,
};

export const BODY_MORPH_MIN = 0.75;
export const BODY_MORPH_MAX = 1.35;

type MeasurementState = {
  hydrated: boolean;
  selectedId: MeasurementId | null;
  hoveredId: MeasurementId | null;
  learnedIds: MeasurementId[];
  bodyMorph: BodyMorph;
  /** When true, active Studio fabric photo is projected onto the dress form. */
  fabricDrapeEnabled: boolean;
  /** Override which Studio photo to drape; null = active Studio photo. */
  fabricPhotoId: string | null;
  hydrate: () => Promise<void>;
  select: (id: MeasurementId | null) => void;
  setHovered: (id: MeasurementId | null) => void;
  toggleLearned: (id: MeasurementId) => void;
  setBodyMorph: (key: keyof BodyMorph, value: number) => void;
  resetBodyMorph: () => void;
  setFabricDrapeEnabled: (enabled: boolean) => void;
  setFabricPhotoId: (id: string | null) => void;
};

function clampMorph(value: number): number {
  return Math.min(BODY_MORPH_MAX, Math.max(BODY_MORPH_MIN, value));
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  hydrated: false,
  selectedId: null,
  hoveredId: null,
  learnedIds: [],
  bodyMorph: { ...DEFAULT_BODY_MORPH },
  fabricDrapeEnabled: false,
  fabricPhotoId: null,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const learned = await db.learning.toArray();
      set({
        hydrated: true,
        learnedIds: learned.map((record) => record.id as MeasurementId),
      });
    } catch {
      set({ hydrated: true });
    }
  },

  select: (id) =>
    set((state) => (state.selectedId === id ? state : { selectedId: id })),

  setHovered: (id) =>
    set((state) => (state.hoveredId === id ? state : { hoveredId: id })),

  toggleLearned: (id) => {
    const { learnedIds } = get();
    if (learnedIds.includes(id)) {
      set({ learnedIds: learnedIds.filter((entry) => entry !== id) });
      quietDbWrite(() => db.learning.delete(id));
      void useMasteryStore.getState().refresh();
    } else {
      set({ learnedIds: [...learnedIds, id] });
      quietDbWrite(() => db.learning.put({ id, learnedAt: new Date() }));
      const label = MEASUREMENT_MAP[id]?.label ?? id;
      void useMasteryStore.getState().awardModuleComplete({
        title: `${label} mastered`,
        detail: "Measurement masterclass complete — +50 Tailor Points earned.",
        refId: id,
        xp: 50,
      });
    }
  },

  setBodyMorph: (key, value) =>
    set((state) => {
      const next = clampMorph(value);
      if (state.bodyMorph[key] === next) return state;
      return { bodyMorph: { ...state.bodyMorph, [key]: next } };
    }),

  resetBodyMorph: () => set({ bodyMorph: { ...DEFAULT_BODY_MORPH } }),

  setFabricDrapeEnabled: (enabled) => set({ fabricDrapeEnabled: enabled }),

  setFabricPhotoId: (id) => set({ fabricPhotoId: id }),
}));
