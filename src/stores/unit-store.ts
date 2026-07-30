import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { db } from "@/lib/db";
import { withDb } from "@/lib/db/safe";

export type UnitSystem = "in" | "cm";

/** @deprecated Prefer `UnitSystem`. */
export type MeasurementUnit = UnitSystem;

const LEGACY_UNIT_META_ID = "measurement-unit";
const UNIT_MIGRATION_KEY = "tailor-unit-migrated-v1";

type UnitState = {
  /** False until persist rehydrates from localStorage (offline-safe). */
  hydrated: boolean;
  unit: UnitSystem;
  setUnit: (unit: UnitSystem) => void;
  toggleUnit: () => void;
};

async function migrateUnitFromDexieOnce(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(UNIT_MIGRATION_KEY) === "1") return;
  } catch {
    return;
  }

  // Prefer already-persisted tailor-settings / tailor-unit before Dexie.
  try {
    const raw =
      window.localStorage.getItem("tailor-unit") ??
      window.localStorage.getItem("tailor-settings");
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { unit?: string } };
      if (parsed.state?.unit === "cm" || parsed.state?.unit === "in") {
        useUnitStore.setState({ unit: parsed.state.unit });
        window.localStorage.setItem(UNIT_MIGRATION_KEY, "1");
        return;
      }
    }
  } catch {
    // continue to Dexie
  }

  const { data: legacy } = await withDb(async () => {
    return db.meta.get(LEGACY_UNIT_META_ID);
  }, null);

  if (legacy?.value === "cm") {
    useUnitStore.setState({ unit: "cm" });
  }

  try {
    window.localStorage.setItem(UNIT_MIGRATION_KEY, "1");
  } catch {
    // private mode
  }
}

/**
 * Global atelier unit engine — persists to localStorage so Inches / CM
 * stay consistent online and offline across every dashboard surface.
 */
export const useUnitStore = create<UnitState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      unit: "in",
      setUnit: (unit) => set({ unit }),
      toggleUnit: () =>
        set({ unit: get().unit === "in" ? "cm" : "in" }),
    }),
    {
      name: "tailor-unit",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ unit: state.unit }),
      onRehydrateStorage: () => () => {
        useUnitStore.setState({ hydrated: true });
        void migrateUnitFromDexieOnce();
      },
    },
  ),
);

/** @deprecated Prefer `useUnitStore`. */
export const useSettingsStore = useUnitStore;
