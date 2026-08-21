import { describe, expect, it, vi } from "vitest";
import { createGa4Connector, formatGa4Date, mapGa4Metric } from "./index.js";

describe("ga4 connector", () => {
  it("maps canonical metrics onto Data API names", () => {
    expect(mapGa4Metric("visitors")).toBe("activeUsers");
    expect(mapGa4Metric("pageviews")).toBe("screenPageViews");
    expect(formatGa4Date("20260821")).toBe("2026-08-21");
  });

  it("parses runReport rows", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { dimensions?: Array<{ name: string }> };
      if (body.dimensions?.[0]?.name === "date") {
        return json({
          rows: [
            {
              dimensionValues: [{ value: "20260821" }],
              metricValues: [{ value: "10" }, { value: "20" }],
            },
          ],
        });
      }
      if (body.dimensions?.[0]?.name === "pagePath") {
        return json({
          rows: [
            {
              dimensionValues: [{ value: "/docs" }],
              metricValues: [{ value: "8" }, { value: "16" }],
            },
          ],
        });
      }
      return json({
        rows: [{ metricValues: [{ value: "100" }, { value: "250" }] }],
      });
    });

    const connector = createGa4Connector({
      accessToken: "ya29.token",
      propertyId: "123",
      fetch: fetchImpl as unknown as typeof fetch,
    });

    const result = await connector.query({
      range: "7d",
      metrics: ["visitors", "pageviews"],
      dimensions: ["path"],
      granularity: "day",
    });

    expect(result.totals).toEqual({ visitors: 100, pageviews: 250 });
    expect(result.series[0]?.date).toBe("2026-08-21");
    expect(result.breakdown[0]?.key).toBe("/docs");
    expect(String((fetchImpl.mock.calls[0] ?? [])[0])).toContain("properties/123:runReport");
  });
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}
