"use client";

import { usePWAUpdate } from "@/hooks/use-pwa-update";

/**
 * Mounts the OTA service-worker update listener once under AppProviders.
 * Renders nothing — toast UI is owned by the global Sonner Toaster.
 */
export function PwaUpdateListener() {
  usePWAUpdate();
  return null;
}
