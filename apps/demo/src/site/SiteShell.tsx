import { useEffect, useState } from "react";
import type { AnalyticsTheme } from "@analytics-kit/react";
import { Link, NavLink, Outlet, useLocation, useOutletContext } from "react-router-dom";

export interface SiteContext {
  theme: AnalyticsTheme;
  setTheme: (theme: AnalyticsTheme) => void;
}

export function useSite() {
  return useOutletContext<SiteContext>();
}

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export function SiteShell() {
  const [theme, setTheme] = useState<AnalyticsTheme>("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="shell">
      <ScrollManager />
      <nav className="nav">
        <Link className="brand" to="/">
          <span className="mark" aria-hidden="true" />
          <span className="wordmark">Analytics Kit</span>
        </Link>
        <div className="nav-links">
          <NavLink className="nav-keep" to="/docs">
            Docs
          </NavLink>
          <NavLink className="nav-keep" to="/components">
            Components
          </NavLink>
          <NavLink to="/#dashboard">Demo</NavLink>
          <a href="https://github.com/educlopez/analytics-kit">GitHub</a>
          <button
            type="button"
            className="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <Link className="btn btn-ink" to="/docs">
            Get started
          </Link>
        </div>
      </nav>
      <Outlet context={{ theme, setTheme } satisfies SiteContext} />
      <footer className="foot">
        <p>
          <a href="https://github.com/educlopez/analytics-kit">educlopez/analytics-kit</a>
          <span> · sample from </span>
          <a href="https://smoothui.dev">smoothui.dev</a>
          <span> · photos </span>
          <a href="https://unsplash.com">Unsplash</a>
          <span> · MIT</span>
        </p>
      </footer>
    </div>
  );
}
