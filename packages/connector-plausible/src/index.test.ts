import { describe, expect, it, vi } from "vitest";
import { createPlausibleConnector, mapPlausibleMetrics } from "./index.js";

describe("plausible connector", () => {
  it("maps canonical metrics onto Stats API names", () => {
    expect(mapPlausibleMetrics(["visitors", "bounceRate", "avgDuration"])).toEqual([
      "visitors",
      "bounce_rate",
      "visit_duration",
    ]);
  });

  it("queries totals, series and breakdown", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { dimensions?: string[] };
      if (body.dimensions?.[0]?.startsWith("time:")) {
        return json({
          results: [
            { metrics: [10, 20], dimensions: ["2026-08-20"] },
            { metrics: [12, 24], dimensions: ["2026-08-21"] },
          ],
        });
      }
      if (body.dimensions?.[0] === "event:page") {
        return json({ results: [{ metrics: [22, 40], dimensions: ["/pricing"] }] });
      }
      return json({ results: [{ metrics: [22, 44], dimensions: [] }] });
    });

    const connector = createPlausibleConnector({
      apiKey: "test",
      siteId: "example.com",
      fetch: fetchImpl as unknown as typeof fetch,
    });

    const result = await connector.query({
      range: "7d",
      metrics: ["visitors", "pageviews"],
      dimensions: ["path"],
      granularity: "day",
    });

    expect(result.totals).toEqual({ visitors: 22, pageviews: 44 });
    expect(result.series).toHaveLength(2);
    expect(result.breakdown[0]?.key).toBe("/pricing");
    expect(fetchImpl).toHaveBeenCalled();
    const firstCall = (fetchImpl.mock.calls[0] ?? []) as unknown[];
    expect(String(firstCall[0])).toContain("/api/v2/query");
  });
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
