"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingActionButton } from "@/components/layout/floating-action-button";
import { PageTransition } from "@/components/layout/page-transition";
import { TopHeader } from "@/components/layout/top-header";
import { PwaInstallBanner } from "@/components/pwa/pwa-install-banner";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -left-24 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.82_0.06_185/0.45),transparent_68%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,oklch(0.42_0.06_185/0.28),transparent_68%)]" />
        <div className="absolute -right-16 top-24 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.88_0.04_230/0.5),transparent_70%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,oklch(0.35_0.04_230/0.35),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <TopHeader />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-[calc(6.75rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 md:max-w-xl lg:max-w-2xl"
      >
        <PageTransition>{children}</PageTransition>
      </main>

      <PwaInstallBanner />
      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}
