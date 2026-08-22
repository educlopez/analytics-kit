import {
  defineConnector,
  emptyResult,
  enumerateDays,
  fullCapabilities,
  mergeCapabilities,
  previousRange,
  queryNeeds,
  toIsoDate,
  type AnalyticsConnector,
  type AnalyticsResult,
  type BreakdownRow,
  type ConnectorCapabilities,
  type MetricId,
  type NormalizedQuery,
} from "@analytics-kit/core";

export type ProviderProfile = "full" | "plausible" | "vercel" | "ga4" | "umami" | "posthog";

export interface MockDataset {
  paths?: string[];
  referrers?: string[];
  countries?: string[];
  devices?: string[];
  browsers?: string[];
  os?: string[];
  events?: string[];
  campaigns?: string[];
  mediums?: string[];
}

export interface MockConnectorOptions {
  seed?: number;
  profile?: ProviderProfile;
  capabilities?: ConnectorCapabilities;
  siteName?: string;
  /** Multiplier on generated visitor volume. */
  scale?: number;
  dataset?: MockDataset;
}

const DEFAULT_DATASET: Required<MockDataset> = {
  paths: ["/", "/pricing", "/blog", "/blog/launch", "/docs", "/docs/quickstart", "/about"],
  referrers: ["google", "twitter", "github", "direct", "linkedin", "newsletter"],
  countries: ["US", "GB", "DE", "ES", "BR", "FR", "IN"],
  devices: ["Desktop", "Mobile", "Tablet"],
  browsers: ["Chrome", "Safari", "Firefox", "Edge"],
  os: ["macOS", "Windows", "iOS", "Android", "Linux"],
  events: ["signup", "cta_click", "purchase"],
  campaigns: ["launch", "docs", "spring", "brand"],
  mediums: ["organic", "social", "email", "referral"],
};

/** This site’s routes — used when live Vercel credentials are not available. */
export const DEMO_DATASET: Required<MockDataset> = {
  paths: [
    "/",
    "/docs",
    "/components",
    "/components/area-chart",
    "/components/line-chart",
    "/components/bar-chart",
    "/components/dashboard",
    "/components/metric-card",
    "/components/funnel-chart",
    "/llms.txt",
  ],
  referrers: ["github.com", "google", "x.com", "direct", "vercel.com", "npmjs.com", "cursor.com"],
  countries: ["US", "DE", "GB", "IN", "BR", "ES", "FR", "NL"],
  devices: ["Desktop", "Mobile", "Tablet"],
  browsers: ["Chrome", "Safari", "Firefox", "Edge"],
  os: ["macOS", "Windows", "iOS", "Android", "Linux"],
  events: ["install_copy", "component_preview", "registry_install", "docs_search"],
  campaigns: ["launch", "docs", "catalog", "brand"],
  mediums: ["organic", "social", "email", "referral"],
};

export const PROVIDER_PROFILES: Record<ProviderProfile, ConnectorCapabilities> = {
  full: fullCapabilities(),
  plausible: fullCapabilities(),
  ga4: fullCapabilities(),
  umami: mergeCapabilities(fullCapabilities(), {
    dimensions: { campaign: false, medium: false },
  }),
  posthog: mergeCapabilities(fullCapabilities(), {
    metrics: { bounceRate: true, avgDuration: true },
  }),
  vercel: mergeCapabilities(fullCapabilities(), {
    metrics: {
      bounceRate: false,
      avgDuration: false,
      viewsPerVisit: false,
    },
    dimensions: { host: false },
    realtime: false,
    previousPeriod: true,
  }),
};

export function createMockConnector(options: MockConnectorOptions = {}): AnalyticsConnector {
  const seed = options.seed ?? 42;
  const scale = options.scale ?? 1;
  const dataset = { ...DEFAULT_DATASET, ...options.dataset };
  const capabilities = options.capabilities ?? PROVIDER_PROFILES[options.profile ?? "full"];

  return defineConnector({
    id: options.profile ? `mock:${options.profile}` : "mock",
    name: options.siteName ?? `Mock (${options.profile ?? "full"})`,
    capabilities,
    async query(query) {
      return buildResult(query, seed, capabilities, dataset, scale);
    },
    async realtime() {
      const rng = mulberry32(seed + 99);
      return {
        visitors: Math.round((8 + Math.floor(rng() * 24)) * scale),
        currentPages: dataset.paths.slice(0, 4).map((path, i) => ({
          path,
          visitors: 1 + Math.floor(rng() * (8 - i) * scale),
        })),
      };
    },
  });
}

