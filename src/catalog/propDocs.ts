import type { PropRow } from "../site/PropsTable";

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
      type: '"gradient" | "linear" | "natural" | "step" | "dots" | "spark" | "dither" | "glow"',
      default: '"gradient"',
      notes: "How the fill and curve are drawn. Not a color theme.",
    },
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
      type: '"monotone" | "linear" | "step" | "dashed" | "dots" | "dither" | "glow"',
      default: '"monotone"',
      notes: "Stroke interpolation and decoration.",
    },
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
      type: '"vertical" | "horizontal" | "rounded" | "hatched" | "dither"',
      default: '"vertical"',
      notes: "Orientation and bar fill. horizontal flips the axes.",
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
      type: '"donut" | "pie" | "legend" | "dither"',
      default: '"donut"',
      notes: "Ring vs full pie, optional legend, or stippled slices.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
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
      type: '"default" | "spark" | "compact" | "hero"',
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
      type: '"bar" | "compact" | "table"',
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
