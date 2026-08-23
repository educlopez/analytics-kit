import { describe, expect, it } from "vitest";
import {
  AnalyticsError,
  assertSupported,
  defaultGranularity,
  defineConnector,
  formatDuration,
  formatMetric,
  fullCapabilities,
  hasMetric,
  mergeCapabilities,
  missingRequirements,
  normalizeQuery,
  percentDelta,
  previousRange,
  resolveRange,
  serializeQuery,
  toIsoDate,
  withCache,
  withSampleFallback,
  type AnalyticsConnector,
} from "./index.js";

describe("resolveRange", () => {
  it("resolves 7d to seven inclusive days", () => {
    const now = new Date("2026-08-21T15:00:00.000Z");
    const range = resolveRange("7d", now);
    expect(toIsoDate(range.from)).toBe("2026-08-15");
    expect(toIsoDate(range.to)).toBe("2026-08-21");
    expect(range.preset).toBe("7d");
  });

  it("resolves custom ISO dates", () => {
    const range = resolveRange({ from: "2026-01-01", to: "2026-01-31" });
    expect(toIsoDate(range.from)).toBe("2026-01-01");
    expect(toIsoDate(range.to)).toBe("2026-01-31");
  });

  it("builds a previous period of the same length", () => {
    const range = resolveRange({
      from: "2026-08-15T00:00:00.000Z",
      to: "2026-08-21T23:59:59.999Z",
    });
    const prev = previousRange(range);
    expect(prev.to.getTime()).toBeLessThan(range.from.getTime());
    const duration = range.to.getTime() - range.from.getTime();
    const prevDuration = prev.to.getTime() - prev.from.getTime();
    expect(prevDuration).toBe(duration);
  });
});

describe("normalizeQuery", () => {
  it("dedupes metrics and fills defaults", () => {
    const query = normalizeQuery({
      range: "7d",
      metrics: ["visitors", "visitors", "pageviews"],
    });
    expect(query.metrics).toEqual(["visitors", "pageviews"]);
    expect(query.dimensions).toEqual([]);
    expect(query.limit).toBe(10);
    expect(query.includePrevious).toBe(false);
  });

  it("rejects empty metrics", () => {
    expect(() => normalizeQuery({ range: "7d", metrics: [] })).toThrow(AnalyticsError);
  });
});

describe("capabilities", () => {
  it("detects missing widget requirements", () => {
    const caps = mergeCapabilities(fullCapabilities(), {
      metrics: { bounceRate: false },
      realtime: false,
    });
    expect(hasMetric(caps, "visitors")).toBe(true);
    expect(missingRequirements(caps, { metrics: ["bounceRate"], realtime: true })).toEqual([
      "metric:bounceRate",
      "realtime",
    ]);
  });

  it("throws UNSUPPORTED for unavailable metrics", () => {
    const caps = mergeCapabilities(fullCapabilities(), { metrics: { bounceRate: false } });
    const query = normalizeQuery({ range: "7d", metrics: ["bounceRate"] });
    expect(() => assertSupported(caps, query, "vercel")).toThrowError(/bounceRate/);
  });
});

describe("defineConnector + cache", () => {
  it("stamps connector metadata onto results", async () => {
    const connector = defineConnector({
      id: "test",
      name: "Test",
      capabilities: fullCapabilities(),
      async query() {
        return {
          totals: { visitors: 12 },
          series: [],
          breakdown: [],
          meta: { connectorId: "ignored", range: { from: "", to: "" } },
        };
      },
    });
    const result = await connector.query({ range: "7d", metrics: ["visitors"] });
    expect(result.meta.connectorId).toBe("test");
    expect(result.totals.visitors).toBe(12);
  });

  it("dedupes in-flight queries", async () => {
    let calls = 0;
    const connector = withCache(
      defineConnector({
        id: "test",
        name: "Test",
        capabilities: fullCapabilities(),
        async query() {
          calls += 1;
          await new Promise((r) => setTimeout(r, 20));
          return {
            totals: { visitors: 1 },
            series: [],
            breakdown: [],
            meta: { connectorId: "test", range: { from: "", to: "" } },
          };
        },
      }),
      5_000,
    );
    const q = { range: "7d" as const, metrics: ["visitors" as const] };
    const [a, b] = await Promise.all([connector.query(q), connector.query(q)]);
    expect(calls).toBe(1);
    expect(a.totals.visitors).toBe(1);
    expect(b.totals.visitors).toBe(1);
    expect(serializeQuery(q)).toContain("visitors");
  });
});

