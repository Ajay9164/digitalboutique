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
  promptInstall: () => Promise<"accepted" | "dismissed" | null>;
};

/**
 * Module-level capture so beforeinstallprompt is never lost if it fires
 * before React mounts the banner.
 */
let listening = false;

function attachInstallListener(setDeferred: (e: BeforeInstallPromptEvent) => void) {
  if (typeof window === "undefined" || listening) return;
  listening = true;

  window.addEventListener("beforeinstallprompt", (event) => {
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

  setDeferred: (event) => set({ deferred: event, dismissed: false }),

  dismiss: () => set({ dismissed: true }),

  promptInstall: async () => {
    const event = get().deferred;
    if (!event) return null;
    await event.prompt();
    const choice = await event.userChoice;
    set({
      deferred: null,
      outcome: choice.outcome,
      dismissed: choice.outcome === "dismissed",
    });
    return choice.outcome;
  },
}));

export function initInstallPromptListener(): void {
  attachInstallListener((event) => {
    useInstallPromptStore.getState().setDeferred(event);
  });
}
