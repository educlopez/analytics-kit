import type { DimensionId, TimeGranularity } from "./dimensions.js";
import type { MetricId } from "./metrics.js";
import type { AbsoluteRange, DateRangeInput } from "./range.js";

export type FilterOperator = "eq" | "neq" | "contains" | "in";

export interface AnalyticsFilter {
  dimension: DimensionId;
  op: FilterOperator;
  value: string | string[];
}

export interface AnalyticsQuery {
  range: DateRangeInput;
  metrics: MetricId[];
  dimensions?: DimensionId[];
  granularity?: TimeGranularity;
  filters?: AnalyticsFilter[];
  limit?: number;
  includePrevious?: boolean;
}

export interface NormalizedQuery {
  range: AbsoluteRange;
  metrics: MetricId[];
  dimensions: DimensionId[];
  granularity?: TimeGranularity;
  filters: AnalyticsFilter[];
  limit: number;
  includePrevious: boolean;
}

export interface SeriesPoint {
  date: string;
  values: Record<string, number>;
}

export interface BreakdownRow {
  key: string;
  label?: string;
  values: Record<string, number>;
}

export interface AnalyticsResult {
  totals: Record<string, number>;
  series: SeriesPoint[];
  breakdown: BreakdownRow[];
  previous?: {
    totals: Record<string, number>;
  };
  meta: {
    connectorId: string;
    range: { from: string; to: string; preset?: string };
    granularity?: TimeGranularity;
    warnings?: string[];
    /** True when this result came from a sample/mock fallback, not the live provider. */
    sample?: boolean;
  };
}

export interface RealtimeQuery {
  limit?: number;
}

export interface RealtimeResult {
  visitors: number;
  currentPages?: Array<{ path: string; visitors: number }>;
}

export function emptyResult(connectorId: string, query: NormalizedQuery): AnalyticsResult {
  return {
    totals: Object.fromEntries(query.metrics.map((metric) => [metric, 0])),
    series: [],
    breakdown: [],
    meta: {
      connectorId,
      range: {
        from: query.range.from.toISOString(),
        to: query.range.to.toISOString(),
        preset: query.range.preset,
      },
      granularity: query.granularity,
    },
  };
}

export function queryNeeds(query: NormalizedQuery) {
  return {
    totals: query.metrics.length > 0,
    series: Boolean(query.granularity),
    breakdown: query.dimensions.length > 0,
    previous: query.includePrevious,
  };
}
