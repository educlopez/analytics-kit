"use client";

import Link from "next/link";
import * as Badge from "@/components/ui/badge";
import { CodeBlock } from "@/site/CodeBlock";
import { DOCS_TOC } from "@/site/docs-toc";
import { DocsShell } from "@/site/DocsShell";
import { CopyCommand } from "@/site/CopyCommand";
import { ConnectorGrid } from "@/site/ConnectorGrid";
import { PropsTable } from "@/site/PropsTable";
import { useRegistryCommand } from "@/site/useRegistryCommand";

const INSTALL = "pnpm add @wingtics/react @wingtics/core @wingtics/next @wingtics/connector-vercel";

const PROVIDER = `import { AnalyticsProvider, Dashboard } from "@wingtics/react";
import { createVercelConnector } from "@wingtics/connector-vercel";
import "@wingtics/react/styles.css";

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

const CHART = `import { AreaChart } from "@wingtics/react";

<AreaChart
  data={points}
  dataKey="value"
  labelKey="date"
  variant="gradient"
  config={{ value: { label: "Visitors", color: "var(--chart-1)" } }}
/>`;

const HANDLER = `import { createVercelConnector } from "@wingtics/connector-vercel";
import { createRouteHandlers } from "@wingtics/next";

const connector = createVercelConnector({
  token: process.env.VERCEL_TOKEN!,
  projectId: process.env.VERCEL_PROJECT_ID!,
});

