"use client";

import { useSyncExternalStore } from "react";

const mediaQueryLists = new Map<string, MediaQueryList>();

function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  let media = mediaQueryLists.get(query);
  if (!media) {
    media = window.matchMedia(query);
    mediaQueryLists.set(query, media);
  }
  return media;
}

function subscribe(query: string, onStoreChange: () => void) {
  const media = getMediaQueryList(query);
  if (!media) return () => {};
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

/**
 * SSR-safe media query. Server + hydration snapshot is always `false`
 * (via getServerSnapshot) so prefers-* never causes React #418.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getMediaQueryList(query)?.matches ?? false,
    () => false,
  );
}
