"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Fingerprint, Lock, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJournalLockStore } from "@/stores/journal-lock-store";
import { cn } from "@/lib/utils";

type BiometricLockProps = {
  /** Journal content — only mounted after unlock when lock is enabled. */
  children: ReactNode;
  className?: string;
};

/**
 * Gates the Creation Journal behind WebAuthn platform biometrics
 * (Face ID / fingerprint / Windows Hello). Session unlock lasts for the tab.
 */
export function BiometricLock({ children, className }: BiometricLockProps) {
  const reduceMotion = useReducedMotion();
  const hydrate = useJournalLockStore((s) => s.hydrate);
  const ready = useJournalLockStore((s) => s.ready);
  const supported = useJournalLockStore((s) => s.supported);
  const platformAvailable = useJournalLockStore((s) => s.platformAvailable);
  const enabled = useJournalLockStore((s) => s.enabled);
  const unlocked = useJournalLockStore((s) => s.unlocked);
  const busy = useJournalLockStore((s) => s.busy);
  const error = useJournalLockStore((s) => s.error);
  const unlock = useJournalLockStore((s) => s.unlock);
  const enable = useJournalLockStore((s) => s.enable);
  const disable = useJournalLockStore((s) => s.disable);
  const lockSession = useJournalLockStore((s) => s.lockSession);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const locked = enabled && !unlocked;
  const canUseBiometrics = supported && platformAvailable;

  if (!ready) {
    return (
      <div
        className={cn(
          "glass-panel flex min-h-[50vh] items-center justify-center rounded-3xl p-8",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-muted-foreground">Checking journal lock…</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <AnimatePresence mode="wait">
        {locked ? (
          <motion.section
            key="lock-gate"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative overflow-hidden rounded-[1.75rem] px-6 py-12 text-center sm:px-10"
            aria-labelledby="journal-lock-title"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_55%)]"
              aria-hidden
            />
            <div className="relative mx-auto flex max-w-md flex-col items-center gap-5">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Fingerprint className="size-8" aria-hidden />
              </span>
              <div className="space-y-2">
                <h2
                  id="journal-lock-title"
                  className="font-display text-2xl font-semibold tracking-tight"
                >
                  Creation Journal locked
                </h2>
                <p className="text-sm text-muted-foreground">
                  Unlock with Face ID, fingerprint, or your device PIN to open
                  your private project archive on this device.
                </p>
              </div>
              {error ? (
                <p
                  role="alert"
                  className="w-full rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}
              <Button
                type="button"
                size="lg"
                className="rounded-xl"
                disabled={busy}
                onClick={() => void unlock()}
              >
                <Lock className="size-4" aria-hidden />
                {busy ? "Waiting for biometrics…" : "Unlock with biometrics"}
              </Button>
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="journal-open"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="glass-panel flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                    enabled
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {enabled ? (
                    <ShieldCheck className="size-4" aria-hidden />
                  ) : (
                    <ShieldOff className="size-4" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {enabled ? "Biometric lock on" : "Biometric lock off"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {!canUseBiometrics
                      ? "This browser or device does not expose a platform authenticator (Face ID / fingerprint)."
                      : enabled
                        ? "Journal opens only after Face ID or fingerprint this session."
                        : "Protect your Creation Journal with device biometrics."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {enabled ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={busy}
                      onClick={lockSession}
                    >
                      <Lock className="size-3.5" aria-hidden />
                      Lock now
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-xl"
                      disabled={busy || !canUseBiometrics}
                      onClick={() => void disable()}
                    >
                      Turn off
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl"
                    disabled={busy || !canUseBiometrics}
                    onClick={() => void enable()}
                  >
                    <Fingerprint className="size-3.5" aria-hidden />
                    {busy ? "Registering…" : "Enable Face ID / fingerprint"}
                  </Button>
                )}
              </div>
            </div>
            {error ? (
              <p
                role="alert"
                className="rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
