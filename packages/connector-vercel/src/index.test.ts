import { describe, expect, it, vi } from "vitest";
import { buildRadialTimePreviewQuery } from "../../../src/catalog/previewQueries.js";
import { createVercelConnector, odataFilter, VERCEL_CAPABILITIES } from "./index.js";

describe("vercel connector", () => {
  it("builds OData filters", () => {
    expect(odataFilter([{ dimension: "path", op: "eq", value: "/blog" }])).toBe(
      "requestPath eq '/blog'",
    );
  });

  it("declares paid-plan-only UTM dimensions and events as unsupported", () => {
    expect(VERCEL_CAPABILITIES.dimensions.source).toBe(false);
    expect(VERCEL_CAPABILITIES.dimensions.medium).toBe(false);
    expect(VERCEL_CAPABILITIES.dimensions.campaign).toBe(false);
    expect(VERCEL_CAPABILITIES.dimensions.eventName).toBe(false);
    expect(VERCEL_CAPABILITIES.metrics.events).toBe(false);
    // Still-supported dimensions/metrics should stay untouched.
    expect(VERCEL_CAPABILITIES.dimensions.path).toBe(true);
    expect(VERCEL_CAPABILITIES.metrics.visitors).toBe(true);
  });

  it("rejects a query for a paid-plan-only dimension before hitting the network", async () => {
    const fetchImpl = vi.fn();
    const connector = createVercelConnector({
      token: "tok",
      projectId: "prj_1",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    await expect(
      connector.query({ range: "7d", metrics: ["visitors"], dimensions: ["source"] }),
    ).rejects.toThrow(/source/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("degrades a runtime 402 for one slice instead of failing the whole query", async () => {
    // Simulate capabilities being more permissive than the real account (e.g.
    // a caller overriding them), so the connector actually hits the network
    // and has to handle the 402 from Vercel itself.
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes("/visits/count")) {
        return json({ data: { pageviews: 1250, visitors: 980 } });
      }
      return new Response(JSON.stringify({ error: "Payment Required" }), { status: 402 });
    });
    const connector = createVercelConnector({
      token: "tok",
      projectId: "prj_1",
      fetch: fetchImpl as unknown as typeof fetch,
    });
    connector.capabilities = {
      ...VERCEL_CAPABILITIES,
      dimensions: { ...VERCEL_CAPABILITIES.dimensions, source: true },
    };

    const result = await connector.query({
      range: "7d",
      metrics: ["visitors", "pageviews"],
      dimensions: ["source"],
    });

    expect(result.totals).toEqual({ visitors: 980, pageviews: 1250 });
    expect(result.breakdown).toEqual([]);
  });

  it("maps visit counts into canonical totals", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes("/visits/count")) {
        return json({ data: { pageviews: 1250, visitors: 980 } });
      }
      if (String(url).includes("/visits/aggregate") && String(url).includes("by=day")) {
        return json({
          data: [{ timestamp: "2026-08-21T00:00:00.000Z", pageviews: 220, visitors: 180 }],
        });
      }
      if (String(url).includes("/visits/aggregate")) {
        return json({ data: [{ requestPath: "/pricing", pageviews: 400, visitors: 300 }] });
      }
      return json({ data: {} });
    });

    const connector = createVercelConnector({
      token: "tok",
      projectId: "prj_1",
      fetch: fetchImpl as unknown as typeof fetch,
    });

    const result = await connector.query({
      range: "7d",
      metrics: ["visitors", "pageviews"],
      dimensions: ["path"],
      granularity: "day",
    });

    expect(result.totals).toEqual({ visitors: 980, pageviews: 1250 });
    expect(result.series[0]?.values.visitors).toBe(180);
    expect(result.breakdown[0]?.key).toBe("/pricing");
  });

  it("sends the radial preview's honest completed-hour window", async () => {
    const aggregateUrls: URL[] = [];
    const fetchImpl = vi.fn(async (url: string) => {
      const parsed = new URL(String(url));
      if (parsed.pathname.endsWith("/visits/count")) {
        return json({ data: { pageviews: 12, visitors: 8 } });
      }
      if (parsed.pathname.endsWith("/visits/aggregate")) {
        aggregateUrls.push(parsed);
        return json({
          data: [
            {
              timestamp: "2026-08-27T13:00:00.000Z",
              pageviews: 5,
              visitors: 3,
            },
            {
              timestamp: "2026-08-27T14:00:00.000Z",
              pageviews: 7,
              visitors: 5,
            },
          ],
        });
      }
      return json({ data: {} });
    });
    const connector = createVercelConnector({
      token: "tok",
      projectId: "prj_1",
      fetch: fetchImpl as unknown as typeof fetch,
    });

    const previewQuery = buildRadialTimePreviewQuery(
      "visitors",
      new Date("2026-08-27T15:42:31.000Z"),
    );
    const result = await connector.query(previewQuery);

    expect(aggregateUrls).toHaveLength(1);
    expect(aggregateUrls[0]?.searchParams.get("by")).toBe("hour");
    expect(Number(aggregateUrls[0]?.searchParams.get("limit"))).toBeLessThanOrEqual(100);
    expect(aggregateUrls[0]?.searchParams.get("limit")).toBe("96");
    expect(aggregateUrls[0]?.searchParams.get("since")).toBe("2026-08-23T15:00:00.000Z");
    expect(aggregateUrls[0]?.searchParams.get("until")).toBe("2026-08-27T14:59:59.999Z");
    expect(result.series).toEqual([
      {
        date: "2026-08-27T13:00:00.000Z",
        values: { visitors: 3 },
      },
      {
        date: "2026-08-27T14:00:00.000Z",
        values: { visitors: 5 },
      },
    ]);
  });

  it("caps oversized aggregate requests at Vercel's 100-row maximum", async () => {
    let aggregateUrl: URL | undefined;
    const fetchImpl = vi.fn(async (url: string) => {
      const parsed = new URL(String(url));
      if (parsed.pathname.endsWith("/visits/aggregate")) aggregateUrl = parsed;
      return json({ data: [] });
    });
    const connector = createVercelConnector({
      token: "tok",
      projectId: "prj_1",
      fetch: fetchImpl as unknown as typeof fetch,
    });

    await connector.query({
      range: "7d",
      metrics: ["visitors"],
      granularity: "hour",
      limit: 101,
    });

    expect(aggregateUrl?.searchParams.get("limit")).toBe("100");
  });
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}
