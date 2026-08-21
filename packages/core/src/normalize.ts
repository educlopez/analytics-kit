import { AnalyticsError } from "./errors.js";
import type { AnalyticsQuery, NormalizedQuery } from "./query.js";
import { resolveRange } from "./range.js";

export function normalizeQuery(query: AnalyticsQuery, now = new Date()): NormalizedQuery {
  if (!query.metrics?.length) {
    throw new AnalyticsError("INVALID_QUERY", "Query must request at least one metric.");
  }

  return {
    range: resolveRange(query.range, now),
    metrics: [...new Set(query.metrics)],
    dimensions: [...new Set(query.dimensions ?? [])],
    granularity: query.granularity,
    filters: query.filters ?? [],
    limit: query.limit ?? 10,
    includePrevious: query.includePrevious ?? false,
  };
}

export function serializeQuery(query: AnalyticsQuery): string {
  return JSON.stringify({
    range: query.range,
    metrics: query.metrics,
    dimensions: query.dimensions ?? [],
    granularity: query.granularity ?? null,
    filters: query.filters ?? [],
    limit: query.limit ?? 10,
    includePrevious: Boolean(query.includePrevious),
  });
}

export function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}
