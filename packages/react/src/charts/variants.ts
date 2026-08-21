export const AREA_CHART_VARIANTS = [
  "gradient",
  "linear",
  "natural",
  "step",
  "dots",
  "spark",
] as const;
export type AreaChartVariant = (typeof AREA_CHART_VARIANTS)[number];

export const LINE_CHART_VARIANTS = ["monotone", "linear", "step", "dashed", "dots"] as const;
export type LineChartVariant = (typeof LINE_CHART_VARIANTS)[number];

export const BAR_CHART_VARIANTS = ["vertical", "horizontal", "rounded", "hatched"] as const;
export type BarChartVariant = (typeof BAR_CHART_VARIANTS)[number];

export const PIE_CHART_VARIANTS = ["donut", "pie", "legend"] as const;
export type PieChartVariant = (typeof PIE_CHART_VARIANTS)[number];

export const METRIC_CARD_VARIANTS = ["default", "spark", "compact", "hero"] as const;
export type MetricCardVariant = (typeof METRIC_CARD_VARIANTS)[number];

export const BAR_LIST_VARIANTS = ["bar", "compact", "table"] as const;
export type BarListVariant = (typeof BAR_LIST_VARIANTS)[number];

export type ChartDatum = Record<string, string | number>;
