"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

/**
 * Captures the browser install prompt (Chromium) so users can install Tailor as a PWA.
 * Hidden when already standalone or when the event never fires (Safari / iOS).
 */
export function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

    if (standalone) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
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
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
      >
        Install
      </Button>
      <button
        type="button"
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Dismiss install prompt"
        onClick={() => setDismissed(true)}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
