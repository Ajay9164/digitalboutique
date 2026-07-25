import { create } from "zustand";
import { db } from "@/lib/db";
import {
  MEASUREMENT_MAP,
  type MeasurementId,
} from "@/features/measurements/data/measurements";
import { recordActivity } from "@/features/learning/lib/ecosystem";

export type MeasurementUnit = "in" | "cm";

const UNIT_META_ID = "measurement-unit";

type MeasurementState = {
  hydrated: boolean;
  selectedId: MeasurementId | null;
  hoveredId: MeasurementId | null;
  unit: MeasurementUnit;
  learnedIds: MeasurementId[];
  hydrate: () => Promise<void>;
  select: (id: MeasurementId | null) => void;
  setHovered: (id: MeasurementId | null) => void;
  setUnit: (unit: MeasurementUnit) => void;
  toggleLearned: (id: MeasurementId) => void;
};

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  hydrated: false,
  selectedId: null,
  hoveredId: null,
  unit: "in",
  learnedIds: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const [unitRecord, learned] = await Promise.all([
      db.meta.get(UNIT_META_ID),
      db.learning.toArray(),
    ]);
    set({
      hydrated: true,
      unit: unitRecord?.value === "cm" ? "cm" : "in",
      learnedIds: learned.map((record) => record.id as MeasurementId),
    });
  },

  select: (id) => set({ selectedId: id }),

  setHovered: (id) => set({ hoveredId: id }),

  setUnit: (unit) => {
    set({ unit });
    void db.meta.put({
      id: UNIT_META_ID,
      key: UNIT_META_ID,
      value: unit,
      updatedAt: new Date(),
    });
  },

  toggleLearned: (id) => {
    const { learnedIds } = get();
    if (learnedIds.includes(id)) {
      set({ learnedIds: learnedIds.filter((entry) => entry !== id) });
      void db.learning.delete(id);
    } else {
      set({ learnedIds: [...learnedIds, id] });
      void db.learning.put({ id, learnedAt: new Date() });
      const label = MEASUREMENT_MAP[id]?.label ?? id;
      void recordActivity({
        type: "measurement_learned",
        title: `Learned ${label}`,
        detail: "Measurement lesson marked complete.",
        refId: id,
        xp: 15,
      });
    }
  },
}));
