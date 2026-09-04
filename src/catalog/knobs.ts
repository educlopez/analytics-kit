import type { CSSProperties } from "react";
import type { CatalogItem } from "./items";

export const PREVIEW_METRICS = ["visitors", "pageviews", "bounceRate", "events"] as const;
export type PreviewMetric = (typeof PREVIEW_METRICS)[number];

export const PREVIEW_GAPS = ["off", "bridge", "break"] as const;
export type PreviewGaps = (typeof PREVIEW_GAPS)[number];

export const PREVIEW_SCALES = ["linear", "log", "symlog"] as const;
export type PreviewScale = (typeof PREVIEW_SCALES)[number];

/**
 * The colours every component reads, as the tokens they actually read them
 * from. Global on purpose: they are not props of any one chart, so they live in
 * their own panel that survives moving between components.
 *
 * The defaults are the resolved light-theme hexes of the site's own ramp, so an
 * untouched picker shows the colour that is on screen. Only a value that
 * differs from its default is emitted — otherwise the override would pin the
 * dark theme to the light theme's accent.
 */
export const PREVIEW_THEME_DEFAULTS = {
  accent: "#335cff",
  chart1: "#335cff",
  chart2: "#7d52f4",
  chart3: "#fa7319",
  chart4: "#22d3bb",
  chart5: "#fb4ba3",
} as const;

export type PreviewTheme = { -readonly [K in keyof typeof PREVIEW_THEME_DEFAULTS]: string };

export const PREVIEW_THEME_KEYS = Object.keys(PREVIEW_THEME_DEFAULTS) as (keyof PreviewTheme)[];

/**
 * Which chart slots the component on screen actually paints with.
 *
 * Showing all five pickers when a single-series line only reads the first one
 * leaves four controls that do nothing, and no way to tell which is which. The
 * lists below were read off the components and off what the preview passes
 * them; `src/catalog/slots.test.ts` scans every rendered preview for the
 * palette colours and fails if a painted slot is missing from here.
 */
const CATEGORICAL: Record<string, number> = {
  // One colour per category or lane, cycling the whole palette. For these the
  // full set is the honest answer: the consumer decides how many categories
  // there are, so every slot can land on screen.
  "pie-chart": 5,
  "ring-chart": 5,
  "sunburst-chart": 5,
  "funnel-chart": 5,
  "sankey-chart": 5,
  "treemap-chart": 5,
  "share-band": 5,
  "bump-chart": 5,
  "strip-chart": 5,
  // Every registered widget at once, so everything is on screen.
  dashboard: 5,
  "gauge-chart": 4,
  // One lane per metric, and the preview passes four.
  "horizon-chart": 4,
  "composed-chart": 3,
  "waterfall-chart": 3,
  "timeline-chart": 3,
  "slope-chart": 3,
  // Banding, not categories: the mosaic alternates two.
  "marimekko-chart": 2,
};

/** Series charts, where the count follows the active variant. */
function seriesSlots(slug: string, variant: string): number[] {
  if (slug === "area-chart") {
    if (variant === "ridge") return [1, 2, 3, 4];
    if (variant === "stacked" || variant === "stream") return [1, 2];
    return [1];
  }
  if (slug === "line-chart") {
    if (variant === "focus") return [1, 2, 3, 4];
    if (variant === "dual") return [1, 2];
    if (variant === "rainbow") return [1, 2, 3, 4, 5];
    // The ring on a flagged point is chart-3, and nothing in between is used.
    if (variant === "anomaly") return [1, 3];
    return [1];
  }
  if (slug === "bar-chart") {
    if (variant === "grouped" || variant === "stacked" || variant === "stacked-100") return [1, 2];
    return [1];
  }
  return [];
}

export function chartSlots(slug: string, variant: string): number[] {
  const series = seriesSlots(slug, variant);
  if (series.length) return series;
  const count = CATEGORICAL[slug];
  return count ? Array.from({ length: count }, (_, i) => i + 1) : [1];
}

export function defaultTheme(): PreviewTheme {
  return { ...PREVIEW_THEME_DEFAULTS };
}

/** Dirty only counts what is on screen — a hidden picker cannot be reset. */
export function themeDirty(theme: PreviewTheme, slots: number[]): boolean {
  if (theme.accent !== PREVIEW_THEME_DEFAULTS.accent) return true;
  return slots.some((index) => {
    const key = `chart${index}` as keyof PreviewTheme;
    return theme[key] !== PREVIEW_THEME_DEFAULTS[key];
  });
}

/**
 * Custom properties for the preview frame.
 *
 * `--chart-N` rather than `--ak-chart-N`: the widget package declares
 * `--ak-chart-1: var(--chart-1, …)` on its own `.ak-root`, so an override from
 * outside that element loses to it — but the `var()` it reads through does not.
 * The accent goes through `--ak-knob-accent`, which site.css reads for the same
 * reason.
 */
export function themeVars(theme: PreviewTheme, slots: number[]): CSSProperties {
  const vars: Record<string, string> = {};
  if (theme.accent !== PREVIEW_THEME_DEFAULTS.accent) vars["--ak-knob-accent"] = theme.accent;
  for (const index of slots) {
    const key = `chart${index}` as keyof PreviewTheme;
    if (theme[key] !== PREVIEW_THEME_DEFAULTS[key]) vars[`--chart-${index}`] = theme[key];
  }
  return vars as CSSProperties;
}

