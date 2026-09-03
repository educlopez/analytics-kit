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
  "forecast",
  "dual",
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
export const LINE_MULTI_VARIANTS: readonly LineChartVariant[] = ["focus", "dual"];

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

/** Structurally matches @analytics-kit/core's provider-agnostic candle type. */
export interface CandleDatum {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Traded volume for the period. Optional for price-only legacy rows. */
  volume?: number;
}

export interface SunburstNode {
  label: string;
  value: number;
  children?: SunburstNode[];
}

export const BREAKDOWN_CARD_VARIANTS = ["bars", "split", "plain", "heat"] as const;
export type BreakdownCardVariant = (typeof BREAKDOWN_CARD_VARIANTS)[number];

export const QUOTA_BAR_VARIANTS = ["bar", "segments", "steps", "compact"] as const;
export type QuotaBarVariant = (typeof QUOTA_BAR_VARIANTS)[number];

export const MARIMEKKO_VARIANTS = ["mosaic", "labels", "outline", "heat"] as const;
export type MarimekkoVariant = (typeof MARIMEKKO_VARIANTS)[number];

export const SPARK_TABLE_VARIANTS = ["sparkline", "bars", "area", "plain"] as const;
export type SparkTableVariant = (typeof SPARK_TABLE_VARIANTS)[number];

export const TIMELINE_VARIANTS = ["rail", "alternating", "stacked", "dots"] as const;
export type TimelineVariant = (typeof TIMELINE_VARIANTS)[number];

export const STRIP_CHART_VARIANTS = ["ticks", "barcode", "dots", "density"] as const;
export type StripChartVariant = (typeof STRIP_CHART_VARIANTS)[number];

export const RADIAL_TIME_VARIANTS = ["rings", "dots", "bands"] as const;
export type RadialTimeVariant = (typeof RADIAL_TIME_VARIANTS)[number];

export const GLOBE_CHART_VARIANTS = ["spin", "drag", "focus", "arcs", "still"] as const;
export type GlobeChartVariant = (typeof GLOBE_CHART_VARIANTS)[number];

export const METRIC_TABS_VARIANTS = ["cards", "strip", "segmented", "stacked"] as const;
export type MetricTabsVariant = (typeof METRIC_TABS_VARIANTS)[number];

export const EMPTY_STATE_VARIANTS = ["panel", "dashed", "inline", "compact"] as const;
export type EmptyStateVariant = (typeof EMPTY_STATE_VARIANTS)[number];

/**
 * Axis scale.
 *
 * `symlog` is backed by a custom d3 scale because recharts' named ScaleType
 * union does not include it. A log axis cannot represent zero, so the charts
 * pin its floor to 1 rather than letting a zero point disappear silently.
 */
export const AXIS_SCALES = ["linear", "log", "symlog"] as const;
export type AxisScale = (typeof AXIS_SCALES)[number];
