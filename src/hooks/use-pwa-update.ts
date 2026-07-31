"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const TOAST_ID = "atelier-ota-update";

const GLOW_TOAST_CLASS =
  "!border-champagne/50 !shadow-[0_0_36px_-6px_color-mix(in_oklch,var(--champagne)_60%,transparent),0_0_64px_-20px_color-mix(in_oklch,var(--champagne)_35%,transparent),0_24px_60px_-28px_rgba(0,0,0,0.85)]";

function activateWaitingWorker(worker: ServiceWorker) {
  worker.postMessage({ type: "SKIP_WAITING" });
  window.location.reload();
}

function promptAtelierUpdate(worker: ServiceWorker) {
  toast("A new version of the Atelier is available.", {
    id: TOAST_ID,
    duration: Infinity,
    description: "Refresh to apply the latest craft updates from the studio.",
    className: GLOW_TOAST_CLASS,
    action: {
      label: "Update Now",
      onClick: () => activateWaitingWorker(worker),
    },
  });
}

/**
 * Over-the-air update engine for Serwist / production service workers.
 * When a new build installs and waits, shows a persistent glowing toast
 * so the user can SKIP_WAITING + reload on demand.
 */
export function usePWAUpdate() {
  const promptedForRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // `@serwist/next` disables registration in development.
    if (process.env.NODE_ENV !== "production") return;

    let cancelled = false;
    let registration: ServiceWorkerRegistration | null = null;

    const promptIfWaiting = (worker: ServiceWorker | null | undefined) => {
      if (cancelled || !worker) return;
      // First install has no controller — don't treat it as an "update".
      if (!navigator.serviceWorker.controller) return;
      if (worker.state !== "installed") return;
      if (promptedForRef.current === worker) return;
      promptedForRef.current = worker;
      promptAtelierUpdate(worker);
    };

    const watchInstalling = (worker: ServiceWorker | null) => {
      if (!worker) return;
      const onStateChange = () => {
        if (worker.state === "installed") {
          promptIfWaiting(worker);
        }
      };
      worker.addEventListener("statechange", onStateChange);
      onStateChange();
    };

    const onUpdateFound = () => {
      watchInstalling(registration?.installing ?? null);
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void registration?.update().catch(() => {
        // Offline / no network — ignore; next visit will retry.
      });
    };

    void navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (cancelled || !reg) return;
        registration = reg;

        // Already waiting from a previous visit.
        promptIfWaiting(reg.waiting);

        if (reg.installing) {
          watchInstalling(reg.installing);
        }

        reg.addEventListener("updatefound", onUpdateFound);
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", onVisible);
      })
      .catch(() => {
        // Registration unavailable — nothing to prompt.
      });

    return () => {
      cancelled = true;
      registration?.removeEventListener("updatefound", onUpdateFound);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);
}
