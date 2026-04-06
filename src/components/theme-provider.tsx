"use client";

import { ThemeContext, useThemeProvider } from "@/hooks/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeProvider();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
