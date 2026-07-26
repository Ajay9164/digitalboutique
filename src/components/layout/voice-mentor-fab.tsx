"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  disposeVoiceMentorRuntime,
  useVoiceMentorStore,
} from "@/stores/voice-mentor-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Global glowing microphone FAB for the voice-activated drafting mentor.
 * Sits opposite the page Plus FAB so both can coexist above the bottom nav.
 */
export function VoiceMentorFab() {
  const reduceMotion = useReducedMotion();
  const hydrate = useVoiceMentorStore((s) => s.hydrate);
  const supported = useVoiceMentorStore((s) => s.supported);
  const listening = useVoiceMentorStore((s) => s.listening);
  const processing = useVoiceMentorStore((s) => s.processing);
  const panelOpen = useVoiceMentorStore((s) => s.panelOpen);
  const transcript = useVoiceMentorStore((s) => s.transcript);
  const answer = useVoiceMentorStore((s) => s.answer);
  const error = useVoiceMentorStore((s) => s.error);
  const toggleListening = useVoiceMentorStore((s) => s.toggleListening);
  const dismissPanel = useVoiceMentorStore((s) => s.dismissPanel);

  useEffect(() => {
    hydrate();
    return () => {
      disposeVoiceMentorRuntime();
    };
  }, [hydrate]);

  return (
    <>
      <div className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-40 sm:left-[max(1rem,calc(50%-14rem))]">
        <div className="relative">
          {!reduceMotion && listening ? (
            <span
              className="absolute inset-0 animate-ping rounded-full bg-neon-voice/40"
              aria-hidden
            />
          ) : null}
          {!reduceMotion ? (
            <span
              className={cn(
                "pointer-events-none absolute -inset-1.5 rounded-full blur-md transition-opacity",
                listening || processing
                  ? "bg-[radial-gradient(circle,color-mix(in_oklch,var(--neon-voice)_65%,transparent),transparent_70%)] opacity-100"
                  : "bg-[radial-gradient(circle,color-mix(in_oklch,var(--champagne)_45%,transparent),transparent_70%)] opacity-55",
              )}
              aria-hidden
            />
          ) : null}
          <button
            type="button"
            onClick={() => toggleListening()}
            aria-label={
              listening
                ? "Stop listening"
                : "Ask the drafting mentor with your voice"
            }
            aria-pressed={listening}
            className={cn(
              "pointer-events-auto relative flex size-14 items-center justify-center rounded-full",
              "transition hover:brightness-110 active:scale-[0.96]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              listening
                ? "neon-voice bg-[color-mix(in_oklch,var(--neon-voice)_22%,black)] text-neon-voice ring-1 ring-neon-voice/50"
                : "bg-primary text-primary-foreground shadow-[0_14px_36px_-10px_color-mix(in_oklch,var(--champagne)_45%,transparent)] ring-1 ring-champagne/30",
            )}
          >
            {listening ? (
              <MicOff className="size-6" aria-hidden />
            ) : (
              <Mic className="size-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {panelOpen ? (
          <motion.aside
            role="status"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 max-w-md rounded-3xl p-4 shadow-[0_24px_60px_-28px_rgba(15,23,28,0.55)] sm:left-[max(1rem,calc(50%-14rem))] sm:right-auto sm:w-[22rem]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Voice mentor
                </p>
                <p className="font-display text-base font-semibold tracking-tight">
                  {listening
                    ? "Listening…"
                    : processing
                      ? "Calculating…"
                      : answer?.title ?? (supported ? "Ask a formula" : "Unavailable")}
                </p>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="rounded-xl"
                aria-label="Dismiss mentor panel"
                onClick={dismissPanel}
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            {transcript ? (
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">You: </span>
                “{transcript}”
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Try: “What is the armhole calculation for a 36 bust?”
              </p>
            )}

            {error ? (
              <p className="mt-3 rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {answer && !listening ? (
              <div className="mt-3 space-y-2 rounded-2xl bg-primary/8 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {answer.formula}
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {answer.display}
                </p>
                <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Volume2 className="size-3.5" aria-hidden />
                  Reading aloud with device speech
                </p>
              </div>
            ) : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
