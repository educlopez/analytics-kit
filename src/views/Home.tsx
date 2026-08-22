"use client";

import { useEffect, useMemo, useState } from "react";
import { createHttpConnector } from "@analytics-kit/core";
import { AnalyticsProvider, Dashboard, defaultDashboard } from "@analytics-kit/react";
import Link from "next/link";
import { ChartTeaser } from "../ChartTeaser";
import { CodeBlock } from "../site/CodeBlock";
import { CoverImg } from "../site/CoverImg";
import { useSite } from "../site/SiteShell";
import { useCopy } from "../site/useCopy";
import { useRegistryCommand } from "../site/useRegistryCommand";

const INSTALL =
  "pnpm add @analytics-kit/react @analytics-kit/core @analytics-kit/next @analytics-kit/connector-vercel";

const SNIPPET = `import { AnalyticsProvider, Dashboard } from "@analytics-kit/react";
import { createHttpConnector } from "@analytics-kit/core";

const connector = createHttpConnector({ endpoint: "/api/analytics" });

export function Stats() {
  return (
    <AnalyticsProvider connector={connector}>
      <Dashboard />
    </AnalyticsProvider>
  );
}`;

const TICKER = [
  "12.4k visitors this week",
  "Posted /components/area-chart",
  "github.com is the top referrer",
  "Desktop 62% · Mobile 31%",
  "analytics-kit-demo.vercel.app · Vercel Analytics",
  "Swapped Plausible → Vercel",
];

const FEATURES = [
  {
    title: "Widgets stay canonical",
    body: "Visitors, pages, referrers, devices. The dashboard asks for metrics — not vendor field names.",
  },
  {
    title: "Capabilities, not crashes",
    body: "Vercel has no bounce rate. The widget knows, and sits out, instead of lying or throwing.",
  },
  {
    title: "Keys stay on the server",
    body: "The Next handler (or any Fetch route) holds the token. The browser talks to your endpoint.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a connector",
    body: "Vercel, Plausible, GA4, Umami, PostHog — or write one with defineConnector.",
  },
  {
    n: "02",
    title: "Drop the dashboard",
    body: "AnalyticsProvider + Dashboard. Same widgets, same query model.",
  },
  {
    n: "03",
    title: "Swap the vendor",
    body: "Change the constructor. The UI does not care which analytics tool you used last quarter.",
  },
];

const FAQS = [
  {
    q: "Is this tied to Vercel?",
    a: "No. This landing uses the Vercel connector as the example. Plausible, GA4, Umami, and PostHog ship in the same release. The widgets do not change.",
  },
  {
    q: "Where do API tokens live?",
    a: "On the server. Use @analytics-kit/next (or createHttpConnector against your own route). Do not put vendor keys in the browser bundle.",
  },
  {
    q: "What if a provider cannot answer a metric?",
    a: "Connectors declare capabilities. Widgets that need bounceRate on Vercel render an unsupported state instead of failing the page.",
  },
  {
    q: "Can I add my own provider or widget?",
    a: "Yes. defineConnector and defineWidget are the extension points. See examples/ in the repo.",
  },
  {
    q: "How do I change how a chart looks?",
    a: "Pass variant on the chart — gradient, tape, overlay, arc, ping, hero. Colors come from your CSS variables (--chart-1, --primary, --card), so the chart follows the host site.",
  },
];

