"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Crown } from "lucide-react";
import { useMasteryStore } from "@/stores/mastery-store";
import { useUserStore } from "@/stores/user-store";
import { useIsMounted } from "@/hooks/use-mounted";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

const GOLD = ["#F7E7C3", "#E8D5A3", "#D4AF37", "#C9A962", "#FFF8E7", "#B8923A"];

function burstGoldConfetti() {
  const defaults = {
    startVelocity: 42,
    spread: 360,
    ticks: 120,
    zIndex: 200,
    colors: GOLD,
    disableForReducedMotion: true,
  };

  void confetti({
    ...defaults,
    particleCount: 120,
    origin: { x: 0.5, y: 0.3 },
  });
  window.setTimeout(() => {
    void confetti({
      ...defaults,
      particleCount: 90,
      origin: { x: 0.2, y: 0.45 },
      startVelocity: 36,
    });
  }, 180);
  window.setTimeout(() => {
    void confetti({
      ...defaults,
      particleCount: 90,
      origin: { x: 0.8, y: 0.45 },
      startVelocity: 36,
    });
  }, 320);
  window.setTimeout(() => {
    void confetti({
      ...defaults,
      particleCount: 70,
      origin: { x: 0.5, y: 0.55 },
      scalar: 1.15,
    });
  }, 480);
}

/**
 * Full-screen rank-up ceremony — gold confetti + native push when XP
 * crosses Apprentice → Journeyman (and every later boundary).
 */
export function RankUpCelebration() {
  const { rankUp, clearRankUp } = useMasteryStore(
    useShallow((s) => ({
      rankUp: s.rankUp,
      clearRankUp: s.clearRankUp,
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

  const displayName =
    mounted && userHydrated ? userName?.trim() || null : null;

  useEffect(() => {
    if (!rankUp || reduceMotion) return;
    burstGoldConfetti();
  }, [rankUp, reduceMotion]);

  return (
    <AnimatePresence>
      {rankUp ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden p-5"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          role="alertdialog"
          aria-modal="true"
          aria-label={`Rank achieved: ${rankUp.rank.title}`}
        >
          <div
            className="absolute inset-0 bg-[color-mix(in_oklch,var(--navy)_92%,black)]/90 backdrop-blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,color-mix(in_oklch,var(--champagne)_28%,transparent),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-champagne/15 blur-3xl"
            aria-hidden
          />

          <motion.div
            initial={
              reduceMotion ? false : { opacity: 0, y: 36, scale: 0.92 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 18, scale: 0.96 }
            }
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-[2rem]",
              "border border-champagne/40 bg-black/35 px-7 py-9 text-center backdrop-blur-2xl",
              "shadow-[0_0_80px_-20px_color-mix(in_oklch,var(--champagne)_55%,transparent),0_40px_100px_-40px_rgba(0,0,0,0.9)]",
            )}
          >
            <motion.div
              className="mx-auto mb-5 flex size-20 items-center justify-center rounded-[1.5rem] border border-champagne/45 bg-champagne/15 text-champagne"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.08, 1],
                      boxShadow: [
                        "0 0 0 0 color-mix(in oklch, var(--champagne) 0%, transparent)",
                        "0 0 48px 4px color-mix(in oklch, var(--champagne) 45%, transparent)",
                        "0 0 24px 0 color-mix(in oklch, var(--champagne) 25%, transparent)",
                      ],
                    }
              }
              transition={{ duration: 1.4, repeat: reduceMotion ? 0 : 2 }}
            >
              <Crown className="size-9 drop-shadow-[0_0_12px_color-mix(in_oklch,var(--champagne)_70%,transparent)]" aria-hidden />
            </motion.div>

            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.42em] text-champagne/80">
              Rank achieved
            </p>
            <h2 className="font-cinema mt-3 text-3xl tracking-[0.1em] text-[color-mix(in_oklch,var(--champagne)_20%,white)] sm:text-4xl">
              {rankUp.rank.title}
            </h2>
            <p className="mt-4 font-sans text-sm font-light leading-relaxed text-white/75">
              {displayName
                ? `Your tailoring mastery is growing, ${displayName}. Keep up the incredible work.`
                : "Your tailoring mastery is growing. Keep up the incredible work."}
            </p>
            <p className="mt-4 inline-flex rounded-full border border-champagne/30 bg-champagne/10 px-3.5 py-1.5 font-display text-[11px] font-semibold tabular-nums tracking-wide text-champagne">
              Level {rankUp.rank.level} · {rankUp.totalXp} XP
            </p>

            <Button
              type="button"
              className="mt-8 w-full rounded-2xl border border-champagne/50 bg-champagne/20 text-champagne hover:bg-champagne/30"
              onClick={() => clearRankUp()}
            >
              Continue crafting
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
