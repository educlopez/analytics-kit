# Analytics Kit

[![CI](https://github.com/educlopez/analytics-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/educlopez/analytics-kit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@analytics-kit/core.svg)](https://www.npmjs.com/package/@analytics-kit/core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Provider-agnostic analytics for websites. You give users a **connector** for the analytics tool they already use, and **components** that render the data. Switching from Plausible to GA4 (or Vercel, Umami, PostHog) is a constructor change — the dashboard stays the same.

```bash
pnpm add @analytics-kit/react @analytics-kit/core @analytics-kit/connector-plausible
```

```tsx
import { AnalyticsProvider, Dashboard } from "@analytics-kit/react";
import { createPlausibleConnector } from "@analytics-kit/connector-plausible";
import "@analytics-kit/react/styles.css";

const connector = createPlausibleConnector({
  apiKey: process.env.PLAUSIBLE_API_KEY!,
  siteId: "example.com",
});

export function Stats() {
  return (
    <AnalyticsProvider connector={connector}>
      <Dashboard />
    </AnalyticsProvider>
  );
}
```

This repo is a TypeScript monorepo designed so **new providers** and **new widgets** plug in without changing the query model.

## Packages

| Package                              | What it is                                                              |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `@analytics-kit/core`                | Canonical query/result types, connector contract, capabilities, caching |
| `@analytics-kit/react`               | Provider, hooks, chart primitives, widget registry, dashboard           |
| `@analytics-kit/next`                | Fetch / Next.js App Router handlers that keep API keys on the server    |
| `@analytics-kit/connector-plausible` | Plausible Stats API v2                                                  |
| `@analytics-kit/connector-vercel`    | Vercel Web Analytics API                                                |
| `@analytics-kit/connector-ga4`       | Google Analytics 4 Data API                                             |
| `@analytics-kit/connector-umami`     | Umami stats / metrics API                                               |
| `@analytics-kit/connector-posthog`   | PostHog HogQL                                                           |
| `@analytics-kit/connector-mock`      | Deterministic fake data + per-provider capability profiles              |

## How it scales

```
UI widgets  ──►  canonical AnalyticsQuery  ──►  connector.query()
     ▲                                              │
     │         capabilities decide what is shown     ▼
widget registry                               vendor API mapping
```

- **Providers** implement `defineConnector({ id, capabilities, query })`.
- **Widgets** implement `defineWidget({ id, required, component })`.
- A widget that needs `bounceRate` on a Vercel connector renders an “unsupported” state instead of crashing.
- Custom metrics/dimensions can be added at runtime with `registerMetric` / `registerDimension`, and via TypeScript declaration merging of `MetricCatalog` / `DimensionCatalog`.

### Add a provider

See [`examples/custom-connector.ts`](examples/custom-connector.ts). Minimum surface:

```ts
import { defineConnector } from "@analytics-kit/core";

export function createAcmeConnector(options) {
  return defineConnector({
    id: "acme",
    name: "Acme",
    capabilities: {
      metrics: { visitors: true, pageviews: true },
      dimensions: { path: true },
      granularity: ["day"],
      filters: false,
      realtime: false,
      previousPeriod: false,
    },
    async query(query) {
      // query.range.from/to are absolute Dates
      // query.metrics / dimensions are canonical IDs
      return { totals: { visitors: 0 }, series: [], breakdown: [] };
    },
  });
}
```

### Add a widget

See [`examples/custom-widget.tsx`](examples/custom-widget.tsx). Then reference it by id:

```tsx
<Dashboard widgets={[{ widget: "signups" }, { widget: "top-pages", span: 2 }]} />
```

Built-in widgets: `visitors`, `pageviews`, `visits`, `events`, `bounce-rate`, `duration`, `views-per-visit`, `realtime`, `timeseries`, `top-pages`, `pages-table`, `top-referrers`, `top-countries`, `devices`, `top-browsers`, `top-os`, `top-sources`, `top-campaigns`, `top-events`, `tracker`.

Primitives you can reuse in custom widgets: `WidgetFrame`, `Timeseries` / `AreaChart`, `RankedList` / `BarList`, `CategoryBars` / `BarChart`, `Donut`, `Sparkline`, `BreakdownTable`, `Tracker`, `MetricValue`.

Layouts: `defaultDashboard` (Vercel-friendly) and `catalogDashboard` (every widget).

Charts are Tailwind + Recharts, same stack as [shadcn charts](https://ui.shadcn.com/charts), [ReUI](https://reui.io/blocks/application/chart), [bklit](https://bklit.com/charts/area-chart), and [Intent UI](https://intentui.com/docs/components/visualizations/line-chart). Each chart has a `variant` for the drawing — not a color theme. Colors inherit `--chart-1`…`--chart-5`, `--card`, `--foreground` from the host site.

```tsx
<AreaChart data={points} variant="gradient" />
<LineChart data={points} variant="dashed" />
<BarChart data={rows} variant="horizontal" />
<PieChart data={rows} variant="donut" />
<MetricCard metric="visitors" variant="hero" />
```

| Component    | Variants                                                 |
| ------------ | -------------------------------------------------------- |
| `AreaChart`  | `gradient`, `linear`, `natural`, `step`, `dots`, `spark` |
| `LineChart`  | `monotone`, `linear`, `step`, `dashed`, `dots`           |
| `BarChart`   | `vertical`, `horizontal`, `rounded`, `hatched`           |
| `PieChart`   | `donut`, `pie`, `legend`                                 |
| `MetricCard` | `default`, `spark`, `compact`, `hero`                    |
| `RankedList` | `bar`, `compact`, `table`                                |

## shadcn registry

Widgets also ship as a [shadcn registry](https://ui.shadcn.com/docs/registry). Install a recipe; keep `@analytics-kit/react` for data:

```bash
pnpm dlx shadcn@latest add https://educlopez.github.io/analytics-kit/r/dashboard.json
```

GitHub: `pnpm dlx shadcn@latest add educlopez/analytics-kit/metric-card`

Items: `chart`, `area-chart`, `line-chart`, `bar-chart`, `pie-chart`, `metric-card`, `dashboard`.

Namespace:

```json
{
  "registries": {
    "@analytics-kit": "https://educlopez.github.io/analytics-kit/r/{name}.json"
  }
}
```

```bash
pnpm dlx shadcn@latest add @analytics-kit/dashboard
```

## Server vs browser

Never put vendor API keys in the client. Use the Next handler (or any runtime that accepts a Fetch `Request`):

```ts
// app/api/analytics/route.ts
import { createPlausibleConnector } from "@analytics-kit/connector-plausible";
import { createRouteHandlers } from "@analytics-kit/next";

export const { GET, POST } = createRouteHandlers({
  connector: createPlausibleConnector({
    apiKey: process.env.PLAUSIBLE_API_KEY!,
    siteId: process.env.PLAUSIBLE_SITE_ID!,
  }),
});
```

```tsx
// client
import { createHttpConnector } from "@analytics-kit/core";

const connector = createHttpConnector({ endpoint: "/api/analytics" });
```

Full wiring: [`examples/next-app-route.ts`](examples/next-app-route.ts).

## Canonical model

Metrics: `visitors`, `pageviews`, `visits`, `bounceRate`, `avgDuration`, `viewsPerVisit`, `events`.

Dimensions: `path`, `referrer`, `country`, `device`, `browser`, `os`, `source`, `medium`, `campaign`, `eventName`, `host`.

Ranges: `today`, `24h`, `7d`, `28d`, `30d`, `90d`, `12mo`, `month`, `year`, or `{ from, to }`.

Connectors map those onto vendor names (GA4 `activeUsers`, Plausible `bounce_rate`, Vercel `requestPath`, …). Numbers are similar, not identical across vendors — that is documented per connector via `capabilities`.

## Demo

Live site:

- Landing — https://educlopez.github.io/analytics-kit/
- Docs — https://educlopez.github.io/analytics-kit/docs
- Components (every variant + config) — https://educlopez.github.io/analytics-kit/components

The demo (`apps/demo`) is the Analytics Kit product page. The landing shows a short chart teaser; Docs covers install, the provider, connectors, and the query model; Components lists every chart variant and its props. Widgets use `@analytics-kit/connector-vercel` when `VITE_VERCEL_TOKEN` and `VITE_VERCEL_PROJECT_ID` are set (GitHub Actions secrets for Pages); otherwise they fall back to a Vercel-profile mock shaped like [smoothui.dev](https://smoothui.dev) traffic.

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

## Development

pnpm workspace + TypeScript + Vitest + tsup (ESM and CJS). Node 20+.

```bash
pnpm check   # lint, format, test, typecheck, build, publint
```

CI runs that same gate on every pull request. Releases use [Changesets](https://github.com/changesets/changesets): merge to `main`, merge the Version Packages PR, and GitHub Actions publishes `@analytics-kit/*` to npm.

See [CONTRIBUTING.md](CONTRIBUTING.md) for first-time npm org setup (`NPM_TOKEN`) and how to add providers or widgets.
