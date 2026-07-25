/**
 * Stable empty fallbacks for Zustand selectors.
 * React 19 useSyncExternalStore requires getSnapshot() === getSnapshot()
 * when the store has not changed — `?? []` creates a new array every call
 * and triggers Maximum update depth exceeded (#185).
 */
export const EMPTY_ARRAY: never[] = [];
