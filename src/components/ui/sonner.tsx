"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useIsMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

/**
 * Global atelier toaster — navy/black glass, champagne hairline, Syne titles.
 * Mount once from the root layout. Call `toast()` from `sonner` anywhere.
 */
export function Toaster({ className, toastOptions, ...props }: ToasterProps) {
  const mounted = useIsMounted();
  const { resolvedTheme } = useTheme();
  // Avoid hydration mismatch — sonner reads theme on the client only.
  const theme = (mounted ? resolvedTheme : "dark") as ToasterProps["theme"];

  return (
    <Sonner
      theme={theme ?? "dark"}
      position="top-center"
      closeButton
      gap={10}
      offset={{ top: "max(1rem, env(safe-area-inset-top))" }}
      className={cn("toaster group", className)}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: cn(
            "group toast !flex !items-start !gap-3 !rounded-2xl !border !px-4 !py-3.5 !shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85),0_0_40px_-24px_color-mix(in_oklch,var(--champagne)_28%,transparent)]",
            "!border-champagne/30 !bg-[color-mix(in_oklch,var(--navy)_78%,black)]/80 !text-[color-mix(in_oklch,var(--champagne)_18%,white)]",
            "!backdrop-blur-2xl !backdrop-saturate-150",
            "font-sans text-sm font-medium tracking-tight",
            toastOptions?.classNames?.toast,
          ),
          title: cn(
            "font-display text-[0.95rem] font-semibold tracking-tight text-[color-mix(in_oklch,var(--champagne)_12%,white)]",
            toastOptions?.classNames?.title,
          ),
          description: cn(
            "font-sans text-[0.8rem] font-normal leading-relaxed text-white/65",
            toastOptions?.classNames?.description,
          ),
          actionButton: cn(
            "!rounded-xl !bg-primary !px-3 !py-1.5 !text-xs !font-semibold !text-primary-foreground",
            toastOptions?.classNames?.actionButton,
          ),
          cancelButton: cn(
            "!rounded-xl !bg-white/8 !px-3 !py-1.5 !text-xs !font-semibold !text-white/75",
            toastOptions?.classNames?.cancelButton,
          ),
          closeButton: cn(
            "!border-champagne/25 !bg-[color-mix(in_oklch,var(--navy)_70%,black)]/90 !text-champagne/80",
            "hover:!border-champagne/40 hover:!bg-white/10 hover:!text-champagne",
            toastOptions?.classNames?.closeButton,
          ),
          success: cn(
            "!border-champagne/35 [&_[data-icon]]:!text-champagne",
            toastOptions?.classNames?.success,
          ),
          error: cn(
            "!border-destructive/40 [&_[data-icon]]:!text-destructive",
            toastOptions?.classNames?.error,
          ),
          warning: cn(
            "!border-champagne/40 [&_[data-icon]]:!text-champagne",
            toastOptions?.classNames?.warning,
          ),
          info: cn(
            "!border-champagne/25 [&_[data-icon]]:!text-champagne/80",
            toastOptions?.classNames?.info,
          ),
        },
      }}
      {...props}
    />
  );
}
