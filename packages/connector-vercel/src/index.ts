import {
  AnalyticsError,
  defineConnector,
  emptyResult,
  previousRange,
  providerJson,
  queryNeeds,
  type AnalyticsConnector,
  type AnalyticsFilter,
  type ConnectorCapabilities,
  type DimensionId,
  type MetricId,
  type NormalizedQuery,
  type TimeGranularity,
} from "@analytics-kit/core";

export interface VercelConnectorOptions {
  token: string;
  projectId: string;
  teamId?: string;
  fetch?: typeof fetch;
}

const DIMENSION_MAP: Record<string, string> = {
  path: "requestPath",
  referrer: "referrerHostname",
  country: "country",
  device: "deviceType",
  browser: "browserName",
  os: "osName",
  source: "utmSource",
  medium: "utmMedium",
  campaign: "utmCampaign",
};

export const VERCEL_CAPABILITIES: ConnectorCapabilities = {
  metrics: {
    visitors: true,
    pageviews: true,
    visits: true,
    events: true,
    bounceRate: false,
    avgDuration: false,
    viewsPerVisit: false,
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
    host: false,
  },
  granularity: ["hour", "day", "week", "month"],
  filters: true,
  realtime: false,
  previousPeriod: true,
};

export function mapVercelDimension(dimension: DimensionId): string {
  if (dimension === "eventName") return "eventName";
  const mapped = DIMENSION_MAP[dimension];
  if (!mapped) throw new AnalyticsError("UNSUPPORTED", `Vercel does not map dimension "${dimension}".`);
  return mapped;
}

export function createVercelConnector(options: VercelConnectorOptions): AnalyticsConnector {
  const fetchImpl = options.fetch ?? fetch;

  return defineConnector({
    id: "vercel",
    name: "Vercel Analytics",
    capabilities: VERCEL_CAPABILITIES,
    async query(query) {
      const needs = queryNeeds(query);
      const result = emptyResult("vercel", query);
      const eventMetrics = query.metrics.filter((metric) => metric === "events");
      const visitMetrics = query.metrics.filter((metric) => metric !== "events");

      if (visitMetrics.length) {
        const totals = await countVisits(fetchImpl, options, query);
        Object.assign(result.totals, pickVisitMetrics(visitMetrics, totals));
      }
      if (eventMetrics.length) {
        const events = await countEvents(fetchImpl, options, query);
        result.totals.events = events;
      }

      if (needs.series && query.granularity && visitMetrics.length) {
        const rows = await aggregateVisits(fetchImpl, options, query, [query.granularity]);
        result.series = rows.map((row) => ({
          date: String(row.timestamp ?? row.day ?? row.hour ?? row.week ?? row.month ?? ""),
          values: pickVisitMetrics(visitMetrics, row),
        }));
      }

      if (needs.breakdown) {
        const dimension = query.dimensions[0];
        if (dimension === "eventName") {
          const rows = await aggregateEvents(fetchImpl, options, query, ["eventName"]);
          result.breakdown = rows.map((row) => ({
            key: String(row.eventName ?? "(none)"),
            label: String(row.eventName ?? "(none)"),
            values: { events: Number(row.events ?? row.total ?? 0) },
          }));
        } else {
          const vercelDim = mapVercelDimension(dimension);
          const rows = await aggregateVisits(fetchImpl, options, query, [vercelDim]);
          result.breakdown = rows.slice(0, query.limit).map((row) => ({
            key: String(row[vercelDim] ?? row.route ?? "(none)"),
            label: String(row[vercelDim] ?? row.route ?? "(none)"),
            values: pickVisitMetrics(visitMetrics.length ? visitMetrics : ["pageviews"], row),
          }));
        }
      }

      if (needs.previous && visitMetrics.length) {
        const prevQuery: NormalizedQuery = { ...query, range: previousRange(query.range) };
        const prev = await countVisits(fetchImpl, options, prevQuery);
        result.previous = { totals: pickVisitMetrics(visitMetrics, prev) };
        if (eventMetrics.length) {
          result.previous.totals.events = await countEvents(fetchImpl, options, prevQuery);
        }
      }

      return result;
    },
  });
}

interface VisitTotals {
  visitors?: number;
  pageviews?: number;
  [key: string]: unknown;
}