export function HomePage() {
  const { theme } = useSite();
  const connector = useMemo(() => createHttpConnector({ endpoint: "/api/analytics" }), []);
  const { copied, copy } = useCopy();
  const registry = useRegistryCommand("dashboard");
  const [live, setLive] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    void fetch("/api/analytics")
      .then((response) => response.json() as Promise<{ id?: string }>)
      .then((info) => setLive(info.id === "vercel"))
      .catch(() => setLive(false));
  }, []);

  return (
    <>
      <header className="hero" id="top">
        <div className="hero-stage">
          <CoverImg
            id="photo-1469474968028-56623f02e42e"
            alt="Mist lifting off a mountain meadow"
            eager
            position="center 28%"
          />
          <div className="cover-scrim" />
          <div className="hero-copy">
            <p className="kicker on-photo">Analytics, without the vendor lock-in</p>
            <h1>
              One dashboard.
              <em> Any analytics tool.</em>
            </h1>
            <p className="lede on-photo">
              One query model. Five connectors. Widgets that render Vercel today and Plausible
              tomorrow — without rewriting the page.
            </p>
            <div className="ticker" aria-hidden="true">
              <div className="ticker-track">
                {[...TICKER, ...TICKER].map((item, i) => (
                  <span key={`${item}-${i}`}>{item}</span>
                ))}
              </div>
            </div>
            <div className="actions">
              <a className="btn btn-paper" href="#dashboard">
                See it on Vercel data
              </a>
              <a className="btn btn-ghost-photo" href="https://www.npmjs.com/org/analytics-kit">
                npm @analytics-kit
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="vista">
        <div className="vista-frame">
          <CoverImg
            id="photo-1500382017468-9049fed747ef"
            alt="A path through a green field"
            position="center 62%"
          />
          <div className="cover-scrim vista-scrim" />
          <div className="vista-copy">
            <p className="kicker on-photo">The kit</p>
            <h2>
              The dashboard
              <em> does not learn a vendor.</em>
            </h2>
            <p className="lede on-photo wide">
              Connectors map Vercel, Plausible, GA4, Umami, and PostHog onto the same metrics and
              dimensions. The dashboard never learns a vendor’s dialect.
            </p>
          </div>
        </div>
        <ul className="feature-grid vista-cards">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="paper-card">
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="analytics" id="dashboard">
        <div className="analytics-head">
          <div>
            <p className="kicker">Live example</p>
            <h2>
              This site,
              <em> through Vercel.</em>
            </h2>
            <p className="lede compact">
              {live
                ? "Live Vercel Web Analytics for this site."
                : "Vercel capability profile with this site's routes. Set ANALYTICS_VERCEL_TOKEN and ANALYTICS_VERCEL_PROJECT_ID on the server to load real data."}
            </p>
          </div>
          <span className={`pill ${live ? "live" : ""}`}>
            {live ? "Live Vercel" : "Vercel profile · sample"}
          </span>
        </div>
        <div className="dashboard-frame">
          <AnalyticsProvider connector={connector} theme={theme} range="7d">
            <Dashboard widgets={defaultDashboard} showRange columns={4} />
          </AnalyticsProvider>
        </div>
      </section>

      <section className="analytics" id="kit">
        <div className="analytics-head">
          <div>
            <p className="kicker">Charts</p>
            <h2>
              Same data.
              <em> Different shapes.</em>
            </h2>
            <p className="lede compact">
              A small taste of the kit. Every chart has visual <code>variant</code>s — the drawing,
              not a color theme. Colors inherit from your CSS.{" "}
              <Link href="/components">See every component and its config</Link>
              {" · "}
              <Link href="/docs">Read the docs</Link>.
            </p>
          </div>
        </div>
        <ChartTeaser theme={theme} />
      </section>

      <section className="snippet-block" id="registry">
        <div className="analytics-head">
          <div>
            <p className="kicker">shadcn registry</p>
            <h2>
              Install a widget.
              <em> Own the file.</em>
            </h2>
            <p className="lede compact">
              Add the catalog from this site’s <code>/r</code> folder, or{" "}
              <code>educlopez/analytics-kit/dashboard</code> from the repo. Runtime still comes from
              npm so connectors and queries stay canonical.
            </p>
          </div>
          <button type="button" className="ghost" onClick={() => void copy(registry, "registry")}>
            {copied === "registry" ? "Copied" : "Copy"}
          </button>
        </div>
        <button type="button" className="install" onClick={() => void copy(registry, "registry")}>
          <span>$</span>
          <code>{registry}</code>
          <em>{copied === "registry" ? "Copied" : "Copy"}</em>
        </button>
      </section>

      <section className="stat-plate">
        <CoverImg
          id="photo-1441974231531-c6227db76b6e"
          alt="Sun through a forest canopy"
          position="center 40%"
        />
        <div className="cover-scrim vista-scrim" />
        <div className="stat-copy">
          <p className="stat-figure">1</p>
          <h2>
            constructor change
            <em> to leave a vendor.</em>
          </h2>
        </div>
      </section>

      <section className="band" id="how">
        <div className="band-copy">
          <p className="kicker">How it works</p>
          <h2>
            Three steps.
            <em> Then you stop thinking about it.</em>
          </h2>
        </div>
        <ol className="steps">
          {STEPS.map((step) => (
            <li key={step.n} className="paper-card">
              <span className="step-n">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="snippet-block">
        <div className="analytics-head">
          <div>
            <p className="kicker">Drop-in</p>
            <h2>
              Same widgets.
              <em> Vercel connector.</em>
            </h2>
            <p className="lede compact">
              Keep tokens on the server in production. Swap the import for Plausible or GA4.
            </p>
          </div>
        </div>
        <CodeBlock code={SNIPPET} lang="tsx" title="stats.tsx" copyId="snippet" />
        <button type="button" className="install" onClick={() => void copy(INSTALL, "install")}>
          <span>$</span>
          <code>{INSTALL}</code>
          <em>{copied === "install" ? "Copied" : "Copy"}</em>
        </button>
      </section>

      <section className="band faq">
        <div className="band-copy">
          <p className="kicker">FAQ</p>
          <h2>
            The usual
            <em> questions.</em>
          </h2>
        </div>
        <div className="faq-list">
          {FAQS.map((item, index) => {
            const open = openFaq === index;
            return (
              <div key={item.q} className={`faq-item ${open ? "is-open" : ""}`}>
                <button type="button" onClick={() => setOpenFaq(open ? null : index)}>
                  <span>{item.q}</span>
                  <span aria-hidden="true">{open ? "–" : "+"}</span>
                </button>
                {open ? <p>{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="close">
        <CoverImg
          id="photo-1462275646964-a0e3386b89fa"
          alt="Wildflowers across a hillside"
          position="center 55%"
        />
        <div className="cover-scrim close-scrim" />
        <div className="close-copy">
          <h2>
            Ship the dashboard.
            <em> Keep the provider.</em>
          </h2>
          <a className="btn btn-paper" href="https://github.com/educlopez/analytics-kit">
            Get started on GitHub
          </a>
        </div>
      </section>
    </>
  );
}
