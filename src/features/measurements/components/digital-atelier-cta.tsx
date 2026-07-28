"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurtainTransitionStore } from "@/stores/curtain-transition-store";
import { disposeVoiceMentorRuntime } from "@/stores/voice-mentor-store";

type DigitalAtelierCtaProps = {
  className?: string;
  /** Destination after the curtain seals — Digital Atelier (Studio). */
  href?: string;
};

/**
 * Grand climax CTA — glassmorphism + 1px champagne border + light-sweep hover.
 * Click is intercepted for a theatrical curtain-drop route transition
 * (no instant Next.js navigation).
 */
export function DigitalAtelierCta({
  className,
  href = "/studio",
}: DigitalAtelierCtaProps) {
  const reduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const phase = useCurtainTransitionStore((s) => s.phase);
  const begin = useCurtainTransitionStore((s) => s.begin);
  const busy = phase !== "idle";

  const handleEnter = () => {
    if (busy) return;
    const el = buttonRef.current;
    if (!el) return;

    // Silence any mentor speech before WebGL teardown.
    disposeVoiceMentorRuntime();

    const rect = el.getBoundingClientRect();
    begin({
      href,
      origin: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: Math.max(rect.height, 1),
      },
    });
  };

  return (
    <section
      aria-labelledby="digital-atelier-cta-heading"
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-champagne/20",
        "bg-gradient-to-b from-navy/80 via-black/70 to-navy/90",
        "px-5 py-12 sm:px-10 sm:py-16",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,color-mix(in_oklch,var(--champagne)_18%,transparent),transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-champagne/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.42em] text-champagne/80">
          Grand climax
        </p>
        <h2
          id="digital-atelier-cta-heading"
          className="font-cinema text-2xl tracking-[0.16em] text-foreground sm:text-3xl"
        >
          The form is ready
        </h2>
        <p className="max-w-md font-sans text-sm font-light leading-relaxed text-muted-foreground sm:text-[15px]">
          The digital mannequin stands complete. Step into the atelier and begin
          drafting, draping, and fitting in the tools built for craft.
        </p>

        <motion.div
          className="relative mt-2 w-full max-w-lg"
          whileHover={reduceMotion || busy ? undefined : { scale: 1.015 }}
          whileTap={reduceMotion || busy ? undefined : { scale: 0.985 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-[1.35rem] bg-gradient-to-r from-champagne/40 via-neon/30 to-champagne/40 opacity-80 blur-[1px]"
            aria-hidden
          />

          <button
            ref={buttonRef}
            type="button"
            disabled={busy}
            onClick={handleEnter}
            aria-busy={busy}
            className={cn(
              "group relative flex w-full items-center justify-center gap-3 overflow-hidden",
              "rounded-[1.3rem] border border-champagne",
              "bg-white/[0.06] px-6 py-5 backdrop-blur-xl sm:py-6",
              "shadow-[0_0_48px_-8px_color-mix(in_oklch,var(--champagne)_55%,transparent),inset_0_1px_0_rgba(255,255,255,0.18)]",
              "outline-none transition-[box-shadow,background-color] duration-300",
              "hover:bg-white/[0.1] hover:shadow-[0_0_64px_-6px_color-mix(in_oklch,var(--champagne)_70%,transparent),inset_0_1px_0_rgba(255,255,255,0.28)]",
              "focus-visible:ring-2 focus-visible:ring-champagne/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              "disabled:cursor-wait disabled:opacity-90",
            )}
          >
            {!reduceMotion && !busy ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-[-20%] w-[45%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0"
                initial={{ x: "-120%", opacity: 0 }}
                whileHover={{
                  x: "220%",
                  opacity: [0, 1, 0.85, 0],
                  transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                }}
              />
            ) : null}

            {!reduceMotion && !busy ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[1.3rem] bg-gradient-to-r from-transparent via-champagne/10 to-transparent"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 100%" }}
              />
            ) : null}

            <span className="relative font-cinema text-lg tracking-[0.14em] text-champagne sm:text-xl sm:tracking-[0.18em]">
              Enter the Digital Atelier
            </span>
            <ArrowUpRight
              className="relative size-5 shrink-0 text-champagne transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-6"
              aria-hidden
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