/** The same overrides as a copyable stylesheet, for the Code tab. */
export function themeCss(theme: PreviewTheme, slots: number[]): string {
  const lines: string[] = [];
  if (theme.accent !== PREVIEW_THEME_DEFAULTS.accent) lines.push(`  --ak-accent: ${theme.accent};`);
  for (const index of slots) {
    const key = `chart${index}` as keyof PreviewTheme;
    if (theme[key] !== PREVIEW_THEME_DEFAULTS[key])
      lines.push(`  --chart-${index}: ${theme[key]};`);
  }
  if (!lines.length) return "";
  return `/* Component colours. On :root for the whole app, or on any wrapper to scope them. */
:root {
${lines.join("\n")}
}`;
}

export interface PreviewKnobs {
  variant: string;
  metric: PreviewMetric;
  height: number;
  columns: number;
  showRange: boolean;
  emphasizeLast: boolean;
  compare: boolean;
  scale: PreviewScale;
  gaps: PreviewGaps;
  annotations: boolean;
  brush: boolean;
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
    scale: "linear",
    gaps: "off",
    annotations: false,
    brush: false,
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
    a.scale === b.scale &&
    a.gaps === b.gaps &&
    a.annotations === b.annotations &&
    a.brush === b.brush
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
    "waterfall-chart",
    "slope-chart",
    "quota-bar",
    "bump-chart",
    "marimekko-chart",
    "spark-table",
    "timeline-chart",
    "strip-chart",
    "radial-time-chart",
  ];
  return {
    variant: slug !== "dashboard",
    metric: !noMetric.includes(slug),
    height: sized.includes(slug),
    columns: slug === "dashboard",
    showRange: slug === "dashboard",
    // The cross-cutting treatments only apply to the time-series charts.
    treatments: slug === "area-chart" || slug === "line-chart",
    scale: slug === "area-chart" || slug === "line-chart",
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

export function buildUsage(item: CatalogItem, knobs: PreviewKnobs, theme?: PreviewTheme): string {
  const jsx = buildJsx(item, knobs);
  const css = theme ? themeCss(theme, chartSlots(item.slug, knobs.variant)) : "";
  return css ? `${jsx}\n\n${css}` : jsx;
}

function buildJsx(item: CatalogItem, knobs: PreviewKnobs): string {
  const heightClass =
    knobs.height !== 220 || knobs.variant === "spark" ? `h-[${knobs.height}px]` : undefined;

  if (item.slug === "area-chart" || item.slug === "line-chart") {
    const name = item.component;
    return `import { ${name} } from "@wingtics/react";

const points = [
  { date: "2026-08-01", value: 120 },
  { date: "2026-08-02", value: 164 },
];

<${name}
  data={points}
  dataKey="value"
  labelKey="date"${attr("variant", knobs.variant, item.defaultVariant)}${attr("scale", knobs.scale, "linear")}${attr("emphasizeLast", knobs.emphasizeLast, false)}${knobs.compare ? "\n  previous={lastPeriod}" : ""}${attr("gaps", knobs.gaps === "off" ? undefined : knobs.gaps)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "bar-chart" || item.slug === "pie-chart") {
    const name = item.component;
    const labelDefault = item.slug === "bar-chart" ? "rounded" : "donut";
    return `import { ${name} } from "@wingtics/react";

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
    return `import { FunnelChart } from "@wingtics/react";

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
    return `import { RadarChart } from "@wingtics/react";

<RadarChart
  data={rows}
  dataKey="value"
  labelKey="label"${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "composed-chart") {
    return `import { ComposedChart } from "@wingtics/react";

<ComposedChart
  data={points}
  barKey="visitors"
  lineKey="pageviews"${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "scatter-chart") {
    return `import { ScatterChart } from "@wingtics/react";

<ScatterChart
  data={points}
  xKey="x"
  yKey="y"${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "sankey-chart") {
    return `import { SankeyChart } from "@wingtics/react";

<SankeyChart
  nodes={nodes}
  links={links}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "candlestick-chart") {
    return `import { CandlestickChart } from "@wingtics/react";

const candles = [
  { date: "2026-08-01", open: 120, high: 138, low: 114, close: 132, volume: 18400 },
  { date: "2026-08-02", open: 132, high: 136, low: 121, close: 125, volume: 12300 },
];

<CandlestickChart
  data={candles}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "choropleth-chart") {
    return `import { ChoroplethChart } from "@wingtics/react";

<ChoroplethChart
  data={regions}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "live-line-chart") {
    return `import { LiveLineChart } from "@wingtics/react";

<LiveLineChart
  data={points}${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "ring-chart") {
    return `import { RingChart } from "@wingtics/react";

<RingChart
  data={rows}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "heatmap-chart") {
    return `import { HeatmapChart } from "@wingtics/react";

<HeatmapChart
  data={points}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "sunburst-chart") {
    return `import { SunburstChart } from "@wingtics/react";

<SunburstChart
  data={tree}${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "profit-loss-chart") {
    return `import { ProfitLossChart } from "@wingtics/react";

<ProfitLossChart
  data={deltas}${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
/>`;
  }

  if (item.slug === "gauge-chart") {
    return `import { GaugeChart } from "@wingtics/react";

<GaugeChart
  value={42}
  max={100}
  label="${knobs.metric}"${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "metric-card") {
    return `import { MetricCard } from "@wingtics/react";

<MetricCard
  metric="${knobs.metric}"${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  if (item.slug === "ranked-list") {
    return `import { RankedList } from "@wingtics/react";

<RankedList
  rows={rows}
  metric="${knobs.metric}"${attr("variant", knobs.variant, item.defaultVariant)}
/>`;
  }

  return `import { Dashboard, defaultDashboard } from "@wingtics/react";

<Dashboard
  widgets={defaultDashboard}${attr("columns", knobs.columns, 4)}${attr("showRange", knobs.showRange, true)}
/>`;
}
