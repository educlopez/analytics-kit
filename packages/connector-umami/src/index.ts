import {
  AnalyticsError,
  defineConnector,
  emptyResult,
  previousRange,
  providerJson,
  queryNeeds,
  type AnalyticsConnector,
  type ConnectorCapabilities,
  type DimensionId,
  type MetricId,
  type NormalizedQuery,
} from "@analytics-kit/core";

export interface UmamiConnectorOptions {
  apiKey: string;
  websiteId: string;
  /** Cloud or self-hosted origin, e.g. https://api.umami.is or https://umami.example.com */
  host?: string;
  fetch?: typeof fetch;
}

const METRIC_TYPE: Record<string, string> = {
  path: "url",
  referrer: "referrer",
  country: "country",
  device: "device",
  browser: "browser",
  os: "os",
  eventName: "event",
  host: "hostname",
};

export const UMAMI_CAPABILITIES: ConnectorCapabilities = {
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
    eventName: true,
    host: true,
    source: false,
    medium: false,
    campaign: false,
  },
  granularity: ["hour", "day", "month"],
  filters: false,
  realtime: true,
  previousPeriod: true,
};

export function mapUmamiDimension(dimension: DimensionId): string {
  const mapped = METRIC_TYPE[dimension];
  if (!mapped)
    throw new AnalyticsError("UNSUPPORTED", `Umami does not map dimension "${dimension}".`);
  return mapped;
}

export function createUmamiConnector(options: UmamiConnectorOptions): AnalyticsConnector {
  const host = (options.host ?? "https://api.umami.is").replace(/\/$/, "");
  const fetchImpl = options.fetch ?? fetch;

  return defineConnector({
    id: "umami",
    name: "Umami",
    capabilities: UMAMI_CAPABILITIES,
    async query(query) {
      const needs = queryNeeds(query);
      const result = emptyResult("umami", query);
      const stats = await getStats(fetchImpl, host, options, query);
      result.totals = totalsFromStats(query.metrics, stats);

      if (needs.series && query.granularity) {
        const unit = query.granularity === "week" ? "day" : query.granularity;
        const series = await getJson<{
          pageviews: Array<{ x: string; y: number }>;
          sessions: Array<{ x: string; y: number }>;
        }>(fetchImpl, host, options, `/api/websites/${options.websiteId}/pageviews`, {
          startAt: String(query.range.from.getTime()),
          endAt: String(query.range.to.getTime()),
          unit,
        });
        result.series = (series.pageviews ?? []).map((point, index) => {
          const visits = series.sessions?.[index]?.y ?? 0;
          const values: Record<string, number> = {};
          if (query.metrics.includes("pageviews")) values.pageviews = point.y;
          if (query.metrics.includes("visits")) values.visits = visits;
          if (query.metrics.includes("visitors")) values.visitors = visits;
          return { date: point.x, values };
        });
      }

      if (needs.breakdown) {
        const type = mapUmamiDimension(query.dimensions[0]);
        const rows = await getJson<Array<{ x: string; y: number }>>(
          fetchImpl,
          host,
          options,
          `/api/websites/${options.websiteId}/metrics`,
          {
            startAt: String(query.range.from.getTime()),
            endAt: String(query.range.to.getTime()),
            type,
            limit: String(query.limit),
          },
        );
        result.breakdown = (rows ?? []).map((row) => ({
          key: row.x || "(none)",
          label: row.x || "(none)",
          values: { [query.metrics[0] ?? "pageviews"]: row.y },
        }));
      }

      if (needs.previous) {
        const prev = await getStats(fetchImpl, host, options, {
          ...query,
          range: previousRange(query.range),
        });
        result.previous = { totals: totalsFromStats(query.metrics, prev) };
      }

      return result;
    },
    async realtime() {
      const active = await getJson<{ visitors?: number; x?: number } | number>(
        fetchImpl,
        host,
        options,
        `/api/websites/${options.websiteId}/active`,
        {},
      );
      const visitors =
        typeof active === "number" ? active : Number(active.visitors ?? active.x ?? 0);
      return { visitors };
    },
  });
}

interface UmamiStats {
  pageviews?: { value: number; prev?: number };
  visitors?: { value: number; prev?: number };
  visits?: { value: number; prev?: number };
  bounces?: { value: number; prev?: number };
  totaltime?: { value: number; prev?: number };
}

function totalsFromStats(metrics: MetricId[], stats: UmamiStats): Record<string, number> {
  const pageviews = stats.pageviews?.value ?? 0;
  const visitors = stats.visitors?.value ?? 0;
  const visits = stats.visits?.value ?? visitors;
  const bounces = stats.bounces?.value ?? 0;
  const totaltime = stats.totaltime?.value ?? 0;
  const values: Record<string, number> = {};
  for (const metric of metrics) {
    if (metric === "pageviews") values.pageviews = pageviews;
    else if (metric === "visitors") values.visitors = visitors;
    else if (metric === "visits") values.visits = visits;
    else if (metric === "bounceRate") values.bounceRate = visits ? (bounces / visits) * 100 : 0;
    else if (metric === "avgDuration") values.avgDuration = visits ? totaltime / visits : 0;
    else if (metric === "viewsPerVisit") values.viewsPerVisit = visits ? pageviews / visits : 0;
    else if (metric === "events") values.events = pageviews;
  }
  return values;
}

async function getStats(
  fetchImpl: typeof fetch,
  host: string,
  options: UmamiConnectorOptions,
  query: NormalizedQuery,
): Promise<UmamiStats> {
  return getJson<UmamiStats>(fetchImpl, host, options, `/api/websites/${options.websiteId}/stats`, {
    startAt: String(query.range.from.getTime()),
    endAt: String(query.range.to.getTime()),
  });
}

async function getJson<T>(
  fetchImpl: typeof fetch,
  host: string,
  options: UmamiConnectorOptions,
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(`${host}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return providerJson<T>(
    url.toString(),
    {
      headers: {
        "x-umami-api-key": options.apiKey,
        authorization: `Bearer ${options.apiKey}`,
      },
    },
    "umami",
    fetchImpl,
  );
}
