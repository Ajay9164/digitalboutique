"use client";

import { useSyncExternalStore } from "react";

const mediaQueryLists = new Map<string, MediaQueryList>();

function getMediaQueryList(query: string): MediaQueryList {
  let media = mediaQueryLists.get(query);
  if (!media) {
    media = window.matchMedia(query);
    mediaQueryLists.set(query, media);
  }
  return media;
}

function subscribe(query: string, onStoreChange: () => void) {
  const media = getMediaQueryList(query);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getMediaQueryList(query).matches,
    () => false,
  );
}
