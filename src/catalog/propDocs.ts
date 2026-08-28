import type { PropRow } from "../site/PropsTable";

/** Cross-cutting treatments, shared by the time-series charts. */
const SERIES_TREATMENTS: PropRow[] = [
  {
    name: "emphasizeLast",
    type: "boolean",
    default: "false",
    notes:
      "Terminal dot plus a value pill on the final point. Drawn on its own layer, so it composes with any variant.",
  },
  {
    name: "previous",
    type: "ChartDatum[]",
    notes:
      "Previous-period rows, drawn dashed underneath and aligned by index rather than by date. Adds a Previous row to the tooltip.",
  },
  {
    name: "annotations",
    type: "Annotation[]",
    notes:
      '{ at, label, kind? } per marker, where at matches a labelKey value. kind is "deploy" | "release" | "incident" | "note" and only sets the colour.',
  },
  {
    name: "brush",
    type: "boolean",
    default: "false",
    notes: "Drag-to-zoom strip under the chart.",
  },
  {
    name: "scale",
    type: '"linear" | "log" | "symlog"',
    default: '"linear"',
    notes:
      "Y-axis scale. log is pinned to 1 because it cannot represent zero. symlog uses a custom d3 scale and remains defined for negative values and zero.",
  },
  {
    name: "gaps",
    type: '"bridge" | "break"',
    default: '"bridge"',
    notes:
      "How a null is drawn: joined across, or left open. Neither coerces the missing point to zero, which would draw a cliff that reads as a traffic collapse.",
  },
];

const CHART_SHARED: PropRow[] = [
  {
    name: "data",
    type: "ChartDatum[]",
    notes: "Rows to draw. Each object is a point or category.",
  },
  {
    name: "dataKey",
    type: "string",
    default: '"value"',
    notes: "Numeric field on each row.",
  },
  {
    name: "config",
    type: "ChartConfig",
    notes: "Map of dataKey → { label?, color? }. Colors fall back to --chart-1.",
  },
  {
    name: "className",
    type: "string",
    notes: "Chart container. Default height is 220px; spark looks better around 88px.",
  },
];

