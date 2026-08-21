import { describe, expect, it, vi } from "vitest";
import { createVercelConnector, odataFilter } from "./index.js";

describe("vercel connector", () => {
  it("builds OData filters", () => {
    expect(
      odataFilter([{ dimension: "path", op: "eq", value: "/blog" }]),
    ).toBe("requestPath eq '/blog'");
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
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}
