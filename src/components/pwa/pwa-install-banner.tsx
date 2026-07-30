"use client";

import { useEffect } from "react";
import { Download, X } from "lucide-react";
import {
  enableInstallPromptCapture,
  useInstallPromptStore,
} from "@/stores/install-prompt-store";
import { Button } from "@/components/ui/button";

/**
 * Premium PWA install CTA — loaded with `dynamic(..., { ssr: false })`.
 * beforeinstallprompt is captured only after this banner mounts so Chrome
 * always has a visible custom Install button (no orphaned preventDefault).
 * prompt() runs only from the Install button click — never on load.
 */
export function PwaInstallBanner() {
  const deferred = useInstallPromptStore((s) => s.deferred);
  const dismissed = useInstallPromptStore((s) => s.dismissed);
  const dismiss = useInstallPromptStore((s) => s.dismiss);
  const promptInstall = useInstallPromptStore((s) => s.promptInstall);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

    if (standalone) {
      useInstallPromptStore.getState().setDeferred(null);
      return;
    }

    enableInstallPromptCapture();

    return () => {
      useInstallPromptStore.getState().setCaptureEnabled(false);
    };
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div
      className="glass-panel fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-lg items-center gap-3 rounded-2xl p-3 shadow-lg backdrop-blur-xl md:max-w-xl lg:max-w-2xl"
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
