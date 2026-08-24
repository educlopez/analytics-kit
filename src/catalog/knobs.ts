import type { CatalogItem } from "./items";

export const PREVIEW_METRICS = ["visitors", "pageviews", "bounceRate", "events"] as const;
export type PreviewMetric = (typeof PREVIEW_METRICS)[number];

export const PREVIEW_GAPS = ["off", "bridge", "break"] as const;
export type PreviewGaps = (typeof PREVIEW_GAPS)[number];

export interface PreviewKnobs {
  variant: string;
  metric: PreviewMetric;
  height: number;
  columns: number;
  showRange: boolean;
  emphasizeLast: boolean;
  compare: boolean;
  gaps: PreviewGaps;
}

export function defaultKnobs(item: CatalogItem): PreviewKnobs {
  return {
    variant: item.defaultVariant || item.variants[0] || "",
    metric: item.slug === "gauge-chart" ? "bounceRate" : "visitors",
    height: 220,
    columns: 4,
    showRange: true,
    emphasizeLast: false,
    compare: false,
    gaps: "off",
  };
}

export function knobsEqual(a: PreviewKnobs, b: PreviewKnobs): boolean {
  return (
    a.variant === b.variant &&
    a.metric === b.metric &&
    a.height === b.height &&
    a.columns === b.columns &&
    a.showRange === b.showRange &&
    a.emphasizeLast === b.emphasizeLast &&
    a.compare === b.compare &&
    a.gaps === b.gaps
  );
}

export function itemControls(slug: string) {
  const sized = [
    "area-chart",
    "line-chart",
    "bar-chart",
    "pie-chart",
    "radar-chart",
    "composed-chart",
    "scatter-chart",
    "sankey-chart",
    "live-line-chart",
    "profit-loss-chart",
    "candlestick-chart",
  ];
  const noMetric = [
    "dashboard",
    "funnel-chart",
    "composed-chart",
    "sankey-chart",
    "candlestick-chart",
    "sunburst-chart",
    "profit-loss-chart",
    // Horizon lanes are fixed metrics, so a single-metric switch means nothing.
    "horizon-chart",
    // Cohorts carry their own retained counts; a metric switch would not reach them.
    "cohort-grid",
  ];
  return {
    variant: slug !== "dashboard",
    metric: !noMetric.includes(slug),
    height: sized.includes(slug),
    columns: slug === "dashboard",
    showRange: slug === "dashboard",
    // The cross-cutting treatments only apply to the time-series charts.
    treatments: slug === "area-chart" || slug === "line-chart",
  };
}

function attr(
  name: string,
  value: string | number | boolean | undefined,
  fallback?: string | number | boolean,
) {
  if (value === undefined || value === fallback) return "";
  if (typeof value === "boolean") return value ? `\n  ${name}` : `\n  ${name}={false}`;
  if (typeof value === "number") return `\n  ${name}={${value}}`;
  return `\n  ${name}="${value}"`;
}

export function buildUsage(item: CatalogItem, knobs: PreviewKnobs): string {
  const heightClass =
    knobs.height !== 220 || knobs.variant === "spark" ? `h-[${knobs.height}px]` : undefined;

  if (item.slug === "area-chart" || item.slug === "line-chart") {
    const name = item.component;
    return `import { ${name} } from "@analytics-kit/react";

const points = [
  { date: "2026-08-01", value: 120 },
  { date: "2026-08-02", value: 164 },
];

<${name}
  data={points}
  dataKey="value"
  labelKey="date"${attr("variant", knobs.variant, item.defaultVariant)}${attr("emphasizeLast", knobs.emphasizeLast, false)}${knobs.compare ? "\n  previous={lastPeriod}" : ""}${attr("gaps", knobs.gaps === "off" ? undefined : knobs.gaps)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "bar-chart" || item.slug === "pie-chart") {
    const name = item.component;
    const labelDefault = item.slug === "bar-chart" ? "rounded" : "donut";
    return `import { ${name} } from "@analytics-kit/react";

const rows = [
  { label: "Chrome", value: 420 },
  { label: "Safari", value: 210 },
];

<${name}
  data={rows}
  dataKey="value"
  labelKey="label"${attr("variant", knobs.variant, item.defaultVariant || labelDefault)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "funnel-chart") {
    return `import { FunnelChart } from "@analytics-kit/react";

const stages = [
  { label: "Visitors", value: 1240 },
  { label: "Signup", value: 640 },
  { label: "Paid", value: 210 },
];

<FunnelChart
  data={stages}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "radar-chart") {
    return `import { RadarChart } from "@analytics-kit/react";

<RadarChart
  data={rows}
  dataKey="value"
  labelKey="label"${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "composed-chart") {
    return `import { ComposedChart } from "@analytics-kit/react";

<ComposedChart
  data={points}
  barKey="visitors"
  lineKey="pageviews"${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "scatter-chart") {
    return `import { ScatterChart } from "@analytics-kit/react";

<ScatterChart
  data={points}
  xKey="x"
  yKey="y"${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "sankey-chart") {
    return `import { SankeyChart } from "@analytics-kit/react";

<SankeyChart
  nodes={nodes}
  links={links}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "candlestick-chart") {
    return `import { CandlestickChart } from "@analytics-kit/react";

<CandlestickChart
  data={candles}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "choropleth-chart") {
    return `import { ChoroplethChart } from "@analytics-kit/react";

<ChoroplethChart
  data={regions}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "live-line-chart") {
    return `import { LiveLineChart } from "@analytics-kit/react";

<LiveLineChart
  data={points}${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "ring-chart") {
    return `import { RingChart } from "@analytics-kit/react";

<RingChart
  data={rows}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "heatmap-chart") {
    return `import { HeatmapChart } from "@analytics-kit/react";

<HeatmapChart
  data={points}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "sunburst-chart") {
    return `import { SunburstChart } from "@analytics-kit/react";

<SunburstChart
  data={tree}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "profit-loss-chart") {
    return `import { ProfitLossChart } from "@analytics-kit/react";

<ProfitLossChart
  data={deltas}${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "gauge-chart") {
    return `import { GaugeChart } from "@analytics-kit/react";

<GaugeChart
  value={42}
  max={100}
  label="${knobs.metric}"${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "metric-card") {
    return `import { MetricCard } from "@analytics-kit/react";

<MetricCard
  metric="${knobs.metric}"${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "ranked-list") {
    return `import { RankedList } from "@analytics-kit/react";

<RankedList
  rows={rows}
  metric="${knobs.metric}"${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  return `import { Dashboard, defaultDashboard } from "@analytics-kit/react";

<Dashboard
  widgets={defaultDashboard}${attr("columns", knobs.columns, 4)}${attr("showRange", knobs.showRange, true)}
/>`;
}
