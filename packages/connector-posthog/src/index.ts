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

export interface PostHogConnectorOptions {
  apiKey: string;
  projectId: string;
  /** Defaults to https://us.posthog.com — use https://eu.posthog.com for EU cloud */
  host?: string;
  fetch?: typeof fetch;
}

const DIMENSION_SQL: Record<string, string> = {
  path: "properties.$current_url",
  referrer: "properties.$referrer",
  country: "properties.$geoip_country_name",
  device: "properties.$device_type",
  browser: "properties.$browser",
  os: "properties.$os",
  source: "properties.utm_source",
  medium: "properties.utm_medium",
  campaign: "properties.utm_campaign",
  eventName: "event",
  host: "properties.$host",
};

export const POSTHOG_CAPABILITIES: ConnectorCapabilities = {
  metrics: {
    visitors: true,
    pageviews: true,
    visits: true,
    bounceRate: true,
    avgDuration: false,
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
  filters: false,
  realtime: true,
  previousPeriod: true,
};

export function mapPosthogDimension(dimension: DimensionId): string {
  const mapped = DIMENSION_SQL[dimension];
  if (!mapped) {
    throw new AnalyticsError("UNSUPPORTED", `PostHog does not map dimension "${dimension}".`);
  }
  return mapped;
}

export function createPostHogConnector(options: PostHogConnectorOptions): AnalyticsConnector {
  const host = (options.host ?? "https://us.posthog.com").replace(/\/$/, "");
  const fetchImpl = options.fetch ?? fetch;

  return defineConnector({
    id: "posthog",
    name: "PostHog",
    capabilities: POSTHOG_CAPABILITIES,
    async query(query) {
      const needs = queryNeeds(query);
      const result = emptyResult("posthog", query);
      const where = timeWhere(query);
      result.totals = await queryTotals(fetchImpl, host, options, query.metrics, where);

      if (needs.series && query.granularity) {
        const trunc = truncFn(query.granularity);
        const sql = `
          SELECT ${trunc}(timestamp) AS bucket,
                 count(DISTINCT distinct_id) AS visitors,
                 countIf(event = '$pageview') AS pageviews,
                 count(DISTINCT properties.$session_id) AS visits,
                 count() AS events
          FROM events
          WHERE ${where}
          GROUP BY bucket
          ORDER BY bucket
        `;
        const rows = await hogql(fetchImpl, host, options, sql);
        result.series = rows.map((row) => ({
          date: String(row[0] ?? ""),
          values: fromRow(query.metrics, {
            visitors: Number(row[1] ?? 0),
            pageviews: Number(row[2] ?? 0),
            visits: Number(row[3] ?? 0),
            events: Number(row[4] ?? 0),
          }),
        }));
      }

      if (needs.breakdown) {
        const expr = mapPosthogDimension(query.dimensions[0]);
        const sql = `
          SELECT ${expr} AS key,
                 count(DISTINCT distinct_id) AS visitors,
                 countIf(event = '$pageview') AS pageviews
          FROM events
          WHERE ${where}
          GROUP BY key
          ORDER BY pageviews DESC
          LIMIT ${query.limit}
        `;
        const rows = await hogql(fetchImpl, host, options, sql);
        result.breakdown = rows.map((row) => ({
          key: String(row[0] ?? "(none)"),
          label: String(row[0] ?? "(none)"),
          values: fromRow(query.metrics, {
            visitors: Number(row[1] ?? 0),
            pageviews: Number(row[2] ?? 0),
          }),
        }));
      }

      if (needs.previous) {
        const prev = previousRange(query.range);
        result.previous = {
          totals: await queryTotals(
            fetchImpl,
            host,
            options,
            query.metrics,
            `timestamp >= toDateTime('${iso(prev.from)}') AND timestamp <= toDateTime('${iso(prev.to)}')`,
          ),
        };
      }

      return result;
    },
    async realtime() {
      const rows = await hogql(
        fetchImpl,
        host,
        options,
        `SELECT count(DISTINCT distinct_id) FROM events WHERE timestamp >= now() - interval 5 minute`,
      );
      return { visitors: Number(rows[0]?.[0] ?? 0) };
    },
  });
}

async function queryTotals(
  fetchImpl: typeof fetch,
  host: string,
  options: PostHogConnectorOptions,
  metrics: MetricId[],
  where: string,
): Promise<Record<string, number>> {
  const sql = `
    SELECT
      count(DISTINCT distinct_id) AS visitors,
      countIf(event = '$pageview') AS pageviews,
      count(DISTINCT properties.$session_id) AS visits,
      count() AS events
    FROM events
    WHERE ${where}
  `;
  const rows = await hogql(fetchImpl, host, options, sql);
  const base = {
    visitors: Number(rows[0]?.[0] ?? 0),
    pageviews: Number(rows[0]?.[1] ?? 0),
    visits: Number(rows[0]?.[2] ?? 0),
    events: Number(rows[0]?.[3] ?? 0),
  };
  const values = fromRow(metrics, base);
  if (metrics.includes("viewsPerVisit")) {
    values.viewsPerVisit = base.visits ? base.pageviews / base.visits : 0;
  }
  if (metrics.includes("bounceRate")) {
    const bounceRows = await hogql(
      fetchImpl,
      host,
      options,
      `SELECT countIf(views = 1) / nullIf(count(), 0) * 100 FROM (
          SELECT properties.$session_id, countIf(event = '$pageview') AS views
          FROM events WHERE ${where}
          GROUP BY properties.$session_id
        )`,
    );
    values.bounceRate = Number(bounceRows[0]?.[0] ?? 0);
  }
  return values;
}

function fromRow(metrics: MetricId[], source: Record<string, number>): Record<string, number> {
  const values: Record<string, number> = {};
  for (const metric of metrics) {
    if (metric in source) values[metric] = source[metric] ?? 0;
  }
  return values;
}

function timeWhere(query: NormalizedQuery): string {
  return `timestamp >= toDateTime('${iso(query.range.from)}') AND timestamp <= toDateTime('${iso(query.range.to)}')`;
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 19);
}

function truncFn(granularity: string): string {
  if (granularity === "hour") return "toStartOfHour";
  if (granularity === "week") return "toStartOfWeek";
  if (granularity === "month") return "toStartOfMonth";
  return "toStartOfDay";
}

interface HogQLResponse {
  results?: unknown[][];
}

async function hogql(
  fetchImpl: typeof fetch,
  host: string,
  options: PostHogConnectorOptions,
  query: string,
): Promise<unknown[][]> {
  const payload = await providerJson<HogQLResponse>(
    `${host}/api/projects/${options.projectId}/query/`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${options.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    },
    "posthog",
    fetchImpl,
  );
  return payload.results ?? [];
}
