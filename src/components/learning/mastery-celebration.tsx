"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useMasteryStore } from "@/stores/mastery-store";
import { useUserStore } from "@/stores/user-store";
import { useIsMounted } from "@/hooks/use-mounted";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { masteryCongratsLabel } from "@/features/onboarding/lib/personalization";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";

/**
 * Lightweight mastery unlock toast — confetti + glowing badge for +50 XP awards.
 * Congratulates by persisted name once the client has mounted (hydration-safe).
 */
export function MasteryCelebration() {
  const { celebration, clearCelebration } = useMasteryStore(
    useShallow((s) => ({
      celebration: s.celebration,
      clearCelebration: s.clearCelebration,
    })),
  );
  const reduceMotion = useReducedMotion();
  const mounted = useIsMounted();
  const { userHydrated, userName } = useUserStore(
    useShallow((s) => ({
      userHydrated: s.hydrated,
      userName: s.userName,
    })),
  );

  const congrats = masteryCongratsLabel(
    mounted && userHydrated ? userName : null,
  );

  return (
    <AnimatePresence>
      {celebration ? (
        <motion.div
          className="fixed inset-0 z-[85] flex items-end justify-center bg-background/55 p-4 backdrop-blur-md sm:items-center"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          role="alertdialog"
          aria-modal="true"
          aria-label={congrats}
        >
          <motion.div
            initial={reduceMotion ? false : { y: 40, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="glass-panel relative w-full max-w-sm overflow-hidden rounded-[1.75rem] p-6 text-center shadow-[0_30px_80px_-28px_rgba(15,23,28,0.55)]"
          >
            {!reduceMotion
              ? Array.from({ length: 14 }).map((_, index) => (
                  <motion.span
                    key={index}
                    className="pointer-events-none absolute size-1.5 rounded-full"
                    style={{
                      left: `${6 + (index % 7) * 13}%`,
                      top: "12%",
                      background:
                        index % 3 === 0
                          ? "var(--champagne)"
                          : index % 3 === 1
                            ? "var(--neon)"
                            : "var(--neon-voice)",
                    }}
                    initial={{ y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      y: 160 + (index % 4) * 30,
                      opacity: 0,
                      rotate: index * 24,
                    }}
                    transition={{
                      duration: 1.35 + (index % 3) * 0.12,
                      delay: index * 0.035,
                      ease: "easeOut",
                    }}
                  />
                ))
              : null}

            <motion.div
              className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-[0_0_40px_-8px_color-mix(in_oklch,var(--primary)_70%,transparent)]"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.1, 1], rotate: [0, -6, 6, 0] }
              }
              transition={{ duration: 0.75 }}
            >
              <Sparkles className="size-7" aria-hidden />
            </motion.div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              +{celebration.xp} Tailor Points
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {!mounted || !userHydrated ? (
                <span
                  className="mx-auto inline-block h-7 w-48 max-w-full animate-pulse rounded-md bg-muted/70"
                  aria-hidden
                />
              ) : (
                congrats
              )}
            </h2>
            <p className="mt-2 text-sm font-medium text-foreground/90">
              {celebration.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {celebration.detail}
            </p>
            <p className="mt-3 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Level {celebration.level}: {celebration.levelTitle}
            </p>

            <Button
              type="button"
              className="mt-6 w-full rounded-xl"
              onClick={() => clearCelebration()}
            >
              Continue crafting
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
