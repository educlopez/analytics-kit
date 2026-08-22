"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  const active = href.includes("#")
    ? false
    : pathOnly === "/"
      ? pathname === "/"
      : pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  return (
    <Link href={href} className={[className, active ? "is-active" : ""].filter(Boolean).join(" ")}>
      {children}
    </Link>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const menuId = useId();
  const [theme, setThemeState] = useState<AnalyticsTheme>("light");
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setThemeState(readTheme());
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // The links are display:none once closed, so focus would fall to <body>.
      toggleRef.current?.focus();
    };
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 901px)");
    document.documentElement.classList.add("nav-open");
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onDesktop);
    return () => {
      document.documentElement.classList.remove("nav-open");
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onDesktop);
    };
  }, [open]);

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
        <nav className={`nav${open ? " is-open" : ""}`}>
          <Link className="brand" href="/">
            <span className="mark" aria-hidden="true" />
            <span className="wordmark">Analytics Kit</span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((current) => !current)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="nav-toggle-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
          <div id={menuId} className="nav-links">
            <NavItem href="/docs">Docs</NavItem>
            <NavItem href="/components">Components</NavItem>
            <NavItem href="/#dashboard">Demo</NavItem>
            <a href="https://github.com/educlopez/analytics-kit">GitHub</a>
            <button
              type="button"
              className="ghost nav-theme"
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
