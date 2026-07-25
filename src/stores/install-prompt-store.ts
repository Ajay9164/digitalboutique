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
  /** True once the custom Install CTA is mounted and allowed to capture. */
  captureEnabled: boolean;
  setDeferred: (event: BeforeInstallPromptEvent | null) => void;
  setCaptureEnabled: (enabled: boolean) => void;
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
 * 2. Custom banner shows Install CTA (only after captureEnabled)
 * 3. User click → deferred.prompt() only — never on load
 */
let listening = false;
let pendingEvent: BeforeInstallPromptEvent | null = null;

function attachInstallListener() {
  if (typeof window === "undefined" || listening) return;
  listening = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    // Required to take ownership of the install UX (suppresses Chrome mini-infobar).
    event.preventDefault();
    const bip = event as BeforeInstallPromptEvent;
    const { captureEnabled, setDeferred } = useInstallPromptStore.getState();
    if (captureEnabled) {
      setDeferred(bip);
      pendingEvent = null;
    } else {
      // Banner not mounted yet — hold until enableCapture() runs.
      pendingEvent = bip;
    }
  });

  window.addEventListener("appinstalled", () => {
    pendingEvent = null;
    useInstallPromptStore.getState().setDeferred(null);
  });
}

export const useInstallPromptStore = create<InstallState>((set, get) => ({
  deferred: null,
  dismissed: false,
  outcome: null,
  captureEnabled: false,

  setDeferred: (event) =>
    set((state) => {
      if (state.deferred === event) return state;
      return {
        deferred: event,
        dismissed: event ? false : state.dismissed,
      };
    }),

  setCaptureEnabled: (enabled) => {
    set({ captureEnabled: enabled });
    if (enabled && pendingEvent) {
      const event = pendingEvent;
      pendingEvent = null;
      get().setDeferred(event);
    }
  },

  dismiss: () => {
    pendingEvent = null;
    set({ dismissed: true, deferred: null });
  },

  promptInstall: async () => {
    const event = get().deferred;
    if (!event?.prompt) return null;
    try {
      // Only reachable from the Install button's onClick user gesture.
      await event.prompt();
      const choice = await event.userChoice;
      set({
        deferred: null,
        outcome: choice.outcome,
        dismissed: choice.outcome === "dismissed",
      });
      return choice.outcome;
    } catch {
      set({ deferred: null });
      return null;
    }
  },
}));

/** Attach the window listener once (idempotent). Does not enable capture. */
export function initInstallPromptListener(): void {
  attachInstallListener();
}

/**
 * Call from the custom install banner after mount so preventDefault + UI
 * are paired — Chrome then has a visible Install CTA instead of a dead capture.
 */
export function enableInstallPromptCapture(): void {
  attachInstallListener();
  useInstallPromptStore.getState().setCaptureEnabled(true);
}
