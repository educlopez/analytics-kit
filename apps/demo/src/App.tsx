import { useEffect, useMemo, useState } from "react";
import { createSmoothuiMockConnector } from "@analytics-kit/connector-mock";
import { createVercelConnector } from "@analytics-kit/connector-vercel";
import { AnalyticsProvider, Dashboard, type AnalyticsTheme } from "@analytics-kit/react";
import type { AnalyticsConnector } from "@analytics-kit/core";

const COMPONENT_COUNT = 130;
const BLOCK_COUNT = 34;
const INSTALL = "npx shadcn@latest add @smoothui/dynamic-island";

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
  const [copied, setCopied] = useState(false);
  const [stars, setStars] = useState(931);

  useEffect(() => {
    void fetch("https://api.github.com/repos/educlopez/smoothui")
      .then((response) => response.json())
      .then((payload: { stargazers_count?: number }) => {
        if (payload.stargazers_count) setStars(payload.stargazers_count);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const copy = async () => {
    await navigator.clipboard.writeText(INSTALL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const widgets = useMemo(
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
        <a className="brand" href="https://smoothui.dev" target="_blank" rel="noreferrer">
          <span className="mark" aria-hidden="true" />
          SmoothUI
        </a>
        <div className="nav-links">
          <a href="https://smoothui.dev/docs/components" target="_blank" rel="noreferrer">
            Components
          </a>
          <a href="https://smoothui.dev/docs" target="_blank" rel="noreferrer">
            Docs
          </a>
          <a href="https://github.com/educlopez/smoothui" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <button type="button" className="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <p className="kicker">Analytics Kit × SmoothUI</p>
          <h1>
            Animated React components
            <em> for shadcn/ui</em>
          </h1>
          <p className="lede">
            {COMPONENT_COUNT} drop-in components for your shadcn/ui project — one command, Motion-powered,
            fully typed. This landing embeds Analytics Kit widgets on{" "}
            <a href="https://smoothui.dev">smoothui.dev</a> traffic.
          </p>
          <div className="actions">
            <a className="btn candy" href="https://smoothui.dev/docs/components" target="_blank" rel="noreferrer">
              Browse components
            </a>
            <a className="btn outline" href="https://smoothui.dev/docs" target="_blank" rel="noreferrer">
              Read the docs
            </a>
          </div>
          <button type="button" className="install" onClick={() => void copy()}>
            <span>$</span>
            <code>{INSTALL}</code>
            <em>{copied ? "Copied" : "Copy"}</em>
          </button>
          <ul className="facts">
            <li>
              <strong>{COMPONENT_COUNT}</strong> components
            </li>
            <li>
              <strong>{BLOCK_COUNT}</strong> blocks
            </li>
            <li>
              <strong>{stars.toLocaleString()}</strong> GitHub stars
            </li>
          </ul>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orb" />
          <div className="orb-ring" />
          <p className="orb-caption">Smoothy</p>
        </div>
      </header>

      <section className="analytics">
        <div className="analytics-head">
          <div>
            <p className="kicker">smoothui.dev</p>
            <h2>Traffic, rendered with Analytics Kit</h2>
            <p className="lede compact">
              {live
                ? "Live Vercel Web Analytics for the SmoothUI project."
                : "Vercel-shaped widgets using SmoothUI routes (homepage, docs, Siri Orb, Dynamic Island). Pass VITE_VERCEL_TOKEN and VITE_VERCEL_PROJECT_ID to load the real dashboard."}
            </p>
          </div>
          <span className={`pill ${live ? "live" : ""}`}>{live ? "Live Vercel" : "SmoothUI sample · Vercel profile"}</span>
        </div>
        <AnalyticsProvider connector={connector} theme={theme} range="7d">
          <Dashboard widgets={widgets} showRange columns={4} />
        </AnalyticsProvider>
      </section>

      <footer className="foot">
        <p>
          Components from <a href="https://smoothui.dev">smoothui.dev</a> · Kit widgets stay provider-agnostic.
        </p>
      </footer>
    </div>
  );
}
