export const AREA_CHART_VARIANTS = [
  "gradient",
  "linear",
  "natural",
  "step",
  "dots",
  "spark",
  "dither",
  "glow",
  "hatched",
  "bars",
  "solid",
] as const;
export type AreaChartVariant = (typeof AREA_CHART_VARIANTS)[number];

export const LINE_CHART_VARIANTS = [
  "monotone",
  "linear",
  "step",
  "dashed",
  "dots",
  "dither",
  "glow",
  "ping",
  "rainbow",
  "values",
] as const;
export type LineChartVariant = (typeof LINE_CHART_VARIANTS)[number];

export const BAR_CHART_VARIANTS = [
  "vertical",
  "horizontal",
  "rounded",
  "hatched",
  "dither",
  "glow",
  "gradient",
  "duotone",
] as const;
export type BarChartVariant = (typeof BAR_CHART_VARIANTS)[number];

export const PIE_CHART_VARIANTS = [
  "donut",
  "pie",
  "legend",
  "dither",
  "rounded",
  "radial",
  "glow",
] as const;
export type PieChartVariant = (typeof PIE_CHART_VARIANTS)[number];

export const METRIC_CARD_VARIANTS = ["default", "spark", "compact", "hero"] as const;
export type MetricCardVariant = (typeof METRIC_CARD_VARIANTS)[number];

export const BAR_LIST_VARIANTS = ["bar", "compact", "table"] as const;
export type BarListVariant = (typeof BAR_LIST_VARIANTS)[number];

export type ChartDatum = Record<string, string | number>;