export function createDemoMockConnector(
  options: Omit<MockConnectorOptions, "dataset" | "siteName"> = {},
): AnalyticsConnector {
  return createMockConnector({
    seed: 21,
    profile: "vercel",
    scale: 1.4,
    ...options,
    siteName: "analytics-kit-demo",
    dataset: DEMO_DATASET,
  });
}

function buildResult(
  query: NormalizedQuery,
  seed: number,
  capabilities: ConnectorCapabilities,
  dataset: Required<MockDataset>,
  scale: number,
): AnalyticsResult {
  const days = enumerateDays(query.range.from, query.range.to);
  const needs = queryNeeds(query);
  const result = emptyResult("mock", query);
  const rng = mulberry32(
    hash(`${seed}:${toIsoDate(query.range.from)}:${toIsoDate(query.range.to)}`),
  );

  const series: AnalyticsResult["series"] = days.map((date, index) => {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 0.72 : 1;
    const trend = 0.85 + (index / Math.max(days.length, 1)) * 0.35;
    const visitors = Math.round((80 + rng() * 140) * weekend * trend * scale);
    const visits = Math.round(visitors * (1.05 + rng() * 0.2));
    const pageviews = Math.round(visits * (1.6 + rng() * 0.9));
    const bounceRate = 32 + rng() * 18;
    const avgDuration = 70 + rng() * 90;
    const events = Math.round(visitors * (0.08 + rng() * 0.12));
    const values: Record<string, number> = {};
    put(values, "visitors", visitors, query.metrics);
    put(values, "visits", visits, query.metrics);
    put(values, "pageviews", pageviews, query.metrics);
    put(values, "bounceRate", bounceRate, query.metrics);
    put(values, "avgDuration", avgDuration, query.metrics);
    put(values, "events", events, query.metrics);
    if (query.metrics.includes("viewsPerVisit")) {
      values.viewsPerVisit = visits ? pageviews / visits : 0;
    }
    return { date, values };
  });

  const totals: Record<string, number> = {};
  for (const metric of query.metrics) {
    if (metric === "bounceRate" || metric === "avgDuration" || metric === "viewsPerVisit") {
      totals[metric] = average(series.map((p) => p.values[metric] ?? 0));
    } else {
      totals[metric] = series.reduce((sum, p) => sum + (p.values[metric] ?? 0), 0);
    }
  }

  result.totals = totals;
  if (needs.series) result.series = series;

  if (needs.breakdown) {
    const dimension = query.dimensions[0] ?? "path";
    result.breakdown = breakdownFor(dimension, totals, query, rng, dataset).slice(0, query.limit);
  }

  if (needs.previous && capabilities.previousPeriod) {
    const prev = previousRange(query.range);
    const previous = buildResult(
      { ...query, range: prev, includePrevious: false, granularity: undefined, dimensions: [] },
      seed + 7,
      capabilities,
      dataset,
      scale,
    );
    result.previous = { totals: previous.totals };
  }

  return result;
}

function breakdownFor(
  dimension: string,
  totals: Record<string, number>,
  query: NormalizedQuery,
  rng: () => number,
  dataset: Required<MockDataset>,
): BreakdownRow[] {
  const keys =
    dimension === "path"
      ? dataset.paths
      : dimension === "referrer" || dimension === "source"
        ? dataset.referrers
        : dimension === "country"
          ? dataset.countries
          : dimension === "device"
            ? dataset.devices
            : dimension === "browser"
              ? dataset.browsers
              : dimension === "os"
                ? dataset.os
                : dimension === "eventName"
                  ? dataset.events
                  : dimension === "campaign"
                    ? dataset.campaigns
                    : dimension === "medium"
                      ? dataset.mediums
                      : dataset.paths;

  const weights = keys.map((_, i) => Math.max(0.12, 1.2 - i * 0.08) + rng() * 0.18);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  return keys.map((key, i) => {
    const share = weights[i] / weightSum;
    const values: Record<string, number> = {};
    for (const metric of query.metrics) {
      const total = totals[metric] ?? 0;
      values[metric] =
        metric === "bounceRate" || metric === "avgDuration" || metric === "viewsPerVisit"
          ? total * (0.85 + rng() * 0.3)
          : Math.round(total * share);
    }
    return { key, label: key, values };
  });
}

function put(
  values: Record<string, number>,
  metric: MetricId,
  value: number,
  requested: MetricId[],
) {
  if (requested.includes(metric)) values[metric] = value;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
