"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { useLearningHubStore } from "@/stores/learning-hub-store";
import { Button } from "@/components/ui/button";

export function CelebrationOverlay() {
  const celebration = useLearningHubStore((s) => s.celebration);
  const clearCelebration = useLearningHubStore((s) => s.clearCelebration);

  return (
    <AnimatePresence>
      {celebration ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="alertdialog"
          aria-modal="true"
          aria-label="Milestone celebration"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-primary/30 bg-card p-6 text-center shadow-[0_30px_80px_-24px_rgba(26,107,90,0.55)]"
          >
            {/* Confetti dots */}
            {Array.from({ length: 12 }).map((_, index) => (
              <motion.span
                key={index}
                className="pointer-events-none absolute size-2 rounded-full bg-primary"
                style={{
                  left: `${8 + (index % 6) * 16}%`,
                  top: "20%",
                }}
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: 180 + (index % 3) * 40, opacity: 0 }}
                transition={{
                  duration: 1.4 + (index % 4) * 0.15,
                  delay: index * 0.04,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.div
              className="mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground"
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 0.7 }}
            >
              <PartyPopper className="size-7" aria-hidden="true" />
            </motion.div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {celebration.kind === "achievement" ? "Achievement" : "Milestone"}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {celebration.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {celebration.detail}
            </p>
            <Button
              type="button"
              className="mt-6 w-full rounded-xl"
              onClick={() => void clearCelebration()}
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
