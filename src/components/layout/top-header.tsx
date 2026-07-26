"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { APP_NAME } from "@/lib/constants";
import { useMounted } from "@/hooks/use-mounted";
import { useUiStore } from "@/stores/ui-store";
import { MasteryProgressRing } from "@/components/learning/mastery-progress-ring";
import { useMasteryStore } from "@/stores/mastery-store";
import { resolveMastery } from "@/features/learning/lib/mastery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/": "Journey",
  "/journey": "Journey",
  "/progress": "Progress",
  "/measurements": "Measurements",
  "/studio": "Studio",
  "/drafts": "Drafts",
  "/journal": "Journal",
};

export function TopHeader() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const totalXp = useMasteryStore((s) => s.totalXp);
  const modulesCompleted = useMasteryStore((s) => s.modulesCompleted);
  const mastery = resolveMastery(totalXp, modulesCompleted);
  const pageTitle = useUiStore((state) => state.pageTitle);
  const sectionTitle =
    pageTitle ??
    titles[pathname] ??
    (pathname.startsWith("/journey")
      ? "Journey"
      : pathname.startsWith("/progress")
        ? "Progress"
        : "Workspace");
  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-champagne/15",
        "bg-background/65 backdrop-blur-2xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-background/45",
      )}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="min-w-0">
          <Link
            href="/"
            className="font-display text-[1.35rem] font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
            aria-label={`${APP_NAME} home`}
          >
            {APP_NAME}
          </Link>
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {sectionTitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            href="/progress"
            className="interactive-lift group flex items-center gap-2 rounded-full border border-champagne/20 bg-card/70 py-1 pl-1 pr-2.5 backdrop-blur-md"
            aria-label={`Mastery Level ${mastery.level}: ${mastery.title}`}
          >
            <MasteryProgressRing size={34} />
            <span className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Level {mastery.level}
              </span>
              <span className="max-w-[7.5rem] truncate text-[11px] font-semibold text-foreground">
                {mastery.title}
              </span>
            </span>
          </Link>

          {mounted ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-full bg-muted/50 ring-1 ring-border/60"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-full bg-muted/50 ring-1 ring-border/60"
              aria-label="Toggle theme"
              disabled
            >
              <span className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
