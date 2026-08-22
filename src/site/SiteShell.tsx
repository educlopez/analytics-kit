"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AnalyticsTheme } from "@analytics-kit/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SiteContextValue {
  theme: AnalyticsTheme;
  setTheme: (theme: AnalyticsTheme) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteShell");
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

function NavItem({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pathOnly = href.split("#")[0] || "/";
  const active =
    pathOnly === "/"
      ? pathname === "/"
      : pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  return (
    <Link href={href} className={[className, active ? "is-active" : ""].filter(Boolean).join(" ")}>
      {children}
    </Link>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AnalyticsTheme>("light");

  useEffect(() => {
    setThemeState(readTheme());
  }, []);

  function setTheme(next: AnalyticsTheme) {
    setThemeState(next);
    applyTheme(next);
  }

  return (
    <SiteContext.Provider value={{ theme, setTheme }}>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="shell">
        <nav className="nav">
          <Link className="brand" href="/">
            <span className="mark" aria-hidden="true" />
            <span className="wordmark">Analytics Kit</span>
          </Link>
          <div className="nav-links">
            <NavItem className="nav-keep" href="/docs">
              Docs
            </NavItem>
            <NavItem className="nav-keep" href="/components">
              Components
            </NavItem>
            <NavItem href="/#dashboard">Demo</NavItem>
            <a href="https://github.com/educlopez/analytics-kit">GitHub</a>
            <button
              type="button"
              className="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <Link className="btn btn-ink" href="/docs">
              Get started
            </Link>
          </div>
        </nav>
        <main id="content">{children}</main>
        <footer className="foot">
          <p>
            <a href="https://github.com/educlopez/analytics-kit">educlopez/analytics-kit</a>
            <span> · sample from </span>
            <a href="https://smoothui.dev">smoothui.dev</a>
            <span> · </span>
            <a href="/llms.txt">llms.txt</a>
            <span> · photos </span>
            <a href="https://unsplash.com">Unsplash</a>
            <span> · MIT</span>
          </p>
        </footer>
      </div>
    </SiteContext.Provider>
  );
}
