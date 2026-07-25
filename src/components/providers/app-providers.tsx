"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { installThreeClockWarnFilter } from "@/lib/console-filters";
import { initInstallPromptListener } from "@/stores/install-prompt-store";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    // R3F 9 still constructs THREE.Clock (deprecated r183+). Patch + filter.
    installThreeClockWarnFilter();
    initInstallPromptListener();
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
