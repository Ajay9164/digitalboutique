"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Global creator signature — champagne glow accent.
 * Clears the floating bottom nav on atelier routes; sits near the safe area on landing.
 */
export function DeveloperFooter() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const aboveBottomNav =
    pathname !== "/" && !pathname.startsWith("/~offline");

  return (
    <footer
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4",
        aboveBottomNav
          ? "bottom-[calc(4.85rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(0.85rem+env(safe-area-inset-bottom))]",
      )}
      aria-label="Developer credit"
    >
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-champagne/30",
          "bg-background/40 px-3.5 py-1.5 backdrop-blur-xl backdrop-saturate-150",
          "shadow-[0_0_28px_-8px_color-mix(in_oklch,var(--champagne)_55%,transparent),inset_0_1px_0_rgba(255,255,255,0.12)]",
        )}
      >
        <motion.span
          className="relative flex size-1.5 items-center justify-center"
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.4, 1],
                  opacity: [0.5, 1, 0.5],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <span className="absolute inset-0 rounded-full bg-champagne/50 blur-[4px]" />
          <span className="relative size-1.5 rounded-full bg-champagne" />
        </motion.span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne",
            "drop-shadow-[0_0_10px_color-mix(in_oklch,var(--champagne)_65%,transparent)]",
            !reduceMotion && "animate-[dev-signature-glow_3.2s_ease-in-out_infinite]",
          )}
        >
          DEVELOPED BY AJAY T ONLY
        </span>
        <Sparkles
          className="size-2.5 text-champagne drop-shadow-[0_0_8px_color-mix(in_oklch,var(--champagne)_70%,transparent)]"
          aria-hidden
        />
      </div>
    </footer>
  );
}
