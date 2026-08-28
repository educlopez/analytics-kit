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

Charts are Tailwind + Recharts. `variant` changes the drawing (gradient vs hatch vs ping). Colors come from `--chart-1`…`--chart-5` on the host page.

`AreaChart` and `LineChart` accept `scale="linear" | "log" | "symlog"`. Use symlog for long-tail series that cross zero.

| Component          | Variants                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AreaChart`        | `gradient`, `linear`, `natural`, `step`, `dots`, `spark`, `dither`, `glow`, `hatched`, `bars`, `solid`, `stacked`, `stream`, `band`, `ridge`, `riso`, `screentone`, `grain` |
| `LineChart`        | `monotone`, `linear`, `step`, `dashed`, `dots`, `dither`, `glow`, `ping`, `rainbow`, `values`, `focus`, `anomaly`, `riso`                                                   |
| `BarChart`         | `vertical`, `horizontal`, `rounded`, `hatched`, `dither`, `glow`, `gradient`, `duotone`, `grouped`, `stacked`, `stacked-100`, `diverging`, `editorial`, `bullet`            |
| `PieChart`         | `donut`, `pie`, `legend`, `dither`, `rounded`, `radial`, `glow`, `half`, `callout`                                                                                          |
| `FunnelChart`      | `tape`, `steps`, `vertical`, `flow`                                                                                                                                         |
| `RadarChart`       | `stroke`, `fill`, `glow`, `dither`, `polygon`                                                                                                                               |
| `ComposedChart`    | `combo`, `highlight`, `overlay`                                                                                                                                             |
| `GaugeChart`       | `arc`, `ring`, `tick`, `score`                                                                                                                                              |
| `ScatterChart`     | `dots`, `bubble`, `glow`, `field`                                                                                                                                           |
| `SankeyChart`      | `flow`, `gradient`, `dither`                                                                                                                                                |
| `CandlestickChart` | `ohlc`, `hollow`, `wick`, `volume`                                                                                                                                          |
| `ChoroplethChart`  | `tiles`, `heat`, `dither`                                                                                                                                                   |
| `LiveLineChart`    | `stream`, `glow`, `dashed`                                                                                                                                                  |
| `RingChart`        | `stack`, `nested`, `track`                                                                                                                                                  |
| `HeatmapChart`     | `calendar`, `matrix`, `dither`, `month`                                                                                                                                     |
| `SunburstChart`    | `nest`, `burst`                                                                                                                                                             |
| `ProfitLossChart`  | `fill`, `stroke`, `bars`                                                                                                                                                    |
| `HorizonChart`     | `bands`, `mirror`                                                                                                                                                           |
| `CohortGrid`       | `triangle`, `counts`                                                                                                                                                        |
| `TreemapChart`     | `heat`, `diverging`                                                                                                                                                         |
| `WaterfallChart`   | `bridge`, `bars`                                                                                                                                                            |
| `ShareBand`        | `segments`, `legend`                                                                                                                                                        |
| `SlopeChart`       | `paired`, `change`                                                                                                                                                          |
| `BumpChart`        | `ribbon`, `line`                                                                                                                                                            |
| `BarList`          | `bar`, `compact`, `table`, `inset`, `dual`                                                                                                                                  |
| `MetricCard`       | `default`, `spark`, `compact`, `hero`, `bleed`, `histogram`                                                                                                                 |

## Widgets

`visitors`, `pageviews`, `visits`, `events`, `bounce-rate`, `duration`, `views-per-visit`, `realtime`, `timeseries`, `top-pages`, `top-referrers`, `top-countries`, `devices`, `top-browsers`, `top-os`, `top-sources`, `top-campaigns`, `top-events`, `pages-table`, `tracker`.

`catalogDashboard` lays all of them out. `defaultDashboard` is the Vercel-friendly subset.

## shadcn registry

```bash
pnpm dlx shadcn@latest add https://analytics-kit-demo.vercel.app/r/area-chart.json
```

Part of [Analytics Kit](https://github.com/educlopez/analytics-kit).
