"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { installConsoleWarnFilters } from "@/lib/console-filters";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    // Suppress known harmless THREE.Clock + ANGLE X4122 / WebGLProgram noise.
    // PWA install listener is owned by PwaInstallBanner (ssr: false) so
    // beforeinstallprompt is never captured without a visible Install CTA.
    installConsoleWarnFilters();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
