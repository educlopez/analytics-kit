# @analytics-kit/react

Provider-agnostic analytics widgets and dashboard primitives for React.

```bash
pnpm add @analytics-kit/react
```

```tsx
import { AnalyticsProvider, Dashboard, AreaChart } from "@analytics-kit/react";
import "@analytics-kit/react/styles.css";

<AnalyticsProvider connector={connector} theme="light">
  <Dashboard />
  <AreaChart data={points} variant="gradient" />
</AnalyticsProvider>;
```

Charts are Tailwind + Recharts. `variant` changes the drawing (gradient vs step vs dots). Colors come from `--chart-1`…`--chart-5` on the host page.

| Component    | Variants                                                 |
| ------------ | -------------------------------------------------------- |
| `AreaChart`  | `gradient`, `linear`, `natural`, `step`, `dots`, `spark` |
| `LineChart`  | `monotone`, `linear`, `step`, `dashed`, `dots`           |
| `BarChart`   | `vertical`, `horizontal`, `rounded`, `hatched`           |
| `PieChart`   | `donut`, `pie`, `legend`                                 |
| `MetricCard` | `default`, `spark`, `compact`, `hero`                    |

## Widgets

`visitors`, `pageviews`, `visits`, `events`, `bounce-rate`, `duration`, `views-per-visit`, `realtime`, `timeseries`, `top-pages`, `top-referrers`, `top-countries`, `devices`, `top-browsers`, `top-os`, `top-sources`, `top-campaigns`, `top-events`, `pages-table`, `tracker`.

`catalogDashboard` lays all of them out. `defaultDashboard` is the Vercel-friendly subset.

## shadcn registry

```bash
pnpm dlx shadcn@latest add https://analytics-kit-demo.vercel.app/r/area-chart.json
```

Part of [Analytics Kit](https://github.com/educlopez/analytics-kit).
