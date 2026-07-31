"use client";

import { Flame } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { useIsMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

type StreakFlameProps = {
  className?: string;
};

/**
 * Premium streak flame — champagne gradient count beside mastery XP.
 */
export function StreakFlame({ className }: StreakFlameProps) {
  const mounted = useIsMounted();
  const hydrated = useUserStore((s) => s.hydrated);
  const currentStreak = useUserStore((s) => s.currentStreak);
  const ready = mounted && hydrated;
  const streak = ready ? currentStreak : 0;

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full border border-champagne/25",
        "bg-card/60 px-2 py-1 backdrop-blur-md",
        "shadow-[0_0_24px_-8px_color-mix(in_oklch,var(--champagne)_45%,transparent)]",
        className,
      )}
      title={
        ready
          ? `${streak}-day daily streak`
          : "Daily streak"
      }
      aria-label={
        ready
          ? `Daily streak: ${streak} day${streak === 1 ? "" : "s"}`
          : "Daily streak loading"
      }
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_40%,color-mix(in_oklch,var(--champagne)_28%,transparent),transparent_70%)] opacity-80"
        aria-hidden
      />
      <Flame
        className={cn(
          "relative size-3.5 shrink-0",
          streak > 0
            ? "text-champagne drop-shadow-[0_0_8px_color-mix(in_oklch,var(--champagne)_70%,transparent)]"
            : "text-champagne/40",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "relative font-display text-[11px] font-semibold tabular-nums tracking-tight",
          streak > 0
            ? "bg-gradient-to-br from-[#F7E7C3] via-[var(--champagne)] to-[#C4A46A] bg-clip-text text-transparent"
            : "text-muted-foreground",
        )}
      >
        {ready ? streak : "—"}
      </span>
    </div>
  );
}
