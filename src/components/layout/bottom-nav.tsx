"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Compass,
  FileStack,
  Ruler,
  Sparkles,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { useUiStore } from "@/stores/ui-store";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const icons = {
  "/": Compass,
  "/measurements": Ruler,
  "/studio": Sparkles,
  "/drafts": FileStack,
  "/journal": BookOpen,
} as const;

export function BottomNav() {
  const pathname = usePathname();
  const isNavVisible = useUiStore((state) => state.isNavVisible);
  const reduceMotion = useReducedMotion();

  if (!isNavVisible) return null;

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
    >
      <div
        className={cn(
          "glass-panel pointer-events-auto mx-auto flex max-w-lg items-stretch gap-0.5 rounded-[1.75rem] p-1.5 sm:gap-1",
          "backdrop-blur-xl backdrop-saturate-150",
        )}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = icons[item.href];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-3xl px-1 py-2 text-[9px] font-medium tracking-wide transition-colors sm:gap-1 sm:px-2 sm:py-2.5 sm:text-[10px]",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : "nav-pill"}
                  className="absolute inset-0 rounded-3xl bg-primary shadow-sm"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1">
                <Icon className="size-[1.05rem] sm:size-[1.15rem]" aria-hidden="true" />
                <span>{item.shortLabel}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