function pickVisitMetrics(metrics: MetricId[], row: VisitTotals): Record<string, number> {
  const values: Record<string, number> = {};
  for (const metric of metrics) {
    if (metric === "pageviews") values.pageviews = Number(row.pageviews ?? 0);
    else if (metric === "visitors" || metric === "visits") values[metric] = Number(row.visitors ?? 0);
  }
  return values;
}

async function countVisits(
  fetchImpl: typeof fetch,
  options: VercelConnectorOptions,
  query: NormalizedQuery,
): Promise<VisitTotals> {
  const payload = await vercelGet<{ data: VisitTotals }>(
    fetchImpl,
    options,
    "/v1/query/web-analytics/visits/count",
    {
      since: query.range.from.toISOString(),
      until: query.range.to.toISOString(),
      filter: odataFilter(query.filters),
    },
  );
  return payload.data ?? {};
}

async function countEvents(
  fetchImpl: typeof fetch,
  options: VercelConnectorOptions,
  query: NormalizedQuery,
): Promise<number> {
  const payload = await vercelGet<{ data: { events?: number; total?: number } | number }>(
    fetchImpl,
    options,
    "/v1/query/web-analytics/events/count",
    {
      since: query.range.from.toISOString(),
      until: query.range.to.toISOString(),
      filter: odataFilter(query.filters, true),
    },
  );
  if (typeof payload.data === "number") return payload.data;
  return Number(payload.data?.events ?? payload.data?.total ?? 0);
}

async function aggregateVisits(
  fetchImpl: typeof fetch,
  options: VercelConnectorOptions,
  query: NormalizedQuery,
  by: string[],
): Promise<VisitTotals[]> {
  const payload = await vercelGet<{ data: VisitTotals[] }>(
    fetchImpl,
    options,
    "/v1/query/web-analytics/visits/aggregate",
    {
      since: query.range.from.toISOString(),
      until: query.range.to.toISOString(),
      filter: odataFilter(query.filters),
      limit: String(query.limit),
    },
    by,
  );
  return Array.isArray(payload.data) ? payload.data : [];
}

async function aggregateEvents(
  fetchImpl: typeof fetch,
  options: VercelConnectorOptions,
  query: NormalizedQuery,
  by: string[],
): Promise<Array<Record<string, unknown>>> {
  const payload = await vercelGet<{ data: Array<Record<string, unknown>> }>(
    fetchImpl,
    options,
    "/v1/query/web-analytics/events/aggregate",
    {
      since: query.range.from.toISOString(),
      until: query.range.to.toISOString(),
      filter: odataFilter(query.filters, true),
      limit: String(query.limit),
    },
    by,
  );
  return Array.isArray(payload.data) ? payload.data : [];
}

async function vercelGet<T>(
  fetchImpl: typeof fetch,
  options: VercelConnectorOptions,
  path: string,
  params: Record<string, string | undefined>,
  by: string[] = [],
): Promise<T> {
  const url = new URL(`https://api.vercel.com${path}`);
  url.searchParams.set("projectId", options.projectId);
  if (options.teamId) url.searchParams.set("teamId", options.teamId);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  for (const dimension of by) url.searchParams.append("by", dimension);
  return providerJson<T>(
    url.toString(),
    { headers: { authorization: `Bearer ${options.token}` } },
    "vercel",
    fetchImpl,
  );
}

export function odataFilter(filters: AnalyticsFilter[], _events = false): string | undefined {
  if (!filters.length) return undefined;
  return filters
    .map((filter) => {
      const field =
        filter.dimension === "eventName"
          ? "eventName"
          : mapVercelDimension(filter.dimension);
      const values = Array.isArray(filter.value) ? filter.value : [filter.value];
      if (filter.op === "in") {
        return `${field} in (${values.map(quote).join(",")})`;
      }
      if (filter.op === "contains") {
        return `startswith(${field},${quote(values[0] ?? "")})`;
      }
      const op = filter.op === "neq" ? "ne" : "eq";
      return `${field} ${op} ${quote(values[0] ?? "")}`;
    })
    .join(" and ");
}

function quote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function vercelGranularity(granularity: TimeGranularity): string {
  return granularity;
}
