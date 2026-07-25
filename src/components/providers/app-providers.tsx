"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { installConsoleWarnFilters } from "@/lib/console-filters";
import { initInstallPromptListener } from "@/stores/install-prompt-store";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    // Suppress known harmless THREE.Clock + ANGLE X4122 / WebGLProgram noise only.
    installConsoleWarnFilters();
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
