"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type PageTransitionProps = {
  children: React.ReactNode;
};

/**
 * Rendered from `app/(app)/template.tsx`, so React remounts it on every route
 * change. No AnimatePresence here on purpose: an exit animation inside a
 * persistent layout can stall the swap and leave the page blank until reload.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
      }
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
