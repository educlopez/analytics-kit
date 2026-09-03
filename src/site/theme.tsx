"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AnalyticsTheme } from "@analytics-kit/react";

export interface SiteContextValue {
  theme: AnalyticsTheme;
  setTheme: (theme: AnalyticsTheme) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside ThemeProvider");
  return ctx;
}

function readTheme(): AnalyticsTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: AnalyticsTheme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("ak-theme", theme);
  } catch {
    /* private mode */
  }
}

/**
 * The context lives apart from SiteShell so the navigation block can read the
 * theme without importing the shell that renders it.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AnalyticsTheme>("light");

  useEffect(() => {
    setThemeState(readTheme());
  }, []);

  function setTheme(next: AnalyticsTheme) {
    setThemeState(next);
    applyTheme(next);
  }

  return <SiteContext.Provider value={{ theme, setTheme }}>{children}</SiteContext.Provider>;
}