describe("format", () => {
  it("formats built-in metric units", () => {
    expect(formatMetric("bounceRate", 42.2)).toBe("42%");
    expect(formatDuration(95)).toBe("1m 35s");
    expect(formatMetric("visitors", 12500)).toBe("12.5k");
  });

  it("computes percent deltas", () => {
    expect(percentDelta(120, 100)).toBe(20);
    expect(percentDelta(0, 0)).toBe(0);
    expect(percentDelta(10, 0)).toBeNull();
  });
});

describe("defaultGranularity", () => {
  it("picks hour/day/week from range length", () => {
    const now = new Date("2026-08-21T12:00:00Z");
    expect(defaultGranularity(resolveRange("24h", now))).toBe("hour");
    expect(defaultGranularity(resolveRange("30d", now))).toBe("day");
    expect(defaultGranularity(resolveRange("12mo", now))).toBe("week");
  });
});

describe("withSampleFallback", () => {
  const sampleConnector: AnalyticsConnector = defineConnector({
    id: "sample",
    name: "Sample",
    capabilities: fullCapabilities(),
    async query(query) {
      return {
        totals: Object.fromEntries(query.metrics.map((metric) => [metric, 99])),
        series: [],
        breakdown: query.dimensions.map((dimension) => ({
          key: dimension,
          values: { visitors: 99 },
        })),
        meta: { connectorId: "sample", range: { from: "", to: "" } },
      };
    },
  });

  it("reports the union of both connectors' capabilities", () => {
    const restricted = defineConnector({
      id: "primary",
      name: "Primary",
      capabilities: mergeCapabilities(fullCapabilities(), { metrics: { bounceRate: false } }),
      async query() {
        return {
          totals: {},
          series: [],
          breakdown: [],
          meta: { connectorId: "primary", range: { from: "", to: "" } },
        };
      },
    });
    const wrapped = withSampleFallback({ connector: restricted, sample: sampleConnector });
    expect(wrapped.capabilities.metrics.bounceRate).toBe(true);
  });

  it("falls back to the sample connector when the primary throws UNSUPPORTED", async () => {
    const restricted = defineConnector({
      id: "primary",
      name: "Primary",
      capabilities: mergeCapabilities(fullCapabilities(), { metrics: { bounceRate: false } }),
      async query() {
        throw new AnalyticsError("UNSUPPORTED", "nope");
      },
    });
    const wrapped = withSampleFallback({ connector: restricted, sample: sampleConnector });
    const result = await wrapped.query({ range: "7d", metrics: ["bounceRate"] });
    expect(result.totals.bounceRate).toBe(99);
    expect(result.meta.sample).toBe(true);
  });

  it("falls back to the sample connector when the primary returns no signal", async () => {
    const empty = defineConnector({
      id: "primary",
      name: "Primary",
      capabilities: fullCapabilities(),
      async query(query) {
        return {
          totals: Object.fromEntries(query.metrics.map((metric) => [metric, 0])),
          series: [],
          breakdown: [],
          meta: { connectorId: "primary", range: { from: "", to: "" } },
        };
      },
    });
    const wrapped = withSampleFallback({ connector: empty, sample: sampleConnector });
    const result = await wrapped.query({
      range: "7d",
      metrics: ["visitors"],
      includePrevious: true,
    });
    expect(result.totals.visitors).toBe(99);
    expect(result.meta.sample).toBe(true);
  });

  it("passes through real data untouched and unmarked", async () => {
    const live = defineConnector({
      id: "primary",
      name: "Primary",
      capabilities: fullCapabilities(),
      async query() {
        return {
          totals: { visitors: 12 },
          series: [],
          breakdown: [],
          meta: { connectorId: "primary", range: { from: "", to: "" } },
        };
      },
    });
    const wrapped = withSampleFallback({ connector: live, sample: sampleConnector });
    const result = await wrapped.query({
      range: "7d",
      metrics: ["visitors"],
      includePrevious: true,
    });
    expect(result.totals.visitors).toBe(12);
    expect(result.meta.sample).toBeUndefined();
  });
});
