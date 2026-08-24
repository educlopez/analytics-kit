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
  "stacked",
] as const;
export type AreaChartVariant = (typeof AREA_CHART_VARIANTS)[number];

/** Variants that draw one band per key in `dataKeys` instead of a single series. */
export const AREA_MULTI_VARIANTS: readonly AreaChartVariant[] = ["stacked"];

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
  "grouped",
  "stacked",
  "stacked-100",
] as const;
export type BarChartVariant = (typeof BAR_CHART_VARIANTS)[number];

/** Variants that draw one bar per key in `dataKeys` instead of a single series. */
export const BAR_MULTI_VARIANTS: readonly BarChartVariant[] = ["grouped", "stacked", "stacked-100"];

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

export const FUNNEL_CHART_VARIANTS = ["tape", "steps", "vertical"] as const;
export type FunnelChartVariant = (typeof FUNNEL_CHART_VARIANTS)[number];

export const RADAR_CHART_VARIANTS = ["stroke", "fill", "glow", "dither"] as const;
export type RadarChartVariant = (typeof RADAR_CHART_VARIANTS)[number];

export const GAUGE_CHART_VARIANTS = ["arc", "ring", "tick"] as const;
export type GaugeChartVariant = (typeof GAUGE_CHART_VARIANTS)[number];

export const COMPOSED_CHART_VARIANTS = ["combo", "highlight", "overlay"] as const;
export type ComposedChartVariant = (typeof COMPOSED_CHART_VARIANTS)[number];

export const SCATTER_CHART_VARIANTS = ["dots", "bubble", "glow"] as const;
export type ScatterChartVariant = (typeof SCATTER_CHART_VARIANTS)[number];

export const SANKEY_CHART_VARIANTS = ["flow", "gradient", "dither"] as const;
export type SankeyChartVariant = (typeof SANKEY_CHART_VARIANTS)[number];

export const CANDLESTICK_CHART_VARIANTS = ["ohlc", "hollow", "wick"] as const;
export type CandlestickChartVariant = (typeof CANDLESTICK_CHART_VARIANTS)[number];

export const CHOROPLETH_CHART_VARIANTS = ["tiles", "heat", "dither"] as const;
export type ChoroplethChartVariant = (typeof CHOROPLETH_CHART_VARIANTS)[number];

export const LIVE_LINE_CHART_VARIANTS = ["stream", "glow", "dashed"] as const;
export type LiveLineChartVariant = (typeof LIVE_LINE_CHART_VARIANTS)[number];

export const RING_CHART_VARIANTS = ["stack", "nested", "track"] as const;
export type RingChartVariant = (typeof RING_CHART_VARIANTS)[number];

export const HEATMAP_CHART_VARIANTS = ["calendar", "matrix", "dither"] as const;
export type HeatmapChartVariant = (typeof HEATMAP_CHART_VARIANTS)[number];

export const SUNBURST_CHART_VARIANTS = ["nest", "burst"] as const;
export type SunburstChartVariant = (typeof SUNBURST_CHART_VARIANTS)[number];

export const PROFIT_LOSS_CHART_VARIANTS = ["fill", "stroke", "bars"] as const;
export type ProfitLossChartVariant = (typeof PROFIT_LOSS_CHART_VARIANTS)[number];

export type ChartDatum = Record<string, string | number>;

export interface SankeyNode {
  name: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface CandleDatum {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SunburstNode {
  label: string;
  value: number;
  children?: SunburstNode[];
}