export const PROP_DOCS: Record<string, PropRow[]> = {
  "treemap-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Category rows. Sorted by value and squarified, so tile order is derived, not given.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field that sets tile area. Rows at or below zero are dropped.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Tile name. Hidden on tiles too small to read it.",
    },
    {
      name: "deltaKey",
      type: "string",
      default: '"delta"',
      notes: "Signed change per row. Only read by the diverging variant.",
    },
    {
      name: "variant",
      type: '"heat" | "diverging"',
      default: '"heat"',
      notes:
        "heat tints by share of the largest tile. diverging colours by the sign of delta and tints by its size.",
    },
    {
      name: "height",
      type: "number",
      default: "260",
      notes: "Height in px. Width is fluid.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "cohort-grid": [
    {
      name: "data",
      type: "CohortRow[]",
      notes:
        "{ label, size, values[] } per cohort. Rows may be ragged — a young cohort has fewer periods, and padding it out would invent data.",
    },
    {
      name: "variant",
      type: '"triangle" | "counts"',
      default: '"triangle"',
      notes: "Cells show retained share, or the raw retained count.",
    },
    {
      name: "periodLabel",
      type: "string",
      default: '"Period"',
      notes: 'Column header prefix. "Week" gives Week 0, Week 1, and so on.',
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper. The table scrolls horizontally inside it.",
    },
  ],
  "horizon-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Shared time rows. Every lane reads its own key off the same rows.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      notes: "One lane per key, in order. This is the point of the chart — pass many.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "Field used for the first and last axis labels.",
    },
    {
      name: "variant",
      type: '"bands" | "mirror"',
      default: '"bands"',
      notes: "mirror folds negative values back up, so a drop reads as depth rather than as zero.",
    },
    {
      name: "bands",
      type: "number",
      default: "3",
      notes: "How many times each lane's range is folded. More bands, more resolution per pixel.",
    },
    {
      name: "laneHeight",
      type: "number",
      default: "26",
      notes: "Height of one lane in px. The whole chart is this times the number of keys.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "area-chart": [
    ...CHART_SHARED,
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field. Usually an ISO date.",
    },
    {
      name: "variant",
      type: '"gradient" | "linear" | "natural" | "step" | "dots" | "spark" | "dither" | "glow" | "hatched" | "bars" | "solid" | "stacked" | "stream" | "band" | "ridge" | "riso" | "screentone" | "grain"',
      default: '"gradient"',
      notes:
        "How the fill and curve are drawn. hatched and bars are SVG textures. Not a color theme.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      default: "[dataKey]",
      notes:
        "Series to compose. Pass two or more for the stacked and stream variants; ignored by the others.",
    },
    ...SERIES_TREATMENTS,
  ],
  "line-chart": [
    ...CHART_SHARED,
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field. Usually an ISO date.",
    },
    {
      name: "variant",
      type: '"monotone" | "linear" | "step" | "dashed" | "dots" | "dither" | "glow" | "ping" | "rainbow" | "values" | "focus" | "anomaly" | "riso"',
      default: '"monotone"',
      notes:
        "Stroke interpolation and decoration. ping pulses the last point; rainbow strokes --chart-1…5; values labels dots.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      default: "[dataKey]",
      notes: 'Series to draw. Pass several for variant="focus"; ignored by the other variants.',
    },
    {
      name: "anomalyThreshold",
      type: "number",
      default: "3.5",
      notes:
        'How far from the rolling median a point must sit to be ringed by variant="anomaly", in MAD-derived standard deviations. Strict by default: ringing every wobble trains people to ignore the rings.',
    },
    ...SERIES_TREATMENTS,
  ],
  "bar-chart": [
    ...CHART_SHARED,
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Category field on each row.",
    },
    {
      name: "variant",
      type: '"vertical" | "horizontal" | "rounded" | "hatched" | "dither" | "glow" | "gradient" | "duotone" | "grouped" | "stacked" | "stacked-100" | "diverging" | "editorial" | "bullet"',
      default: '"vertical"',
      notes:
        "Orientation and bar fill. horizontal flips the axes. duotone is a hard two-band fill.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      default: "[dataKey]",
      notes:
        "Series to compare. Pass two or more for grouped, stacked and stacked-100 to have anything to compare. stacked-100 rebases the drawing to share; the tooltip still reports real counts.",
    },
  ],
  "pie-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Category rows. One slice per row.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field used for slice size.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Slice name. Also used for the legend.",
    },
    {
      name: "variant",
      type: '"donut" | "pie" | "legend" | "dither" | "rounded" | "radial" | "glow" | "half" | "callout"',
      default: '"donut"',
      notes: "Ring vs full pie, rounded gaps, radial bars, or a bloom on the slices.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "funnel-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Stages in order. The first value is 100%.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field on each stage.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Stage name.",
    },
    {
      name: "variant",
      type: '"tape" | "steps" | "vertical" | "flow"',
      default: '"tape"',
      notes: "Tapering ribbon, discrete blocks, or stacked drop-off bars.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "radar-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "One row per axis.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field plotted on each axis.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Axis name.",
    },
    {
      name: "variant",
      type: '"stroke" | "fill" | "glow" | "dither" | "polygon"',
      default: '"fill"',
      notes: "Outline only, translucent fill, bloom, or a stipple fill.",
    },
    {
      name: "config",
      type: "ChartConfig",
      notes: "Map of dataKey → { label?, color? }.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "composed-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Shared category rows. Needs both barKey and lineKey.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field.",
    },
    {
      name: "barKey",
      type: "string",
      default: '"bar"',
      notes: "Numeric field for the bars (or the dashed overlay line).",
    },
    {
      name: "lineKey",
      type: "string",
      default: '"line"',
      notes: "Numeric field for the line or highlight area.",
    },
    {
      name: "variant",
      type: '"combo" | "highlight" | "overlay"',
      default: '"combo"',
      notes: "Bars + line, muted bars + glow, or dashed line over a glowing area.",
    },
    {
      name: "config",
      type: "ChartConfig",
      notes: "Colors and labels for barKey and lineKey.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "scatter-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Points with numeric x and y. Optional z for bubble size.",
    },
    {
      name: "xKey",
      type: "string",
      default: '"x"',
      notes: "Horizontal numeric field.",
    },
    {
      name: "yKey",
      type: "string",
      default: '"y"',
      notes: "Vertical numeric field.",
    },
    {
      name: "zKey",
      type: "string",
      default: '"z"',
      notes: "Used only by the bubble variant.",
    },
    {
      name: "variant",
      type: '"dots" | "bubble" | "glow" | "field"',
      default: '"dots"',
      notes: "Equal dots, sized bubbles, or a bloom on each point.",
    },
    {
      name: "config",
      type: "ChartConfig",
      notes: "Color and label for yKey.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "sankey-chart": [
    {
      name: "nodes",
      type: "SankeyNode[]",
      notes: "{ name }[]. Ignored when data is passed.",
    },
    {
      name: "links",
      type: "SankeyLink[]",
      notes: "{ source, target, value }[] using node indexes.",
    },
    {
      name: "data",
      type: "{ nodes, links }",
      notes: "Alternate payload. Wins over nodes and links.",
    },
    {
      name: "variant",
      type: '"flow" | "gradient" | "dither"',
      default: '"flow"',
      notes: "Link curvature and opacity. The drawing, not a palette.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "candlestick-chart": [
    {
      name: "data",
      type: "CandleDatum[]",
      notes:
        "{ date, open, high, low, close, volume? }[] in order. volume drives the volume pane; legacy rows without it fall back to candle range.",
    },
    {
      name: "variant",
      type: '"ohlc" | "hollow" | "wick" | "volume"',
      default: '"ohlc"',
      notes: "Solid bodies, hollow up-days, a thin wick, or OHLC with a volume pane.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "choropleth-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Regions. Pass code for a two-letter tile label.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field used for intensity.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Region name. code falls back to the first two letters.",
    },
    {
      name: "variant",
      type: '"tiles" | "heat" | "dither"',
      default: '"tiles"',
      notes: "Labeled tiles, a tighter heat field, or a wash. Not a geoJSON map.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "live-line-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Full series. The chart windows the last N points and steps forward.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field.",
    },
    {
      name: "windowSize",
      type: "number",
      default: "14",
      notes: "How many points stay on screen.",
    },
    {
      name: "intervalMs",
      type: "number",
      default: "700",
      notes: "Advance interval. No-op when data.length ≤ windowSize.",
    },
    {
      name: "variant",
      type: '"stream" | "glow" | "dashed"',
      default: '"stream"',
      notes: "Ping on the last point, a bloom, or a dashed pulse.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "ring-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Up to five categories. One ring each when nested.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Legend name.",
    },
    {
      name: "variant",
      type: '"stack" | "nested" | "track"',
      default: '"stack"',
      notes: "Shared ring, concentric rings, or a thick track.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "heatmap-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "One cell per row. Dates read well as a week grid.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field used for intensity.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "Cell title.",
    },
    {
      name: "variant",
      type: '"calendar" | "matrix" | "dither" | "month"',
      default: '"calendar"',
      notes: "Seven-column week, a 10-column matrix, or a wash.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "sunburst-chart": [
    {
      name: "data",
      type: "SunburstNode[]",
      notes: "{ label, value, children? }[]. Two rings: parents then children.",
    },
    {
      name: "variant",
      type: '"nest" | "burst"',
      default: '"nest"',
      notes: "Tight rings or a more open burst.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "profit-loss-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Signed values. Positive is up, negative is down.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Signed numeric field.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field.",
    },
    {
      name: "variant",
      type: '"fill" | "stroke" | "bars"',
      default: '"fill"',
      notes: "Split area, a single stroke, or opposing bars.",
    },
    {
      name: "config",
      type: "ChartConfig",
      notes: "Colors for up and down. Defaults to --ak-up / --ak-down.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "gauge-chart": [
    {
      name: "value",
      type: "number",
      notes: "Current reading.",
    },
    {
      name: "max",
      type: "number",
      default: "100",
      notes: "Full-scale value. 100 prints as a percent.",
    },
    {
      name: "label",
      type: "string",
      notes: "Caption under the number.",
    },
    {
      name: "variant",
      type: '"arc" | "ring" | "tick" | "score"',
      default: '"arc"',
      notes: "Semicircle, full ring, or tick marks with a needle.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
    {
      name: "bands",
      type: "{ label, color }[]",
      default: "Low / Medium / High",
      notes:
        "Qualitative bands for the score variant, low to high. The arc is split into these and the value's band is named under it.",
    },
  ],
  "metric-card": [
    {
      name: "metric",
      type: "MetricId",
      notes: "Canonical metric queried through the provider.",
    },
    {
      name: "title",
      type: "string",
      notes: "Header label. Defaults to the metric catalog name.",
    },
    {
      name: "variant",
      type: '"default" | "spark" | "compact" | "hero" | "bleed" | "histogram"',
      default: '"default"',
      notes: "Size and whether a sparkline trails the number.",
    },
    {
      name: "range",
      type: "DateRangeInput",
      notes: "Overrides the provider range for this card only.",
    },
    {
      name: "span",
      type: "number",
      notes: "Dashboard grid column span.",
    },
  ],
  "ranked-list": [
    {
      name: "rows",
      type: "BreakdownRow[]",
      notes: "Dimension rows from a query. Each row has key, label, values.",
    },
    {
      name: "metric",
      type: "string",
      notes: "Which values[metric] to rank and format.",
    },
    {
      name: "variant",
      type: '"bar" | "compact" | "table" | "inset" | "dual"',
      default: '"bar"',
      notes: "Bars, a tight list, or a share table.",
    },
  ],
  dashboard: [
    {
      name: "widgets",
      type: "DashboardItem[]",
      default: "defaultDashboard",
      notes: "{ widget, span?, props? }[]. Use catalogDashboard to preview every built-in.",
    },
    {
      name: "columns",
      type: "number",
      default: "4",
      notes: "CSS grid column count.",
    },
    {
      name: "showRange",
      type: "boolean",
      default: "true",
      notes: "Toolbar with 24h / 7d / 30d / 90d / 12mo presets.",
    },
  ],
};
