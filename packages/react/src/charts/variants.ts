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
  "stream",
  "band",
  "ridge",
  "riso",
  "screentone",
  "grain",
] as const;
export type AreaChartVariant = (typeof AREA_CHART_VARIANTS)[number];

/** Variants that draw one band per key in `dataKeys` instead of a single series. */
export const AREA_MULTI_VARIANTS: readonly AreaChartVariant[] = ["stacked", "stream", "ridge"];

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
  "focus",
  "anomaly",
  "riso",
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
  "diverging",
  "editorial",
  "bullet",
] as const;
export type BarChartVariant = (typeof BAR_CHART_VARIANTS)[number];

/** Variants that draw one line per key in `dataKeys` instead of a single series. */
export const LINE_MULTI_VARIANTS: readonly LineChartVariant[] = ["focus"];

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
  "half",
  "callout",
] as const;
export type PieChartVariant = (typeof PIE_CHART_VARIANTS)[number];

export const METRIC_CARD_VARIANTS = [
  "default",
  "spark",
  "compact",
  "hero",
  "bleed",
  "histogram",
] as const;
export type MetricCardVariant = (typeof METRIC_CARD_VARIANTS)[number];

export const BAR_LIST_VARIANTS = ["bar", "compact", "table", "inset", "dual"] as const;
export type BarListVariant = (typeof BAR_LIST_VARIANTS)[number];

export const FUNNEL_CHART_VARIANTS = ["tape", "steps", "vertical", "flow"] as const;
export type FunnelChartVariant = (typeof FUNNEL_CHART_VARIANTS)[number];

export const RADAR_CHART_VARIANTS = ["stroke", "fill", "glow", "dither", "polygon"] as const;
export type RadarChartVariant = (typeof RADAR_CHART_VARIANTS)[number];

export const GAUGE_CHART_VARIANTS = ["arc", "ring", "tick", "score"] as const;
export type GaugeChartVariant = (typeof GAUGE_CHART_VARIANTS)[number];

export const COMPOSED_CHART_VARIANTS = ["combo", "highlight", "overlay"] as const;
export type ComposedChartVariant = (typeof COMPOSED_CHART_VARIANTS)[number];

export const SCATTER_CHART_VARIANTS = ["dots", "bubble", "glow", "field"] as const;
export type ScatterChartVariant = (typeof SCATTER_CHART_VARIANTS)[number];

export const SANKEY_CHART_VARIANTS = ["flow", "gradient", "dither"] as const;
export type SankeyChartVariant = (typeof SANKEY_CHART_VARIANTS)[number];

export const CANDLESTICK_CHART_VARIANTS = ["ohlc", "hollow", "wick", "volume"] as const;
export type CandlestickChartVariant = (typeof CANDLESTICK_CHART_VARIANTS)[number];

export const CHOROPLETH_CHART_VARIANTS = ["tiles", "heat", "dither"] as const;
export type ChoroplethChartVariant = (typeof CHOROPLETH_CHART_VARIANTS)[number];

export const LIVE_LINE_CHART_VARIANTS = ["stream", "glow", "dashed"] as const;
export type LiveLineChartVariant = (typeof LIVE_LINE_CHART_VARIANTS)[number];

export const RING_CHART_VARIANTS = ["stack", "nested", "track"] as const;
export type RingChartVariant = (typeof RING_CHART_VARIANTS)[number];

export const HEATMAP_CHART_VARIANTS = ["calendar", "matrix", "dither", "month"] as const;
export type HeatmapChartVariant = (typeof HEATMAP_CHART_VARIANTS)[number];

export const SUNBURST_CHART_VARIANTS = ["nest", "burst"] as const;
export type SunburstChartVariant = (typeof SUNBURST_CHART_VARIANTS)[number];

export const PROFIT_LOSS_CHART_VARIANTS = ["fill", "stroke", "bars"] as const;
export type ProfitLossChartVariant = (typeof PROFIT_LOSS_CHART_VARIANTS)[number];

export const HORIZON_CHART_VARIANTS = ["bands", "mirror"] as const;
export type HorizonChartVariant = (typeof HORIZON_CHART_VARIANTS)[number];

export const COHORT_GRID_VARIANTS = ["triangle", "counts"] as const;
export type CohortGridVariant = (typeof COHORT_GRID_VARIANTS)[number];

export const BUMP_CHART_VARIANTS = ["ribbon", "line"] as const;
export type BumpChartVariant = (typeof BUMP_CHART_VARIANTS)[number];

export const WATERFALL_CHART_VARIANTS = ["bridge", "bars"] as const;
export type WaterfallChartVariant = (typeof WATERFALL_CHART_VARIANTS)[number];

export const SHARE_BAND_VARIANTS = ["segments", "legend"] as const;
export type ShareBandVariant = (typeof SHARE_BAND_VARIANTS)[number];

export const SLOPE_CHART_VARIANTS = ["paired", "change"] as const;
export type SlopeChartVariant = (typeof SLOPE_CHART_VARIANTS)[number];

export const TREEMAP_CHART_VARIANTS = ["heat", "diverging"] as const;
export type TreemapChartVariant = (typeof TREEMAP_CHART_VARIANTS)[number];

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

/**
 * Axis scale.
 *
 * No symlog: recharts' ScaleType does not include it, and offering an option
 * that silently does nothing is worse than not offering it. A log axis cannot
 * represent zero either, so the charts pin its floor to 1 rather than letting
 * a zero point disappear without saying so.
 */
export const AXIS_SCALES = ["linear", "log"] as const;
export type AxisScale = (typeof AXIS_SCALES)[number];
