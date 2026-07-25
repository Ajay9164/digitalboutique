"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useFabStore } from "@/stores/fab-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export function FloatingActionButton() {
  const { isVisible, label, ariaLabel, onPress } = useFabStore();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 sm:right-[max(1rem,calc(50%-14rem))]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.85, y: 12 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          <button
            type="button"
            onClick={() => onPress?.()}
            aria-label={ariaLabel || label}
            className={cn(
              "pointer-events-auto inline-flex items-center gap-2 rounded-full px-5 py-3.5",
              "bg-primary text-primary-foreground shadow-[0_14px_36px_-10px_rgba(15,23,28,0.55)]",
              "ring-1 ring-white/20 transition hover:brightness-110 active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <Plus className="size-5" aria-hidden="true" />
            <span className="text-sm font-semibold tracking-wide">{label}</span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
