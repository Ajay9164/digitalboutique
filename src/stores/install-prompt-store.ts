"use client";

import { create } from "zustand";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallState = {
  deferred: BeforeInstallPromptEvent | null;
  dismissed: boolean;
  outcome: "accepted" | "dismissed" | null;
  setDeferred: (event: BeforeInstallPromptEvent | null) => void;
  dismiss: () => void;
  /** Must only run from a user gesture (Install button click). */
  promptInstall: () => Promise<"accepted" | "dismissed" | null>;
};

/**
 * Module-level capture so beforeinstallprompt is never lost if it fires
 * before React mounts the banner.
 *
 * Flow (Chrome / Edge):
 * 1. beforeinstallprompt → preventDefault() + store event (no auto prompt)
 * 2. Custom banner shows Install CTA
 * 3. User click → deferred.prompt() only
 */
let listening = false;

function attachInstallListener(
  setDeferred: (e: BeforeInstallPromptEvent) => void,
) {
  if (typeof window === "undefined" || listening) return;
  listening = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    // Required so the browser does not show its mini-infobar; we own the UI.
    event.preventDefault();
    setDeferred(event as BeforeInstallPromptEvent);
  });

  window.addEventListener("appinstalled", () => {
    useInstallPromptStore.getState().setDeferred(null);
  });
}

export const useInstallPromptStore = create<InstallState>((set, get) => ({
  deferred: null,
  dismissed: false,
  outcome: null,

  setDeferred: (event) =>
    set((state) => {
      if (state.deferred === event) return state;
      return {
        deferred: event,
        dismissed: event ? false : state.dismissed,
      };
    }),

  dismiss: () => set({ dismissed: true }),

  promptInstall: async () => {
    const event = get().deferred;
    if (!event?.prompt) return null;
    try {
      await event.prompt();
      const choice = await event.userChoice;
      set({
        deferred: null,
        outcome: choice.outcome,
        dismissed: choice.outcome === "dismissed",
      });
      return choice.outcome;
    } catch {
      // User dismissed OS sheet or prompt unavailable — clear stale event.
      set({ deferred: null });
      return null;
    }
  },
}));

export function initInstallPromptListener(): void {
  attachInstallListener((event) => {
    useInstallPromptStore.getState().setDeferred(event);
  });
}
