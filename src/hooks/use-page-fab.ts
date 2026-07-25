"use client";

import { useEffect } from "react";
import { useFabStore } from "@/stores/fab-store";

/**
 * Enables the floating action button for a route while mounted.
 * Pass a no-op or future handler — no business logic yet.
 */
export function usePageFab(options: {
  label?: string;
  ariaLabel?: string;
  onPress?: () => void;
} = {}) {
  const showFab = useFabStore((state) => state.showFab);
  const hideFab = useFabStore((state) => state.hideFab);

  useEffect(() => {
    showFab({
      label: options.label ?? "Create",
      ariaLabel: options.ariaLabel,
      onPress: options.onPress ?? (() => undefined),
    });

    return () => hideFab();
  }, [
    hideFab,
    options.ariaLabel,
    options.label,
    options.onPress,
    showFab,
  ]);
}
