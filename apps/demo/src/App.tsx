import { useEffect, useState } from "react";
import { createSmoothuiMockConnector } from "@analytics-kit/connector-mock";
import { createVercelConnector } from "@analytics-kit/connector-vercel";
import {
  AnalyticsProvider,
  Dashboard,
  defaultDashboard,
  type AnalyticsTheme,
} from "@analytics-kit/react";
import type { AnalyticsConnector } from "@analytics-kit/core";
import { ChartGallery } from "./ChartGallery";

const INSTALL = "pnpm add @analytics-kit/react @analytics-kit/core @analytics-kit/connector-vercel";

const REGISTRY =
  "pnpm dlx shadcn@latest add https://educlopez.github.io/analytics-kit/r/dashboard.json";

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

function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=72`;
}

function CoverImg({
  id,
  alt,
  className = "cover-photo",
  sizes = "100vw",
  eager = false,
  position,
}: {
  id: string;
  alt: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  position?: string;
}) {
  return (
    <img
      className={className}
      src={unsplash(id, 1600)}
      srcSet={`${unsplash(id, 800)} 800w, ${unsplash(id, 1600)} 1600w, ${unsplash(id, 2400)} 2400w`}
      sizes={sizes}
      alt={alt}
      width={1600}
      height={1000}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}

const TICKER = [
  "12.4k visitors this week",
  "Posted /docs/components/siri-orb",
  "github.com is the top referrer",
  "Desktop 62% · Mobile 31%",
  "smoothui.dev · Vercel Analytics",
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
    a: "Pass variant on the chart — gradient, step, dots, horizontal, donut, hero. Colors come from your CSS variables (--chart-1, --primary, --card), so the chart follows the host site.",
  },
];

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
  const [theme, setTheme] = useState<AnalyticsTheme>("light");
  const [copied, setCopied] = useState<"install" | "snippet" | "registry" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const copy = async (value: string, which: "install" | "snippet" | "registry") => {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="shell">
      <nav className="nav">
        <a className="brand" href="#top">
          <span className="mark" aria-hidden="true" />
          <span className="wordmark">Analytics Kit</span>
        </a>
        <div className="nav-links">
          <a href="#dashboard">Demo</a>
          <a href="#kit">Components</a>
          <a href="#how">How it works</a>
          <a href="https://github.com/educlopez/analytics-kit">GitHub</a>
          <button
            type="button"
            className="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <a className="btn btn-ink" href="#dashboard">
            Get started
          </a>
        </div>
      </nav>

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
              smoothui.dev,
              <em> through Vercel.</em>
            </h2>
            <p className="lede compact">
              {live
                ? "Live Vercel Web Analytics for the SmoothUI project."
                : "Vercel capability profile with SmoothUI routes. Add VITE_VERCEL_TOKEN and VITE_VERCEL_PROJECT_ID to load the real project."}
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
              Area, line, bar, and pie — each with visual variants, like ReUI, shadcnblocks, bklit,
              and Intent UI. Colors inherit from your CSS variables; pick a <code>variant</code> for
              the drawing.
            </p>
          </div>
        </div>
        <ChartGallery theme={theme} />
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
              Add the catalog from GitHub Pages, or <code>educlopez/analytics-kit/dashboard</code>{" "}
              from the repo. Runtime still comes from npm so connectors and queries stay canonical.
            </p>
          </div>
          <button type="button" className="ghost" onClick={() => void copy(REGISTRY, "registry")}>
            {copied === "registry" ? "Copied" : "Copy"}
          </button>
        </div>
        <button type="button" className="install" onClick={() => void copy(REGISTRY, "registry")}>
          <span>$</span>
          <code>{REGISTRY}</code>
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
          <button type="button" className="ghost" onClick={() => void copy(SNIPPET, "snippet")}>
            {copied === "snippet" ? "Copied" : "Copy snippet"}
          </button>
        </div>
        <pre className="snippet">
          <code>{SNIPPET}</code>
        </pre>
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
          id="photo-1468327768560-75b60c6f10d5"
          alt="A field of orange poppies"
          position="center 60%"
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
