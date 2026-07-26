"use client";

import dynamic from "next/dynamic";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DeveloperFooter } from "@/components/layout/developer-footer";
import { FloatingActionButton } from "@/components/layout/floating-action-button";
import { VoiceMentorFab } from "@/components/layout/voice-mentor-fab";
import { TopHeader } from "@/components/layout/top-header";
import { MasteryCelebration } from "@/components/learning/mastery-celebration";

const PwaInstallBanner = dynamic(
  () =>
    import("@/components/pwa/pwa-install-banner").then((m) => m.PwaInstallBanner),
  { ssr: false },
);

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
        <div className="absolute -left-24 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--champagne)_22%,transparent),transparent_68%)] blur-2xl" />
        <div className="absolute -right-16 top-24 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--neon)_14%,transparent),transparent_70%)] blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <TopHeader />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-[calc(7.75rem+env(safe-area-inset-bottom))] pt-7 sm:px-7 md:max-w-xl lg:max-w-2xl"
      >
        {children}
      </main>

      <PwaInstallBanner />
      <MasteryCelebration />
      <FloatingActionButton />
      <VoiceMentorFab />
      <DeveloperFooter />
      <BottomNav />
    </div>
  );
}
