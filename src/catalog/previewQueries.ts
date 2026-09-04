import type { AnalyticsQuery } from "@wingtics/core";

const HOUR_MS = 3_600_000;

/**
 * Build the radial preview's provider request from completed UTC buckets only.
 * Vercel aggregate requests allow at most 100 rows, so 96 buckets represent
 * one honest, complete four-day window without implying a full 30-day series.
 */
export function buildRadialTimePreviewQuery(metric: string, now = new Date()): AnalyticsQuery {
  const completedHourBoundary = new Date(now);
  completedHourBoundary.setUTCMinutes(0, 0, 0);
  const bucketCount = 96;

  return {
    range: {
      from: new Date(completedHourBoundary.getTime() - bucketCount * HOUR_MS),
      to: new Date(completedHourBoundary.getTime() - 1),
    },
    metrics: [metric],
    granularity: "hour",
    limit: bucketCount,
  };
}
