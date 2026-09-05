import {
  defineConnector,
  emptyResult,
  previousRange,
  providerJson,
  queryNeeds,
  toIsoDate,
  type AnalyticsConnector,
  type AnalyticsFilter,
  type ConnectorCapabilities,
  type DimensionId,
  type MetricId,
  type NormalizedQuery,
} from "@wingtics/core";

export interface PlausibleConnectorOptions {
  apiKey: string;
  siteId: string;
  /** Defaults to https://plausible.io */
  host?: string;
  fetch?: typeof fetch;
}

const METRIC_MAP: Record<string, string> = {
  visitors: "visitors",
  visits: "visits",
  pageviews: "pageviews",
  bounceRate: "bounce_rate",
  avgDuration: "visit_duration",
  viewsPerVisit: "views_per_visit",
  events: "events",
};

const DIMENSION_MAP: Record<string, string> = {
  path: "event:page",
  referrer: "visit:referrer",
  country: "visit:country_name",
  device: "visit:device",
  browser: "visit:browser",
  os: "visit:os",
  source: "visit:source",
  medium: "visit:utm_medium",
  campaign: "visit:utm_campaign",
  eventName: "event:goal",
  host: "event:hostname",
};

const TIME_MAP = {
  hour: "time:hour",
  day: "time:day",
  week: "time:week",
  month: "time:month",
} as const;

export const PLAUSIBLE_CAPABILITIES: ConnectorCapabilities = {
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

export function mapPlausibleMetrics(metrics: MetricId[]): string[] {
  return metrics.map((metric) => {
    const mapped = METRIC_MAP[metric];
    if (!mapped) {
      throw new Error(`Plausible does not map metric "${metric}".`);
    }
    return mapped;
  });
}

export function mapPlausibleDimension(dimension: DimensionId): string {
  const mapped = DIMENSION_MAP[dimension];
  if (!mapped) throw new Error(`Plausible does not map dimension "${dimension}".`);
  return mapped;
}

export function createPlausibleConnector(options: PlausibleConnectorOptions): AnalyticsConnector {
  const host = (options.host ?? "https://plausible.io").replace(/\/$/, "");
  const fetchImpl = options.fetch ?? fetch;

  return defineConnector({
    id: "plausible",
    name: "Plausible",
    capabilities: PLAUSIBLE_CAPABILITIES,
    async query(query) {
      const needs = queryNeeds(query);
      const result = emptyResult("plausible", query);
      const metrics = mapPlausibleMetrics(query.metrics);

      const totalsBody = await runQuery(fetchImpl, host, options, {
        metrics,
        date_range: dateRange(query),
        filters: mapFilters(query.filters),
      });
      result.totals = zipMetrics(query.metrics, totalsBody.results[0]?.metrics ?? []);

      if (needs.series && query.granularity) {
        const seriesBody = await runQuery(fetchImpl, host, options, {
          metrics,
          date_range: dateRange(query),
          dimensions: [TIME_MAP[query.granularity]],
          filters: mapFilters(query.filters),
        });
        result.series = seriesBody.results.map((row) => ({
          date: String(row.dimensions[0] ?? ""),
          values: zipMetrics(query.metrics, row.metrics),
        }));
      }

      if (needs.breakdown) {
        const dimension = mapPlausibleDimension(query.dimensions[0]);
        const breakdownBody = await runQuery(fetchImpl, host, options, {
          metrics,
          date_range: dateRange(query),
          dimensions: [dimension],
          filters: mapFilters(query.filters),
          pagination: { limit: query.limit },
        });
        result.breakdown = breakdownBody.results.map((row) => ({
          key: String(row.dimensions[0] ?? "(none)"),
          label: String(row.dimensions[0] ?? "(none)"),
          values: zipMetrics(query.metrics, row.metrics),
        }));
      }

      if (needs.previous) {
        const prev = previousRange(query.range);
        const previousBody = await runQuery(fetchImpl, host, options, {
          metrics,
          date_range: [toIsoDate(prev.from), toIsoDate(prev.to)],
          filters: mapFilters(query.filters),
        });
        result.previous = {
          totals: zipMetrics(query.metrics, previousBody.results[0]?.metrics ?? []),
        };
      }

      return result;
    },
    async realtime() {
      const now = new Date();
      const from = new Date(now.getTime() - 5 * 60 * 1000);
      const body = await runQuery(fetchImpl, host, options, {
        metrics: ["visitors"],
        date_range: [from.toISOString(), now.toISOString()],
        dimensions: ["event:page"],
        pagination: { limit: 8 },
      });
      return {
        visitors: Number(body.results.reduce((sum, row) => sum + Number(row.metrics[0] ?? 0), 0)),
        currentPages: body.results.map((row) => ({
          path: String(row.dimensions[0] ?? "/"),
          visitors: Number(row.metrics[0] ?? 0),
        })),
      };
    },
  });
}

interface PlausibleQueryBody {
  metrics: string[];
  date_range: string | [string, string];
  dimensions?: string[];
  filters?: unknown[];
  pagination?: { limit: number };
}

interface PlausibleResponse {
  results: Array<{ metrics: number[]; dimensions: string[] }>;
}

async function runQuery(
  fetchImpl: typeof fetch,
  host: string,
  options: PlausibleConnectorOptions,
  body: PlausibleQueryBody,
): Promise<PlausibleResponse> {
  return providerJson<PlausibleResponse>(
    `${host}/api/v2/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${options.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ site_id: options.siteId, ...body }),
    },
    "plausible",
    fetchImpl,
  );
}

function dateRange(query: NormalizedQuery): string | [string, string] {
  if (
    query.range.preset &&
    ["24h", "7d", "28d", "30d", "month", "year"].includes(query.range.preset)
  ) {
    return query.range.preset === "28d" ? "28d" : query.range.preset;
  }
  if (query.range.preset === "90d") return "91d";
  if (query.range.preset === "12mo") return "12mo";
  if (query.range.preset === "today") return "day";
  return [toIsoDate(query.range.from), toIsoDate(query.range.to)];
}

function mapFilters(filters: AnalyticsFilter[]): unknown[] | undefined {
  if (!filters.length) return undefined;
  return filters.map((filter) => {
    const dimension = mapPlausibleDimension(filter.dimension);
    const values = Array.isArray(filter.value) ? filter.value : [filter.value];
    const op = filter.op === "neq" ? "is_not" : filter.op === "contains" ? "contains" : "is";
    return [op, dimension, values];
  });
}

function zipMetrics(ids: MetricId[], values: number[]): Record<string, number> {
  return Object.fromEntries(ids.map((id, index) => [id, Number(values[index] ?? 0)]));
}
