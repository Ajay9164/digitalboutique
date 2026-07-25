"use client";

import { useEffect } from "react";
import { Download, X } from "lucide-react";
import {
  initInstallPromptListener,
  useInstallPromptStore,
} from "@/stores/install-prompt-store";
import { Button } from "@/components/ui/button";

/**
 * Premium PWA install CTA.
 * Listens via a root-level store so beforeinstallprompt is captured early.
 * Calling preventDefault() is paired with a visible Install button + prompt().
 */
export function PwaInstallBanner() {
  const deferred = useInstallPromptStore((s) => s.deferred);
  const dismissed = useInstallPromptStore((s) => s.dismissed);
  const dismiss = useInstallPromptStore((s) => s.dismiss);
  const promptInstall = useInstallPromptStore((s) => s.promptInstall);

  useEffect(() => {
    initInstallPromptListener();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone) {
      useInstallPromptStore.getState().setDeferred(null);
    }
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div
      className="glass-panel fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-lg items-center gap-3 rounded-2xl p-3 shadow-lg md:max-w-xl lg:max-w-2xl"
      role="dialog"
      aria-label="Install Tailor"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Download className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight">Install Tailor</p>
        <p className="text-[11px] text-muted-foreground">
          Add to your home screen for offline atelier access.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        className="rounded-xl"
        onClick={() => {
          void promptInstall();
        }}
      >
        Install
      </Button>
      <button
        type="button"
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Dismiss install prompt"
        onClick={() => dismiss()}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
