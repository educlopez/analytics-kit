export { AnalyticsProvider, useAnalytics, queryKey } from "./context.js";
export type { AnalyticsProviderProps, AnalyticsTheme } from "./context.js";
export { useCapabilities, useQuery, useRealtime } from "./hooks.js";
export type { QueryStatus, UseQueryResult } from "./hooks.js";
export {
  clearWidgets,
  defineWidget,
  getWidget,
  listWidgets,
  registerWidget,
  unregisterWidget,
} from "./registry.js";
export type { WidgetDefinition, WidgetRequirements } from "./registry.js";
export { Dashboard, defaultDashboard } from "./Dashboard.js";
export type { DashboardItem } from "./Dashboard.js";
export { MetricValue, Skeleton, Unsupported, WidgetFrame } from "./primitives/WidgetFrame.js";
export { Donut, RankedList, Sparkline, Timeseries } from "./primitives/Charts.js";
export {
  BounceRateCard,
  DurationCard,
  MetricCard,
  PageviewsCard,
  VisitorsCard,
  VisitsCard,
} from "./widgets/MetricCards.js";
export {
  Devices,
  RealtimeCard,
  TimeseriesChart,
  TopCountries,
  TopPages,
  TopReferrers,
} from "./widgets/Charts.js";
