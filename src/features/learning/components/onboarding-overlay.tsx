"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { ONBOARDING_STEPS } from "@/features/learning/data/catalog";
import { useLearningHubStore } from "@/stores/learning-hub-store";
import { Button } from "@/components/ui/button";

export function OnboardingOverlay() {
  const show = useLearningHubStore((s) => s.showOnboarding);
  const snapshot = useLearningHubStore((s) => s.snapshot);
  const advanceOnboarding = useLearningHubStore((s) => s.advanceOnboarding);
  const finishOnboarding = useLearningHubStore((s) => s.finishOnboarding);
  const step = snapshot?.profile.onboardingStep ?? 0;
  const [name, setName] = useState("");

  if (!show) return null;

  const current = ONBOARDING_STEPS[Math.min(step, ONBOARDING_STEPS.length - 1)];
  const isLast = step >= ONBOARDING_STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-end justify-center bg-background/80 p-4 backdrop-blur-xl sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome onboarding"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/40 bg-card shadow-[0_30px_80px_-30px_rgba(15,23,28,0.55)] dark:border-white/10"
        >
          <div className="bg-gradient-to-br from-primary/20 via-transparent to-transparent px-5 pb-2 pt-5">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Step {Math.min(step + 1, ONBOARDING_STEPS.length)} of{" "}
              {ONBOARDING_STEPS.length}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {current.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {current.body}
            </p>
          </div>

          <div className="space-y-4 px-5 py-5">
            {isLast ? (
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  What should we call you?
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            ) : null}

            <div className="flex gap-1.5">
              {ONBOARDING_STEPS.map((item, index) => (
                <span
                  key={item.id}
                  className={`h-1 flex-1 rounded-full ${
                    index <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button
              type="button"
              className="w-full rounded-xl"
              onClick={() => {
                if (isLast) {
                  void finishOnboarding(name);
                } else {
                  void advanceOnboarding(step + 1);
                }
              }}
            >
              {isLast ? "Enter the atelier" : "Continue"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
