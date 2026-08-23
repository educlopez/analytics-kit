"use client";

import Link from "next/link";
import { CodeBlock } from "../site/CodeBlock";
import { PropsTable } from "../site/PropsTable";
import { useCopy } from "../site/useCopy";
import { useRegistryCommand } from "../site/useRegistryCommand";

const TOC = [
  { href: "#install", label: "Install" },
  { href: "#provider", label: "Provider" },
  { href: "#connectors", label: "Connectors" },
  { href: "#query", label: "Query model" },
  { href: "#charts", label: "Charts" },
  { href: "#widgets", label: "Widgets" },
  { href: "#colors", label: "Colors" },
  { href: "#keys", label: "Server keys" },
  { href: "#registry", label: "shadcn registry" },
  { href: "#extend", label: "Extend" },
] as const;

const INSTALL =
  "pnpm add @analytics-kit/react @analytics-kit/core @analytics-kit/next @analytics-kit/connector-vercel";

const PROVIDER = `import { AnalyticsProvider, Dashboard } from "@analytics-kit/react";
import { createVercelConnector } from "@analytics-kit/connector-vercel";
import "@analytics-kit/react/styles.css";

const connector = createVercelConnector({
  token: process.env.VERCEL_TOKEN!,
  projectId: process.env.VERCEL_PROJECT_ID!,
});

export function Stats() {
  return (
    <AnalyticsProvider connector={connector} theme="light" range="7d">
      <Dashboard />
    </AnalyticsProvider>
  );
}`;

const QUERY = `const result = await connector.query({
  range: "7d",
  metrics: ["visitors", "pageviews"],
  dimensions: ["path"],
  granularity: "day",
  limit: 8,
  includePrevious: true,
});`;

const CHART = `import { AreaChart } from "@analytics-kit/react";

<AreaChart
  data={points}
  dataKey="value"
  labelKey="date"
  variant="gradient"
  config={{ value: { label: "Visitors", color: "var(--chart-1)" } }}
/>`;

const HANDLER = `import { createVercelConnector } from "@analytics-kit/connector-vercel";
import { createRouteHandlers } from "@analytics-kit/next";

const connector = createVercelConnector({
  token: process.env.VERCEL_TOKEN!,
  projectId: process.env.VERCEL_PROJECT_ID!,
});

export const { GET, POST } = createRouteHandlers({ connector });`;

const COLORS = `:root {
  --chart-1: #1d779b;
  --chart-2: #297c3b;
  --chart-3: #c45c26;
  --chart-4: #7c6a4a;
  --chart-5: #5b4a8a;
  --card: #fff;
  --foreground: #1a1613;
  --primary: #1d779b;
  --border: #e3ddcf;
  --muted: #f3f0e9;
  --muted-foreground: #605852;
}`;

