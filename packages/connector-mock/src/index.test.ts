import { describe, expect, it } from "vitest";
import { createAnalyticsKitMockConnector, createMockConnector } from "./index.js";

describe("createMockConnector", () => {
  it("returns deterministic totals for the same seed and range", async () => {
    const a = createMockConnector({ seed: 7 });
    const b = createMockConnector({ seed: 7 });
    const query = {
      range: "7d" as const,
      metrics: ["visitors" as const, "pageviews" as const],
      granularity: "day" as const,
    };
    const ra = await a.query(query);
    const rb = await b.query(query);
    expect(ra.totals.visitors).toBe(rb.totals.visitors);
    expect(ra.series).toHaveLength(7);
    expect(ra.series[0]?.values.visitors).toBeGreaterThan(0);
  });

  it("hides bounce rate on the vercel profile", async () => {
    const vercel = createMockConnector({ profile: "vercel" });
    expect(vercel.capabilities.metrics.bounceRate).toBe(false);
    await expect(vercel.query({ range: "7d", metrics: ["bounceRate"] })).rejects.toThrow(
      /bounceRate/,
    );
  });

  it("returns realtime visitors", async () => {
    const mock = createMockConnector({ seed: 1 });
    const live = await mock.realtime?.();
    expect(live?.visitors).toBeGreaterThan(0);
    expect(live?.currentPages?.length).toBeGreaterThan(0);
  });

  it("uses this site's routes for the landing dataset", async () => {
    const connector = createAnalyticsKitMockConnector();
    expect(connector.name).toBe("analytics-kit-demo.vercel.app");
    const result = await connector.query({
      range: "7d",
      metrics: ["pageviews"],
      dimensions: ["path"],
    });
    expect(result.breakdown.some((row) => row.key === "/components/area-chart")).toBe(true);
    expect(result.breakdown[0]?.key).toBe("/");
  });

  it("breaks down campaigns on the full profile", async () => {
    const connector = createMockConnector({ profile: "full" });
    const result = await connector.query({
      range: "7d",
      metrics: ["visitors"],
      dimensions: ["campaign"],
    });
    expect(result.breakdown.some((row) => row.key === "launch")).toBe(true);
  });
});
