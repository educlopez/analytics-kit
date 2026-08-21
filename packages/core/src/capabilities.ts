import type { DimensionId } from "./dimensions.js";
import type { MetricId } from "./metrics.js";
import type { TimeGranularity } from "./dimensions.js";
import type { DateRangePreset } from "./range.js";

export interface ConnectorCapabilities {
  metrics: Partial<Record<MetricId, boolean>>;
  dimensions: Partial<Record<DimensionId, boolean>>;
  granularity: TimeGranularity[];
  filters: boolean;
  realtime: boolean;
  previousPeriod: boolean;
  presets?: DateRangePreset[];
}

export const EMPTY_CAPABILITIES: ConnectorCapabilities = {
  metrics: {},
  dimensions: {},
  granularity: [],
  filters: false,
  realtime: false,
  previousPeriod: false,
};

export function fullCapabilities(): ConnectorCapabilities {
  return {
    metrics: {
      visitors: true,
      pageviews: true,
      visits: true,
      bounceRate: true,
      avgDuration: true,
      viewsPerVisit: true,
      events: true,
    },
    dimensions: {
      path: true,
      referrer: true,
      country: true,
      device: true,
      browser: true,
      os: true,
      source: true,
      medium: true,
      campaign: true,
      eventName: true,
      host: true,
    },
    granularity: ["hour", "day", "week", "month"],
    filters: true,
    realtime: true,
    previousPeriod: true,
  };
}

export function hasMetric(caps: ConnectorCapabilities, id: MetricId): boolean {
  return caps.metrics[id] === true;
}

export function hasDimension(caps: ConnectorCapabilities, id: DimensionId): boolean {
  return caps.dimensions[id] === true;
}

export function hasGranularity(
  caps: ConnectorCapabilities,
  granularity: TimeGranularity,
): boolean {
  return caps.granularity.includes(granularity);
}

export function mergeCapabilities(
  base: ConnectorCapabilities,
  override: Partial<ConnectorCapabilities>,
): ConnectorCapabilities {
  return {
    metrics: { ...base.metrics, ...override.metrics },
    dimensions: { ...base.dimensions, ...override.dimensions },
    granularity: override.granularity ?? base.granularity,
    filters: override.filters ?? base.filters,
    realtime: override.realtime ?? base.realtime,
    previousPeriod: override.previousPeriod ?? base.previousPeriod,
    presets: override.presets ?? base.presets,
  };
}