export function DocsPage() {
  const { copied, copy } = useCopy();
  const registry = useRegistryCommand("dashboard");

  return (
    <>
      <header className="page-head">
        <p className="kicker">Documentation</p>
        <h1>
          Drop the kit in.
          <em> Swap the vendor later.</em>
        </h1>
        <p className="lede compact">
          Connectors, the query model, chart variants, and how colors follow the host site. For
          every drawing and its props, see <Link href="/components">Components</Link>.
        </p>
      </header>

      <div className="docs-layout">
        <aside className="docs-toc" aria-label="On this page">
          {TOC.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </aside>

        <div className="docs-body">
          <section className="docs-section" id="install">
            <p className="kicker">01</p>
            <h2>Install</h2>
            <p className="lede compact">
              Pick a connector for the analytics tool you already use. The React package is the
              dashboard and the charts.
            </p>
            <button type="button" className="install" onClick={() => void copy(INSTALL, "install")}>
              <span>$</span>
              <code>{INSTALL}</code>
              <em>{copied === "install" ? "Copied" : "Copy"}</em>
            </button>
            <p className="lede compact">
              Also: <code>@analytics-kit/connector-plausible</code>, <code>connector-ga4</code>,{" "}
              <code>connector-umami</code>, <code>connector-posthog</code>, and{" "}
              <code>connector-mock</code> for tests. Import{" "}
              <code>@analytics-kit/react/styles.css</code> once.
            </p>
          </section>

          <section className="docs-section" id="provider">
            <p className="kicker">02</p>
            <h2>AnalyticsProvider</h2>
            <p className="lede compact">
              One provider around the tree. Widgets and hooks read the connector, range, and theme
              from context. <code>theme</code> is light or dark — not a color palette.
            </p>
            <CodeBlock code={PROVIDER} lang="tsx" title="provider.tsx" />
            <PropsTable
              rows={[
                {
                  name: "connector",
                  type: "AnalyticsConnector",
                  notes: "Required. Any package connector, mock, or createHttpConnector.",
                },
                {
                  name: "range",
                  type: "DateRangeInput",
                  default: '"7d"',
                  notes: "Preset (24h, 7d, 30d, 90d, 12mo, …) or { from, to }.",
                },
                {
                  name: "theme",
                  type: '"light" | "dark"',
                  default: '"dark"',
                  notes: "Sets data-ak-theme on the kit root. Host CSS still owns --chart-*.",
                },
                {
                  name: "cacheTtlMs",
                  type: "number",
                  default: "30000",
                  notes: "In-memory query cache on the connector. 0 disables it.",
                },
              ]}
            />
          </section>

          <section className="docs-section" id="connectors">
            <p className="kicker">03</p>
            <h2>Connectors</h2>
            <p className="lede compact">
              Same <code>query()</code> shape. Swap the constructor when you leave a vendor.
            </p>
            <PropsTable
              columns={["API", "Options", "Default", "Notes"]}
              rows={[
                {
                  name: "createVercelConnector",
                  type: "{ token, projectId, teamId? }",
                  notes: "@analytics-kit/connector-vercel — Web Analytics API.",
                },
                {
                  name: "createPlausibleConnector",
                  type: "{ apiKey, siteId }",
                  notes: "@analytics-kit/connector-plausible — Stats API v2.",
                },
                {
                  name: "createGa4Connector",
                  type: "{ accessToken, propertyId }",
                  notes: "@analytics-kit/connector-ga4 — Data API.",
                },
                {
                  name: "createUmamiConnector",
                  type: "{ apiKey, websiteId, host? }",
                  notes: "@analytics-kit/connector-umami.",
                },
                {
                  name: "createPostHogConnector",
                  type: "{ apiKey, projectId, host? }",
                  notes: "@analytics-kit/connector-posthog — HogQL.",
                },
                {
                  name: "createMockConnector",
                  type: "{ profile?, seed? }",
                  notes: "Deterministic data. profile: full | vercel | plausible | …",
                },
                {
                  name: "createHttpConnector",
                  type: "{ endpoint }",
                  notes: "Browser talks to your /api/analytics. Keys stay on the server.",
                },
              ]}
            />
          </section>

          <section className="docs-section" id="query">
            <p className="kicker">04</p>
            <h2>Query model</h2>
            <p className="lede compact">
              Widgets never send vendor field names. They send a canonical{" "}
              <code>AnalyticsQuery</code>. The connector maps it.
            </p>
            <CodeBlock code={QUERY} lang="ts" title="query.ts" />
            <PropsTable
              rows={[
                {
                  name: "range",
                  type: "DateRangeInput",
                  notes: "Required on the wire. Provider range is the default in useQuery.",
                },
                {
                  name: "metrics",
                  type: "MetricId[]",
                  notes:
                    "visitors, pageviews, visits, bounceRate, avgDuration, viewsPerVisit, events.",
                },
                {
                  name: "dimensions",
                  type: "DimensionId[]",
                  notes:
                    "path, referrer, country, device, browser, os, source, medium, campaign, eventName, host.",
                },
                {
                  name: "granularity",
                  type: '"hour" | "day" | "week" | "month"',
                  notes: "Time buckets for series. Omit for totals-only queries.",
                },
                {
                  name: "filters",
                  type: "AnalyticsFilter[]",
                  notes: "dimension + op (eq, neq, contains, in) + value.",
                },
                {
                  name: "limit",
                  type: "number",
                  notes: "Breakdown row cap.",
                },
                {
                  name: "includePrevious",
                  type: "boolean",
                  notes: "Previous-period totals for deltas on metric cards.",
                },
              ]}
            />
            <p className="lede compact">
              Result: <code>totals</code>, <code>series</code>, <code>breakdown</code>, optional{" "}
              <code>previous.totals</code>. Hooks: <code>useQuery</code>, <code>useRealtime</code>,{" "}
              <code>useCapabilities</code>. If a connector cannot answer a metric, the widget
              renders an unsupported state instead of crashing.
            </p>
          </section>

          <section className="docs-section" id="charts">
            <p className="kicker">05</p>
            <h2>Charts</h2>
            <p className="lede compact">
              Tailwind + Recharts. Eighteen types, funnel through sunburst, and the drawing is a{" "}
              <code>variant</code> — gradient, dither, hatched, glow — not a palette. Colors come
              from CSS variables on the host page.
            </p>
            <CodeBlock code={CHART} lang="tsx" title="chart.tsx" />
            <PropsTable
              rows={[
                {
                  name: "AreaChart",
                  type: "gradient | linear | natural | step | dots | spark | dither | glow | hatched | bars | solid",
                  default: "gradient",
                  notes: "Filled trend. hatched and bars are SVG textures; glow blooms the stroke.",
                },
                {
                  name: "LineChart",
                  type: "monotone | linear | step | dashed | dots | dither | glow | ping | rainbow | values",
                  default: "monotone",
                  notes: "Stroke only. ping pulses the last point; rainbow uses --chart-1…5.",
                },
                {
                  name: "BarChart",
                  type: "vertical | horizontal | rounded | hatched | dither | glow | gradient | duotone",
                  default: "vertical",
                  notes: "Breakdown bars. duotone is a hard two-band fill.",
                },
                {
                  name: "PieChart",
                  type: "donut | pie | legend | dither | rounded | radial | glow",
                  default: "donut",
                  notes: "Share of a dimension. radial is a RadialBar.",
                },
                {
                  name: "FunnelChart",
                  type: "tape | steps | vertical",
                  default: "tape",
                  notes: "Conversion stages with drop-off.",
                },
                {
                  name: "RadarChart",
                  type: "stroke | fill | glow | dither",
                  default: "fill",
                  notes: "Multi-axis comparison.",
                },
                {
                  name: "ComposedChart",
                  type: "combo | highlight | overlay",
                  default: "combo",
                  notes: "Two series on one axis.",
                },
                {
                  name: "GaugeChart",
                  type: "arc | ring | tick",
                  default: "arc",
                  notes: "Single-value dial.",
                },
                {
                  name: "ScatterChart",
                  type: "dots | bubble | glow",
                  default: "dots",
                  notes: "Correlation. bubble sizes by z.",
                },
                {
                  name: "SankeyChart",
                  type: "flow | gradient | dither",
                  default: "flow",
                  notes: "Flow between stages. nodes + links.",
                },
                {
                  name: "CandlestickChart",
                  type: "ohlc | hollow | wick",
                  default: "ohlc",
                  notes: "Open, high, low, close.",
                },
                {
                  name: "ChoroplethChart",
                  type: "tiles | heat | dither",
                  default: "tiles",
                  notes: "Region tiles by intensity. Not a geoJSON map.",
                },
                {
                  name: "LiveLineChart",
                  type: "stream | glow | dashed",
                  default: "stream",
                  notes: "Sliding window over a series.",
                },
                {
                  name: "RingChart",
                  type: "stack | nested | track",
                  default: "stack",
                  notes: "Concentric KPI rings.",
                },
                {
                  name: "HeatmapChart",
                  type: "calendar | matrix | dither",
                  default: "calendar",
                  notes: "A grid of intensity cells.",
                },
                {
                  name: "SunburstChart",
                  type: "nest | burst",
                  default: "nest",
                  notes: "Hierarchy as two rings.",
                },
                {
                  name: "ProfitLossChart",
                  type: "fill | stroke | bars",
                  default: "fill",
                  notes: "Signed series above and below zero.",
                },
                {
                  name: "MetricCard",
                  type: "default | spark | compact | hero",
                  default: "default",
                  notes: "Wired to a metric via useQuery.",
                },
                {
                  name: "RankedList",
                  type: "bar | compact | table",
                  default: "bar",
                  notes: "Breakdown rows with optional tracks.",
                },
              ]}
            />
            <p className="lede compact">
              Shared chart props: <code>data</code>, <code>dataKey</code>, <code>labelKey</code>,{" "}
              <code>variant</code>, <code>config</code>, <code>className</code>. Full tables live on{" "}
              <Link href="/components">the components page</Link>.
            </p>
          </section>

          <section className="docs-section" id="widgets">
            <p className="kicker">06</p>
            <h2>Widgets &amp; dashboard</h2>
            <p className="lede compact">
              <code>Dashboard</code> lays out registered widgets. <code>defaultDashboard</code> is
              the Vercel-friendly subset. <code>catalogDashboard</code> is every built-in widget —
              use it with a full-capability connector (mock profile <code>full</code>).
            </p>
            <PropsTable
              rows={[
                {
                  name: "widgets",
                  type: "DashboardItem[]",
                  default: "defaultDashboard",
                  notes: '{ widget, span?, props? }. widget is a registry id such as "visitors".',
                },
                {
                  name: "columns",
                  type: "number",
                  default: "4",
                  notes: "Grid columns. span on an item stretches across.",
                },
                {
                  name: "showRange",
                  type: "boolean",
                  default: "true",
                  notes: "Preset range toolbar from the provider.",
                },
              ]}
            />
            <p className="lede compact">
              Built-in ids: visitors, pageviews, visits, events, bounce-rate, duration,
              views-per-visit, realtime, timeseries, top-pages, top-referrers, top-countries,
              devices, top-browsers, top-os, top-sources, top-campaigns, top-events, pages-table,
              tracker.
            </p>
          </section>

          <section className="docs-section" id="colors">
            <p className="kicker">07</p>
            <h2>Colors follow the host</h2>
            <p className="lede compact">
              There is no kit “theme pack.” Set the same variables you would on a shadcn page. The
              kit reads them through <code>--ak-chart-*</code> fallbacks.
            </p>
            <CodeBlock code={COLORS} lang="css" title="tokens.css" />
            <p className="lede compact">
              Per-series override: pass <code>config</code> on Area, Line, and Bar.{" "}
              <code>config.value.color</code> can be any CSS color, including{" "}
              <code>var(--chart-1)</code>.
            </p>
          </section>

          <section className="docs-section" id="keys">
            <p className="kicker">08</p>
            <h2>Keys stay on the server</h2>
            <p className="lede compact">
              Do not put vendor tokens in the browser bundle. <code>@analytics-kit/next</code>{" "}
              proxies the connector. The client uses <code>createHttpConnector</code>.
            </p>
            <CodeBlock code={HANDLER} lang="ts" title="route.ts" />
            <p className="lede compact">
              Browser: <code>createHttpConnector({`{ endpoint: "/api/analytics" }`})</code>. This
              site does that in <code>app/api/analytics/route.ts</code>. Also{" "}
              <code>examples/next-app-route.ts</code>.
            </p>
          </section>

          <section className="docs-section" id="registry">
            <p className="kicker">09</p>
            <h2>shadcn registry</h2>
            <p className="lede compact">
              Copy a chart or the dashboard into your app. You own the file. Runtime still comes
              from npm so the query model stays canonical.
            </p>
            <button
              type="button"
              className="install"
              onClick={() => void copy(registry, "registry")}
            >
              <span>$</span>
              <code>{registry}</code>
              <em>{copied === "registry" ? "Copied" : "Copy"}</em>
            </button>
            <p className="lede compact">
              Items: every catalog chart plus <code>metric-card</code> and <code>dashboard</code>.
              Also <code>educlopez/analytics-kit/dashboard</code> from the GitHub registry.
            </p>
          </section>

          <section className="docs-section" id="extend">
            <p className="kicker">10</p>
            <h2>Extend</h2>
            <p className="lede compact">
              <code>defineConnector</code> and <code>defineWidget</code> are the extension points.
              Register custom metrics and dimensions, or merge them into <code>MetricCatalog</code>{" "}
              / <code>DimensionCatalog</code>. See <code>examples/custom-connector.ts</code> and{" "}
              <code>examples/custom-widget.tsx</code>.
            </p>
            <p className="lede compact">
              Next: <Link href="/components">every component, every variant, every prop</Link>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
