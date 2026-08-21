# @analytics-kit/react

Provider-agnostic analytics widgets and dashboard primitives for React.

```bash
pnpm add @analytics-kit/react
```

```tsx
import { AnalyticsProvider, Dashboard } from "@analytics-kit/react";
import "@analytics-kit/react/styles.css";

<AnalyticsProvider connector={connector} style="editorial" theme="light">
  <Dashboard />
</AnalyticsProvider>;
```

## Style

`style` swaps the look of every widget without rewriting them:

| `style`     | What it is                                 |
| ----------- | ------------------------------------------ |
| `editorial` | Stone paper, serif headings (the landing)  |
| `ink`       | Cool navy surfaces (original dashboard)    |
| `shadcn`    | Zinc + `chart-1…5`, sits next to shadcn/ui |

Override any token:

```tsx
<AnalyticsProvider style="editorial" tokens={{ accent: "#111111", chart1: "#111111" }}>
```

## Widgets

`visitors`, `pageviews`, `visits`, `events`, `bounce-rate`, `duration`, `views-per-visit`, `realtime`, `timeseries`, `top-pages`, `top-referrers`, `top-countries`, `devices`, `top-browsers`, `top-os`, `top-sources`, `top-campaigns`, `top-events`, `pages-table`, `tracker`.

`catalogDashboard` lays all of them out. `defaultDashboard` is the Vercel-friendly subset.

## shadcn registry

Copy a recipe into your app, keep querying through the npm runtime:

```bash
pnpm dlx shadcn@latest add https://educlopez.github.io/analytics-kit/r/dashboard.json
```

Or from GitHub: `educlopez/analytics-kit/dashboard`.

Part of [Analytics Kit](https://github.com/educlopez/analytics-kit). See the [root README](../../README.md) for connectors and publishing.
