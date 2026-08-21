import type { ConnectorCapabilities } from "./capabilities.js";
import { hasDimension, hasGranularity, hasMetric } from "./capabilities.js";
import { AnalyticsError } from "./errors.js";
import type { NormalizedQuery } from "./query.js";

export function assertSupported(
  capabilities: ConnectorCapabilities,
  query: NormalizedQuery,
  connectorId: string,
): void {
  for (const metric of query.metrics) {
    if (!hasMetric(capabilities, metric)) {
      throw new AnalyticsError(
        "UNSUPPORTED",
        `Metric "${metric}" is not available on connector "${connectorId}".`,
        { connectorId, details: { metric } },
      );
    }
  }

  for (const dimension of query.dimensions) {
    if (!hasDimension(capabilities, dimension)) {
      throw new AnalyticsError(
        "UNSUPPORTED",
        `Dimension "${dimension}" is not available on connector "${connectorId}".`,
        { connectorId, details: { dimension } },
      );
    }
  }

  if (query.granularity && !hasGranularity(capabilities, query.granularity)) {
    throw new AnalyticsError(
      "UNSUPPORTED",
      `Granularity "${query.granularity}" is not available on connector "${connectorId}".`,
      { connectorId, details: { granularity: query.granularity } },
    );
  }

  if (query.filters.length && !capabilities.filters) {
    throw new AnalyticsError(
      "UNSUPPORTED",
      `Filters are not available on connector "${connectorId}".`,
      { connectorId },
    );
  }

  if (query.includePrevious && !capabilities.previousPeriod) {
    throw new AnalyticsError(
      "UNSUPPORTED",
      `Previous-period comparison is not available on connector "${connectorId}".`,
      { connectorId },
    );
  }
}

export function missingRequirements(
  capabilities: ConnectorCapabilities,
  requirements: { metrics?: string[]; dimensions?: string[]; realtime?: boolean },
): string[] {
  const missing: string[] = [];
  for (const metric of requirements.metrics ?? []) {
    if (!hasMetric(capabilities, metric)) missing.push(`metric:${metric}`);
  }
  for (const dimension of requirements.dimensions ?? []) {
    if (!hasDimension(capabilities, dimension)) missing.push(`dimension:${dimension}`);
  }
  if (requirements.realtime && !capabilities.realtime) missing.push("realtime");
  return missing;
}
