export { AnalyticsProvider, useAnalytics, queryKey } from "./context.js";
export type { AnalyticsProviderProps, AnalyticsTheme } from "./context.js";
export { useCapabilities, useQuery, useRealtime } from "./hooks.js";
export type { QueryStatus, UseQueryResult } from "./hooks.js";
export {
  ANALYTICS_STYLE_META,
  ANALYTICS_STYLES,
  CHART_PALETTE,
  resolveAnalyticsStyle,
  tokensToCssVars,
} from "./style.js";
export type { AnalyticsStyleName, AnalyticsStyleOverrides, AnalyticsStyleTokens } from "./style.js";
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
  AreaChart,
  BarChart,
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
