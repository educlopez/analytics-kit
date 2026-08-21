import { useEffect, useMemo, useState } from "react";
import { createSmoothuiMockConnector } from "@analytics-kit/connector-mock";
import { createVercelConnector } from "@analytics-kit/connector-vercel";
import {
  AnalyticsProvider,
  Dashboard,
  type AnalyticsTheme,
  type DashboardItem,
} from "@analytics-kit/react";
import type { AnalyticsConnector } from "@analytics-kit/core";

const INSTALL = "pnpm add @analytics-kit/react @analytics-kit/core @analytics-kit/connector-vercel";

const SNIPPET = `import { AnalyticsProvider, Dashboard } from "@analytics-kit/react";
import { createVercelConnector } from "@analytics-kit/connector-vercel";

const connector = createVercelConnector({
  token: process.env.VERCEL_TOKEN!,
  projectId: process.env.VERCEL_PROJECT_ID!,
});

export function Stats() {
  return (
    <AnalyticsProvider connector={connector}>
      <Dashboard />
    </AnalyticsProvider>
  );
}`;

const PROVIDERS = ["Vercel", "Plausible", "GA4", "Umami", "PostHog"] as const;

function createDemoConnector(): { connector: AnalyticsConnector; live: boolean } {
  const token = import.meta.env.VITE_VERCEL_TOKEN;
  const projectId = import.meta.env.VITE_VERCEL_PROJECT_ID;
  if (token && projectId) {
    return {
      live: true,
      connector: createVercelConnector({
        token,
        projectId,
        teamId: import.meta.env.VITE_VERCEL_TEAM_ID,
      }),
    };
  }
  return {
    live: false,
    connector: createSmoothuiMockConnector({ profile: "vercel" }),
  };
}

export function App() {
  const [{ connector, live }] = useState(createDemoConnector);
  const [theme, setTheme] = useState<AnalyticsTheme>("dark");
  const [copied, setCopied] = useState<"install" | "snippet" | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const copy = async (value: string, which: "install" | "snippet") => {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    setTimeout(() => setCopied(null), 1600);
  };

  const widgets = useMemo<DashboardItem[]>(
    () => [
      { widget: "visitors" },
      { widget: "pageviews" },
      { widget: "visits" },
      { widget: "devices" },
      { widget: "timeseries", span: 4, props: { metric: "visitors" } },
      { widget: "top-pages", span: 2 },
      { widget: "top-referrers" },
      { widget: "top-countries" },
    ],
    [],
  );

  return (
    <div className={`page ${theme}`}>
      <nav className="nav">
        <a className="brand" href="https://github.com/educlopez/analytics-kit">
          <span className="mark" aria-hidden="true" />
          Analytics Kit
        </a>
        <div className="nav-links">
          <a href="https://github.com/educlopez/analytics-kit#packages">Docs</a>
          <a href="https://www.npmjs.com/package/@analytics-kit/core">npm</a>
          <a href="https://github.com/educlopez/analytics-kit">GitHub</a>
          <button
            type="button"
            className="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <p className="kicker">Provider-agnostic analytics</p>
          <h1>
            One dashboard.
            <em> Any analytics tool.</em>
          </h1>
          <p className="lede">
            Connectors for Vercel, Plausible, GA4, Umami, and PostHog. Widgets speak a canonical
            query model — swap the provider, keep the UI. This page renders a Vercel Web Analytics
            dashboard for{" "}
            <a href="https://smoothui.dev" target="_blank" rel="noreferrer">
              smoothui.dev
            </a>
            .
          </p>
          <ul className="providers" aria-label="Supported providers">
            {PROVIDERS.map((name) => (
              <li key={name} className={name === "Vercel" ? "is-active" : undefined}>
                {name}
              </li>
            ))}
          </ul>
          <div className="actions">
            <a className="btn candy" href="#dashboard">
              See Vercel widgets
            </a>
            <a
              className="btn outline"
              href="https://www.npmjs.com/package/@analytics-kit/connector-vercel"
            >
              @analytics-kit/connector-vercel
            </a>
          </div>
          <button type="button" className="install" onClick={() => void copy(INSTALL, "install")}>
            <span>$</span>
            <code>{INSTALL}</code>
            <em>{copied === "install" ? "Copied" : "Copy"}</em>
          </button>
          <ul className="facts">
            <li>
              <strong>5</strong> connectors
            </li>
            <li>
              <strong>11</strong> widgets
            </li>
            <li>
              <strong>0.1.0</strong> on npm
            </li>
          </ul>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orb" />
          <div className="orb-ring" />
          <p className="orb-caption">canonical query → vendor API</p>
        </div>
      </header>

      <section className="analytics" id="dashboard">
        <div className="analytics-head">
          <div>
            <p className="kicker">Example · Vercel Web Analytics</p>
            <h2>smoothui.dev traffic</h2>
            <p className="lede compact">
              {live
                ? "Live Vercel Web Analytics for the SmoothUI project."
                : "Vercel capability profile (no bounce rate / realtime) with SmoothUI routes. Pass VITE_VERCEL_TOKEN and VITE_VERCEL_PROJECT_ID to load the live project."}
            </p>
          </div>
          <span className={`pill ${live ? "live" : ""}`}>
            {live ? "Live Vercel" : "Vercel profile · SmoothUI sample"}
          </span>
        </div>
        <AnalyticsProvider connector={connector} theme={theme} range="7d">
          <Dashboard widgets={widgets} showRange columns={4} />
        </AnalyticsProvider>
      </section>

      <section className="snippet-block">
        <div className="analytics-head">
          <div>
            <p className="kicker">Drop-in</p>
            <h2>Same widgets, Vercel connector</h2>
            <p className="lede compact">
              Keep API tokens on the server in production. This snippet is the constructor change —
              Plausible or GA4 swap the import.
            </p>
          </div>
          <button type="button" className="ghost" onClick={() => void copy(SNIPPET, "snippet")}>
            {copied === "snippet" ? "Copied" : "Copy snippet"}
          </button>
        </div>
        <pre className="snippet">
          <code>{SNIPPET}</code>
        </pre>
      </section>

      <footer className="foot">
        <p>
          <a href="https://github.com/educlopez/analytics-kit">educlopez/analytics-kit</a>
          {" · "}
          sample data from <a href="https://smoothui.dev">smoothui.dev</a>
          {" · "}
          MIT
        </p>
      </footer>
    </div>
  );
}