export const { GET, POST } = createRouteHandlers({ connector });`;

const COLORS = `:root {
  --chart-1: #0070f3;
  --chart-2: #7d5bed;
  --chart-3: #f5a623;
  --chart-4: #12a594;
  --chart-5: #e5484d;
  --card: #fff;
  --foreground: #000;
  --primary: #0070f3;
  --border: #e6e6e6;
  --muted: #fafafa;
  --muted-foreground: #666;
}`;

export function DocsPage() {
  const registry = useRegistryCommand("dashboard");

  return (
    <DocsShell toc={DOCS_TOC}>
      <header className="pt-10 lg:pt-14">
        <Badge.Root
          variant="lighter"
          className="bg-bg-weak-50 text-text-sub-600 text-label-sm mb-3 h-7 w-fit rounded-[9px] px-2.5 normal-case"
        >
          Documentation
        </Badge.Root>
        <h1 className="text-title-h4 lg:text-title-h3 xl:text-title-h2 text-text-strong-950 max-w-[20ch] !font-[550]">
          Drop the kit in. Swap the vendor later.
        </h1>
        <p className="text-paragraph-md text-text-sub-600 mt-3 max-w-[64ch] [&_a]:text-primary-base [&_a]:hover:underline">
          Connectors, the query model, chart variants, and how colors follow the host site. For
          every drawing and its props, see <Link href="/components">Components</Link>.
        </p>
      </header>

      <div className="grid min-w-0">
        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="install"
        >
          <p className="text-text-soft-400 font-mono text-xs">01</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            Install
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Pick a connector for the analytics tool you already use. The React package is the
            dashboard and the charts.
          </p>
          <CopyCommand command={INSTALL} id="install" />
          {/* Said once, right where someone is about to install: anyone holding
              the old scope needs to know it stops receiving versions. */}
          <p className="text-paragraph-sm text-text-soft-400 max-w-[70ch] [&_code]:font-mono [&_code]:text-[0.86em]">
            Wingtics was called Analytics Kit until September 2026, and the packages moved from{" "}
            <code>@analytics-kit/*</code> to <code>@wingtics/*</code>. The old scope still installs,
            but new versions only land under the new one.
          </p>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Also: <code>@wingtics/connector-plausible</code>, <code>connector-ga4</code>,{" "}
            <code>connector-umami</code>, <code>connector-posthog</code>, and{" "}
            <code>connector-mock</code> for tests. Import <code>@wingtics/react/styles.css</code>{" "}
            once.
          </p>
        </section>

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="provider"
        >
          <p className="text-text-soft-400 font-mono text-xs">02</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            AnalyticsProvider
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
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

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="connectors"
        >
          <p className="text-text-soft-400 font-mono text-xs">03</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            Connectors
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Same <code>query()</code> shape. Swap the constructor when you leave a vendor.
          </p>
          <ConnectorGrid />
        </section>

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="query"
        >
          <p className="text-text-soft-400 font-mono text-xs">04</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            Query model
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Widgets never send vendor field names. They send a canonical <code>AnalyticsQuery</code>
            . The connector maps it.
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
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Result: <code>totals</code>, <code>series</code>, <code>breakdown</code>, optional{" "}
            <code>previous.totals</code>. Hooks: <code>useQuery</code>, <code>useRealtime</code>,{" "}
            <code>useCapabilities</code>. If a connector cannot answer a metric, the widget renders
            an unsupported state instead of crashing.
          </p>
        </section>

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="charts"
        >
          <p className="text-text-soft-400 font-mono text-xs">05</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            Charts
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Tailwind + Recharts. Eighteen types, funnel through sunburst, and the drawing is a{" "}
            <code>variant</code> — gradient, dither, hatched, glow — not a palette. Colors come from
            CSS variables on the host page.
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
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Shared chart props: <code>data</code>, <code>dataKey</code>, <code>labelKey</code>,{" "}
            <code>variant</code>, <code>config</code>, <code>className</code>. Full tables live on{" "}
            <Link href="/components">the components page</Link>.
          </p>
        </section>

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="widgets"
        >
          <p className="text-text-soft-400 font-mono text-xs">06</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            Widgets &amp; dashboard
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            <code>Dashboard</code> lays out registered widgets. <code>defaultDashboard</code> is the
            Vercel-friendly subset. <code>catalogDashboard</code> is every built-in widget — use it
            with a full-capability connector (mock profile <code>full</code>).
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
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Built-in ids: visitors, pageviews, visits, events, bounce-rate, duration,
            views-per-visit, realtime, timeseries, top-pages, top-referrers, top-countries, devices,
            top-browsers, top-os, top-sources, top-campaigns, top-events, pages-table, tracker.
          </p>
        </section>

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="colors"
        >
          <p className="text-text-soft-400 font-mono text-xs">07</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            Colors follow the host
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            There is no kit “theme pack.” Set the same variables you would on a shadcn page. The kit
            reads them through <code>--ak-chart-*</code> fallbacks.
          </p>
          <CodeBlock code={COLORS} lang="css" title="tokens.css" />
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Per-series override: pass <code>config</code> on Area, Line, and Bar.{" "}
            <code>config.value.color</code> can be any CSS color, including{" "}
            <code>var(--chart-1)</code>.
          </p>
        </section>

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="keys"
        >
          <p className="text-text-soft-400 font-mono text-xs">08</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            Keys stay on the server
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Do not put vendor tokens in the browser bundle. <code>@wingtics/next</code> proxies the
            connector. The client uses <code>createHttpConnector</code>.
          </p>
          <CodeBlock code={HANDLER} lang="ts" title="route.ts" />
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Browser: <code>createHttpConnector({`{ endpoint: "/api/analytics" }`})</code>. This site
            does that in <code>app/api/analytics/route.ts</code>. Also{" "}
            <code>examples/next-app-route.ts</code>.
          </p>
        </section>

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="registry"
        >
          <p className="text-text-soft-400 font-mono text-xs">09</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            shadcn registry
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Copy a chart or the dashboard into your app. You own the file. Runtime still comes from
            npm so the query model stays canonical.
          </p>
          <CopyCommand command={registry} id="registry" />
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Items: every catalog chart plus <code>metric-card</code> and <code>dashboard</code>.
            Also <code>educlopez/wingtics/dashboard</code> from the GitHub registry.
          </p>
        </section>

        <section
          className="border-stroke-soft-200 grid scroll-mt-24 gap-4 border-t py-10 first:border-t-0 first:pt-4 lg:scroll-mt-28"
          id="extend"
        >
          <p className="text-text-soft-400 font-mono text-xs">10</p>
          <h2 className="text-title-h5 lg:text-title-h4 text-text-strong-950 !font-[550]">
            Extend
          </h2>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            <code>defineConnector</code> and <code>defineWidget</code> are the extension points.
            Register custom metrics and dimensions, or merge them into <code>MetricCatalog</code> /{" "}
            <code>DimensionCatalog</code>. See <code>examples/custom-connector.ts</code> and{" "}
            <code>examples/custom-widget.tsx</code>.
          </p>
          <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 max-w-[70ch] [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.86em]">
            Next: <Link href="/components">every component, every variant, every prop</Link>.
          </p>
        </section>
      </div>
    </DocsShell>
  );
}
