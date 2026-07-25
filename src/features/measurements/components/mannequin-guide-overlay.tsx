"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hand, X } from "lucide-react";
import { useMeasurementStore } from "@/stores/measurement-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tailor-mannequin-guide-v1";

function readDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * First-visit glassmorphic tip pointing at the mannequin.
 * Dismisses permanently (localStorage) or when the user selects a region.
 */
export function MannequinGuideOverlay() {
  const reduceMotion = useReducedMotion();
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const [dismissed, setDismissed] = useState(readDismissed);

  const visible = !dismissed && !selectedId;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore quota / private mode
    }
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center p-4 pt-6 sm:pt-8"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-label="Mannequin guidance"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-background/45 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.div
            className="glass-panel pointer-events-auto relative mt-2 max-w-sm rounded-2xl p-4 shadow-[0_24px_60px_-28px_rgba(15,23,28,0.55)]"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-2 top-2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Dismiss guidance"
            >
              <X className="size-4" aria-hidden />
            </button>
            <div className="flex gap-3 pr-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Hand className="size-4" aria-hidden />
              </span>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Step 1
                </p>
                <p className="text-sm font-semibold leading-snug tracking-tight">
                  Tap a body part on the mannequin to learn how to measure it.
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Glowing rings mark the spots — start with any one that looks
                  familiar.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-3 w-full rounded-xl"
              onClick={dismiss}
            >
              Got it — show me the glow
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
