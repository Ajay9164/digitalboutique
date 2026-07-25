"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Minimal creator signature — sits above the floating bottom nav.
 */
export function DeveloperFooter() {
  const reduceMotion = useReducedMotion();

  return (
    <footer
      className="pointer-events-none fixed inset-x-0 bottom-[calc(4.85rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4"
      aria-label="Developer credit"
    >
      <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-background/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md dark:border-white/10">
        <motion.span
          className="relative flex size-1.5 items-center justify-center"
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.35, 1],
                  opacity: [0.55, 1, 0.55],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <span className="absolute inset-0 rounded-full bg-primary/40 blur-[3px]" />
          <span className="relative size-1.5 rounded-full bg-primary" />
        </motion.span>
        <span>Developed by Ajay T only</span>
        <Sparkles className="size-2.5 text-primary/70" aria-hidden />
      </p>
    </footer>
  );
}
