import {
  AnalyticsError,
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
} from "@analytics-kit/core";

export interface Ga4ConnectorOptions {
  /** OAuth or service-account access token */
  accessToken: string;
  /** GA4 property id, with or without the `properties/` prefix */
  propertyId: string;
  fetch?: typeof fetch;
}

const METRIC_MAP: Record<string, string> = {
  visitors: "activeUsers",
  pageviews: "screenPageViews",
  visits: "sessions",
  bounceRate: "bounceRate",
  avgDuration: "averageSessionDuration",
  viewsPerVisit: "screenPageViewsPerSession",
  events: "eventCount",
};

const DIMENSION_MAP: Record<string, string> = {
  path: "pagePath",
  referrer: "pageReferrer",
  country: "country",
  device: "deviceCategory",
  browser: "browser",
  os: "operatingSystem",
  source: "sessionSource",
  medium: "sessionMedium",
  campaign: "sessionCampaignName",
  eventName: "eventName",
  host: "hostName",
};

const TIME_MAP = {
  hour: "dateHour",
  day: "date",
  week: "yearWeek",
  month: "yearMonth",
} as const;

export const GA4_CAPABILITIES: ConnectorCapabilities = {
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

export function mapGa4Metric(metric: MetricId): string {
  const mapped = METRIC_MAP[metric];
  if (!mapped) throw new AnalyticsError("UNSUPPORTED", `GA4 does not map metric "${metric}".`);
  return mapped;
}

export function mapGa4Dimension(dimension: DimensionId): string {
  const mapped = DIMENSION_MAP[dimension];
  if (!mapped) throw new AnalyticsError("UNSUPPORTED", `GA4 does not map dimension "${dimension}".`);
  return mapped;
}

export function createGa4Connector(options: Ga4ConnectorOptions): AnalyticsConnector {
  const property = options.propertyId.startsWith("properties/")
    ? options.propertyId
    : `properties/${options.propertyId}`;
  const fetchImpl = options.fetch ?? fetch;

  return defineConnector({
    id: "ga4",
    name: "Google Analytics 4",
    capabilities: GA4_CAPABILITIES,
    async query(query) {
      const needs = queryNeeds(query);
      const result = emptyResult("ga4", query);
      const metrics = query.metrics.map((metric) => ({ name: mapGa4Metric(metric) }));
      const dateRanges = [
        { startDate: toIsoDate(query.range.from), endDate: toIsoDate(query.range.to) },
      ];

      const totals = await runReport(fetchImpl, options.accessToken, property, {
        dateRanges,
        metrics,
        dimensionFilter: dimensionFilter(query.filters),
      });
      result.totals = zip(query.metrics, totals.rows?.[0]?.metricValues);

      if (needs.series && query.granularity) {
        const series = await runReport(fetchImpl, options.accessToken, property, {
          dateRanges,
          metrics,
          dimensions: [{ name: TIME_MAP[query.granularity] }],
          dimensionFilter: dimensionFilter(query.filters),
          orderBys: [{ dimension: { dimensionName: TIME_MAP[query.granularity] } }],
        });
        result.series = (series.rows ?? []).map((row) => ({
          date: formatGa4Date(row.dimensionValues?.[0]?.value ?? ""),
          values: zip(query.metrics, row.metricValues),
        }));
      }

      if (needs.breakdown) {
        const name = mapGa4Dimension(query.dimensions[0]);
        const breakdown = await runReport(fetchImpl, options.accessToken, property, {
          dateRanges,
          metrics,
          dimensions: [{ name }],
          dimensionFilter: dimensionFilter(query.filters),
          limit: query.limit,
          orderBys: [{ metric: { metricName: mapGa4Metric(query.metrics[0]) }, desc: true }],
        });
        result.breakdown = (breakdown.rows ?? []).map((row) => ({
          key: row.dimensionValues?.[0]?.value || "(none)",
          label: row.dimensionValues?.[0]?.value || "(none)",
          values: zip(query.metrics, row.metricValues),
        }));
      }

      if (needs.previous) {
        const prev = previousRange(query.range);
        const previous = await runReport(fetchImpl, options.accessToken, property, {
          dateRanges: [{ startDate: toIsoDate(prev.from), endDate: toIsoDate(prev.to) }],
          metrics,
          dimensionFilter: dimensionFilter(query.filters),
        });
        result.previous = { totals: zip(query.metrics, previous.rows?.[0]?.metricValues) };
      }

      return result;
    },
    async realtime() {
      const body = await providerJson<Ga4Report>(
        `https://analyticsdata.googleapis.com/v1beta/${property}:runRealtimeReport`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${options.accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            metrics: [{ name: "activeUsers" }],
            dimensions: [{ name: "unifiedScreenName" }],
            limit: 8,
          }),
        },
        "ga4",
        fetchImpl,
      );
      return {
        visitors: Number(body.rows?.[0]?.metricValues?.[0]?.value ?? sumMetric(body, 0)),
        currentPages: (body.rows ?? []).map((row) => ({
          path: row.dimensionValues?.[0]?.value || "/",
          visitors: Number(row.metricValues?.[0]?.value ?? 0),
        })),
      };
    },
  });
}

interface Ga4Report {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
}

async function runReport(
  fetchImpl: typeof fetch,
  accessToken: string,
  property: string,
  body: Record<string, unknown>,
): Promise<Ga4Report> {
  return providerJson<Ga4Report>(
    `https://analyticsdata.googleapis.com/v1beta/${property}:runReport`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
    "ga4",
    fetchImpl,
  );
}

function zip(ids: MetricId[], values?: Array<{ value?: string }>): Record<string, number> {
  return Object.fromEntries(ids.map((id, index) => [id, Number(values?.[index]?.value ?? 0)]));
}

function sumMetric(body: Ga4Report, index: number): number {
  return (body.rows ?? []).reduce((sum, row) => sum + Number(row.metricValues?.[index]?.value ?? 0), 0);
}

export function formatGa4Date(value: string): string {
  if (/^\d{8}$/.test(value)) return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  if (/^\d{10}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:00:00Z`;
  }
  return value;
}

function dimensionFilter(filters: AnalyticsFilter[]): Record<string, unknown> | undefined {
  if (!filters.length) return undefined;
  const expressions = filters.map((filter) => {
    const field = mapGa4Dimension(filter.dimension);
    const values = Array.isArray(filter.value) ? filter.value : [filter.value];
    if (filter.op === "contains") {
      return {
        filter: {
          fieldName: field,
          stringFilter: { matchType: "CONTAINS", value: values[0], caseSensitive: false },
        },
      };
    }
    return {
      filter: {
        fieldName: field,
        inListFilter: { values, caseSensitive: false },
      },
    };
  });
  return expressions.length === 1 ? expressions[0] : { andGroup: { expressions } };
}
