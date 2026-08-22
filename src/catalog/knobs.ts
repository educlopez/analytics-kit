import type { CatalogItem } from "./items";

export const PREVIEW_METRICS = ["visitors", "pageviews", "bounceRate", "events"] as const;
export type PreviewMetric = (typeof PREVIEW_METRICS)[number];

export interface PreviewKnobs {
  variant: string;
  metric: PreviewMetric;
  height: number;
  columns: number;
  showRange: boolean;
}

export function defaultKnobs(item: CatalogItem): PreviewKnobs {
  return {
    variant: item.defaultVariant || item.variants[0] || "",
    metric: "visitors",
    height: 220,
    columns: 4,
    showRange: true,
  };
}

export function knobsEqual(a: PreviewKnobs, b: PreviewKnobs): boolean {
  return (
    a.variant === b.variant &&
    a.metric === b.metric &&
    a.height === b.height &&
    a.columns === b.columns &&
    a.showRange === b.showRange
  );
}

export function itemControls(slug: string) {
  const chart = ["area-chart", "line-chart", "bar-chart", "pie-chart"].includes(slug);
  return {
    variant: slug !== "dashboard",
    metric: slug !== "dashboard",
    height: chart,
    columns: slug === "dashboard",
    showRange: slug === "dashboard",
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
  labelKey="date"${attr("variant", knobs.variant, item.defaultVariant)}${attr("className", heightClass)}
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
