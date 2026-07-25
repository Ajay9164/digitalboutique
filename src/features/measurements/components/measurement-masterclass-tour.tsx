"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hand, RotateCcw, Sparkles } from "lucide-react";
import { useMeasurementStore } from "@/stores/measurement-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tailor-measurements-tour-v2";

const TIPS = [
  {
    id: "rotate",
    step: 1,
    title: "Welcome to your digital atelier",
    body: "Swipe to rotate the mannequin. Pinch or scroll to zoom — explore every angle of the dress form.",
    icon: RotateCcw,
  },
  {
    id: "tap",
    step: 2,
    title: "Learn by touching the body",
    body: "Tap any glowing body part to learn exactly how to measure it for a perfect fit.",
    icon: Hand,
  },
] as const;

function readDone(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * First-visit guided tour for the Measurements masterclass.
 */
export function MeasurementMasterclassTour() {
  const reduceMotion = useReducedMotion();
  const selectedId = useMeasurementStore((s) => s.selectedId);
  const [done, setDone] = useState(readDone);
  const [tipIndex, setTipIndex] = useState(0);

  const visible = !done && !selectedId;
  const tip = TIPS[tipIndex] ?? TIPS[0];
  const Icon = tip.icon;
  const isLast = tipIndex >= TIPS.length - 1;

  function finish() {
    setDone(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // private mode
    }
  }

  function advance() {
    if (isLast) finish();
    else setTipIndex((i) => i + 1);
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="absolute inset-0 z-30 flex items-end justify-center p-4 pb-6 sm:items-center sm:pb-4"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Measurements guided tour"
        >
          <motion.div
            className="absolute inset-0 bg-background/55 backdrop-blur-[3px]"
            aria-hidden
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={tip.id}
              className="glass-panel pointer-events-auto relative w-full max-w-sm rounded-3xl p-5 shadow-[0_28px_70px_-28px_rgba(15,23,28,0.55)]"
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Tip {tip.step} of {TIPS.length}
                </p>
              </div>

              <h2 className="font-display text-xl font-semibold tracking-tight">
                {tip.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tip.body}
              </p>

              <div className="mt-4 flex gap-1.5" aria-hidden>
                {TIPS.map((item, index) => (
                  <span
                    key={item.id}
                    className={`h-1 flex-1 rounded-full ${
                      index <= tipIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={finish}
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="ml-auto rounded-xl"
                  onClick={advance}
                >
                  {isLast ? (
                    <>
                      Start learning
                      <Sparkles aria-hidden />
                    </>
                  ) : (
                    "Next tip"
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
