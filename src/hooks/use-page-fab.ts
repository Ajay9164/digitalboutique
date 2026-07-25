"use client";

import { useEffect, useRef } from "react";
import { useFabStore } from "@/stores/fab-store";

/**
 * Enables the floating action button for a route while mounted.
 * onPress is stored in a ref so identity changes do not re-fire the effect
 * (prevents React #185 update-depth loops with Zustand action + showFab).
 */
export function usePageFab(
  options: {
    label?: string;
    ariaLabel?: string;
    onPress?: () => void;
  } = {},
) {
  const showFab = useFabStore((state) => state.showFab);
  const hideFab = useFabStore((state) => state.hideFab);

  const onPressRef = useRef(options.onPress);

  useEffect(() => {
    onPressRef.current = options.onPress;
  }, [options.onPress]);

  const label = options.label ?? "Create";
  const ariaLabel = options.ariaLabel ?? label;

  useEffect(() => {
    showFab({
      label,
      ariaLabel,
      onPress: () => {
        onPressRef.current?.();
      },
    });

    return () => hideFab();
  }, [ariaLabel, hideFab, label, showFab]);
}
