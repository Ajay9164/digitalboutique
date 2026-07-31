"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DailyStreakListener } from "@/components/learning/daily-streak-listener";
import { PwaUpdateListener } from "@/components/pwa/pwa-update-listener";
import { installConsoleWarnFilters } from "@/lib/console-filters";
import { installDevServiceWorkerCleanup } from "@/lib/dev-sw-cleanup";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    // Suppress known harmless THREE.Clock + ANGLE X4122 / WebGLProgram noise.
    // PWA install listener is owned by PwaInstallBanner (ssr: false) so
    // beforeinstallprompt is never captured without a visible Install CTA.
    installConsoleWarnFilters();
    // Dev: drop leftover prod SWs on localhost (Serwist is disabled in development).
    installDevServiceWorkerCleanup();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={200}>
        {children}
        <DailyStreakListener />
        <PwaUpdateListener />
      </TooltipProvider>
    </ThemeProvider>
  );
}
