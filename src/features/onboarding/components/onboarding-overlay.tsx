"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationManager } from "@/lib/notifications/notification-manager";
import { useUserStore } from "@/stores/user-store";
import { useShallow } from "zustand/react/shallow";

/**
 * First-time gateway — full-viewport navy glass overlay asking for a name
 * before the offline atelier personalizes. Persisted via useUserStore.
 */
export function OnboardingOverlay() {
  const reduceMotion = useReducedMotion();
  const inputId = useId();
  const { hydrated, hasCompletedOnboarding, completeOnboarding } = useUserStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      hasCompletedOnboarding: s.hasCompletedOnboarding,
      completeOnboarding: s.completeOnboarding,
    })),
  );
  const [name, setName] = useState("");

  const open = hydrated && !hasCompletedOnboarding;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const canSubmit = name.trim().length > 0;

  const handleEnter = () => {
    if (!canSubmit) return;
    completeOnboarding(name);
    // User gesture → request permission, then local welcome push (no server).
    void NotificationManager.welcomeAfterOnboarding();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="atelier-onboarding-gateway"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${inputId}-title`}
          className="fixed inset-0 z-[400] flex items-center justify-center p-5 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: reduceMotion ? 0.12 : 0.55,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          transition={{
            duration: reduceMotion ? 0.15 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div
            className="absolute inset-0 bg-[color:var(--navy,#070B16)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,color-mix(in_oklch,var(--champagne)_16%,transparent),transparent_58%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-champagne/10 blur-3xl"
            aria-hidden
          />

          <motion.div
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-[1.75rem]",
              "border border-champagne/25 bg-white/[0.05] p-7 backdrop-blur-2xl sm:p-9",
              "shadow-[0_30px_80px_-28px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)]",
            )}
            initial={
              reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -8, scale: 0.985 }
            }
            transition={{
              duration: reduceMotion ? 0.12 : 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.42em] text-champagne/75">
              First fitting
            </p>
            <h2
              id={`${inputId}-title`}
              className="font-cinema mt-3 text-xl leading-snug tracking-[0.08em] text-foreground sm:text-2xl"
            >
              Welcome to your Digital Atelier. What is your name?
            </h2>
            <p className="mt-3 font-sans text-sm font-light leading-relaxed text-muted-foreground">
              We keep this offline on your device — so the atelier greets you
              personally every time you return.
            </p>

            <label htmlFor={inputId} className="mt-8 block space-y-2.5">
              <span className="sr-only">Your name</span>
              <div className="relative">
                <div
                  className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-champagne/45 via-neon/25 to-champagne/45 opacity-80 blur-[1px]"
                  aria-hidden
                />
                <input
                  id={inputId}
                  type="text"
                  name="atelier-user-name"
                  autoComplete="given-name"
                  autoFocus
                  maxLength={48}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEnter();
                    }
                  }}
                  placeholder="Your name"
                  className={cn(
                    "relative h-14 w-full rounded-2xl border border-champagne/40",
                    "bg-black/40 px-4 font-cinema text-lg tracking-[0.12em] text-champagne",
                    "placeholder:font-sans placeholder:text-sm placeholder:tracking-[0.2em] placeholder:text-white/30",
                    "outline-none backdrop-blur-md",
                    "shadow-[0_0_32px_-8px_color-mix(in_oklch,var(--champagne)_45%,transparent),inset_0_1px_0_rgba(255,255,255,0.1)]",
                    "focus-visible:border-champagne focus-visible:ring-2 focus-visible:ring-champagne/50",
                  )}
                />
              </div>
            </label>

            <motion.button
              type="button"
              disabled={!canSubmit}
              onClick={handleEnter}
              whileHover={
                reduceMotion || !canSubmit ? undefined : { scale: 1.015 }
              }
              whileTap={
                reduceMotion || !canSubmit ? undefined : { scale: 0.985 }
              }
              className={cn(
                "group relative mt-6 flex w-full items-center justify-center gap-2.5 overflow-hidden",
                "rounded-2xl border border-champagne px-5 py-4",
                "bg-champagne/15 font-cinema text-base tracking-[0.18em] text-champagne",
                "shadow-[0_0_40px_-8px_color-mix(in_oklch,var(--champagne)_55%,transparent)]",
                "outline-none transition-[background-color,box-shadow,opacity] duration-300",
                "hover:bg-champagne/25 hover:shadow-[0_0_56px_-6px_color-mix(in_oklch,var(--champagne)_70%,transparent)]",
                "focus-visible:ring-2 focus-visible:ring-champagne/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B16]",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
              )}
            >
              {!reduceMotion && canSubmit ? (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-[-20%] w-[40%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0"
                  initial={{ x: "-120%", opacity: 0 }}
                  whileHover={{
                    x: "220%",
                    opacity: [0, 1, 0.8, 0],
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                  }}
                />
              ) : null}
              <span className="relative">Enter Atelier</span>
              <ArrowRight
                className="relative size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </motion.button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
