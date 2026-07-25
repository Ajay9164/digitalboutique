"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { APP_NAME } from "@/lib/constants";
import { useMounted } from "@/hooks/use-mounted";
import { useUiStore } from "@/stores/ui-store";
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
        "sticky top-0 z-40 border-b border-white/20 dark:border-white/8",
        "bg-background/70 backdrop-blur-2xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-background/55",
      )}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4 sm:h-16 sm:px-6">
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

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-full bg-muted/50 ring-1 ring-border/60"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {mounted ? (
            isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )
          ) : (
            <span className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </header>
  );
}
