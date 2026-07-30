"use client";

import { useIsMounted } from "@/hooks/use-mounted";
import { useShallow } from "zustand/react/shallow";
import { useUnitStore, type UnitSystem } from "@/stores/unit-store";

/**
 * Global atelier unit from `useUnitStore`, gated until client mount +
 * persist rehydration. Uses `useShallow` so unrelated store writes
 * (if the store grows) do not thrash consumers.
 */
export function useUnit(): {
  unit: UnitSystem;
  ready: boolean;
  setUnit: (unit: UnitSystem) => void;
  toggleUnit: () => void;
  label: UnitSystem;
} {
  const mounted = useIsMounted();
  const { hydrated, unit, setUnit, toggleUnit } = useUnitStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      unit: s.unit,
      setUnit: s.setUnit,
      toggleUnit: s.toggleUnit,
    })),
  );
  const ready = mounted && hydrated;
  const resolved = ready ? unit : "in";

  return {
    unit: resolved,
    ready,
    setUnit,
    toggleUnit,
    label: resolved,
  };
}

/** @deprecated Prefer `useUnit`. */
export const useSettingsUnit = useUnit;
