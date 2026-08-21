export { AnalyticsProvider, useAnalytics, queryKey } from "./context.js";
export type { AnalyticsProviderProps, AnalyticsTheme } from "./context.js";
export { useCapabilities, useQuery, useRealtime } from "./hooks.js";
export type { QueryStatus, UseQueryResult } from "./hooks.js";
export { CHART_PALETTE } from "./style.js";
export {
  AREA_CHART_VARIANTS,
  BAR_CHART_VARIANTS,
  BAR_LIST_VARIANTS,
  LINE_CHART_VARIANTS,
  METRIC_CARD_VARIANTS,
  PIE_CHART_VARIANTS,
} from "./charts/variants.js";
export type {
  AreaChartVariant,
  BarChartVariant,
  BarListVariant,
  LineChartVariant,
  MetricCardVariant,
  PieChartVariant,
} from "./charts/variants.js";
export { ChartContainer, ChartTooltipBox } from "./charts/chart.js";
export type { ChartConfig } from "./charts/chart.js";
export { AreaChart } from "./charts/area-chart.js";
export { LineChart } from "./charts/line-chart.js";
export { BarChart } from "./charts/bar-chart.js";
export { PieChart } from "./charts/pie-chart.js";
export { cn } from "./lib/cn.js";
export {
  clearWidgets,
  defineWidget,
  getWidget,
  listWidgets,
  registerWidget,
  unregisterWidget,
} from "./registry.js";
export type { WidgetDefinition, WidgetRequirements } from "./registry.js";
export { catalogDashboard, Dashboard, defaultDashboard } from "./Dashboard.js";
export type { DashboardItem } from "./Dashboard.js";
export { MetricValue, Skeleton, Unsupported, WidgetFrame } from "./primitives/WidgetFrame.js";
export {
  BarList,
  BreakdownTable,
  CategoryBars,
  Donut,
  RankedList,
  Sparkline,
  Timeseries,
  Tracker,
} from "./primitives/Charts.js";
export {
  BounceRateCard,
  DurationCard,
  EventsCard,
  MetricCard,
  PageviewsCard,
  ViewsPerVisitCard,
  VisitorsCard,
  VisitsCard,
} from "./widgets/MetricCards.js";
export type { MetricCardProps } from "./widgets/MetricCards.js";
export {
  Devices,
  RealtimeCard,
  TimeseriesChart,
  TopCountries,
  TopPages,
  TopReferrers,
} from "./widgets/Charts.js";
export {
  BreakdownWidget,
  PagesTable,
  TopBrowsers,
  TopCampaigns,
  TopEvents,
  TopOs,
  TopSources,
  VisitTracker,
} from "./widgets/Breakdowns.js";
