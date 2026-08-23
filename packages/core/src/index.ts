export {
  BUILTIN_METRICS,
  defaultMetricCatalog,
  getMetric,
  listMetrics,
  registerMetric,
} from "./metrics.js";
export type { BuiltinMetric, MetricCatalog, MetricDefinition, MetricId } from "./metrics.js";

export {
  BUILTIN_DIMENSIONS,
  TIME_GRANULARITIES,
  defaultDimensionCatalog,
  getDimension,
  listDimensions,
  registerDimension,
} from "./dimensions.js";
export type {
  BuiltinDimension,
  DimensionCatalog,
  DimensionDefinition,
  DimensionId,
  TimeGranularity,
} from "./dimensions.js";

export {
  EMPTY_CAPABILITIES,
  fullCapabilities,
  hasDimension,
  hasGranularity,
  hasMetric,
  mergeCapabilities,
  unionCapabilities,
} from "./capabilities.js";
export type { ConnectorCapabilities } from "./capabilities.js";

export {
  DATE_RANGE_PRESETS,
  defaultGranularity,
  enumerateDays,
  previousRange,
  resolveRange,
  toIsoDate,
} from "./range.js";
export type { AbsoluteRange, DateRangeInput, DateRangePreset } from "./range.js";

export { AnalyticsError, isAnalyticsError } from "./errors.js";
export type { AnalyticsErrorCode } from "./errors.js";

export { emptyResult, queryNeeds } from "./query.js";
export type {
  AnalyticsFilter,
  AnalyticsQuery,
  AnalyticsResult,
  BreakdownRow,
  FilterOperator,
  NormalizedQuery,
  RealtimeQuery,
  RealtimeResult,
  SeriesPoint,
} from "./query.js";

export { normalizeQuery, percentDelta, serializeQuery } from "./normalize.js";
export { assertSupported, missingRequirements } from "./validate.js";
export { defineConnector, withCache, withRetry, withSampleFallback } from "./connector.js";
export type {
  AnalyticsConnector,
  ConnectorInfo,
  DefineConnectorInput,
  SampleFallbackOptions,
} from "./connector.js";
export { providerFetch, providerJson } from "./http.js";
export { createHttpConnector } from "./remote.js";
export type { RemoteConnectorOptions } from "./remote.js";
export {
  formatCurrency,
  formatDelta,
  formatDuration,
  formatMetric,
  formatNumber,
} from "./format.js";
