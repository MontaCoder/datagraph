"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

/**
 * ThemeProvider — wraps the app in next-themes' provider, configured to
 * write the theme as a class on <html> so our globals.css selectors
 * (`.dark`, `.light`) match. Defaults to dark — the editorial preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="datagraph-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
