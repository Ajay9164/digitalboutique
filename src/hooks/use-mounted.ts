"use client";

import { useSyncExternalStore } from "react";

/**
 * True only after the component has mounted on the client.
 * Server + first client render return `false` (useSyncExternalStore snapshot).
 * Use to gate localStorage / theme / persist-backed UI and avoid hydration mismatch.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

/** @deprecated Prefer `useIsMounted`. */
export const useMounted = useIsMounted;
