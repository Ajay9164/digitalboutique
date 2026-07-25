"use client";

import { useEffect } from "react";
import { useFabStore } from "@/stores/fab-store";

/**
 * Enables the floating action button for a route while mounted.
 * Visibility/labels and the press handler are written separately so a new
 * function identity cannot force a Zustand update on every effect run.
 */
export function usePageFab(
  options: {
    label?: string;
    ariaLabel?: string;
    onPress?: (() => void) | null;
  } = {},
) {
  const showFab = useFabStore((state) => state.showFab);
  const hideFab = useFabStore((state) => state.hideFab);
  const setFabHandler = useFabStore((state) => state.setFabHandler);

  const label = options.label ?? "Create";
  const ariaLabel = options.ariaLabel ?? label;
  const onPress = options.onPress ?? null;

  useEffect(() => {
    showFab({ label, ariaLabel });
    return () => hideFab();
  }, [ariaLabel, hideFab, label, showFab]);

  useEffect(() => {
    setFabHandler(onPress);
    return () => setFabHandler(null);
  }, [onPress, setFabHandler]);
}
