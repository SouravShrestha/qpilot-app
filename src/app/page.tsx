"use client";

import { QPilotApp } from "@/components/qpilot/app";
import { AppStateProvider } from "@/lib/qpilot/state";
import { ThemeProvider } from "@/lib/qpilot/theme";
import { Toaster } from "@/components/ui/sonner";

export default function Page() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <QPilotApp />
        <Toaster />
      </AppStateProvider>
    </ThemeProvider>
  );
}
