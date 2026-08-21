import { describe, expect, it, vi } from "vitest";
import { createUmamiConnector, mapUmamiDimension } from "./index.js";

describe("umami connector", () => {
  it("maps dimensions onto Umami metric types", () => {
    expect(mapUmamiDimension("path")).toBe("url");
    expect(mapUmamiDimension("country")).toBe("country");
  });

  it("derives bounce rate and duration from stats", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes("/stats")) {
        return json({
          pageviews: { value: 200 },
          visitors: { value: 80 },
          visits: { value: 100 },
          bounces: { value: 40 },
          totaltime: { value: 5000 },
        });
      }
      return json([]);
    });

    const connector = createUmamiConnector({
      apiKey: "um_test",
      websiteId: "web_1",
      fetch: fetchImpl as unknown as typeof fetch,
    });

    const result = await connector.query({
      range: "7d",
      metrics: ["visitors", "bounceRate", "avgDuration"],
    });

    expect(result.totals.visitors).toBe(80);
    expect(result.totals.bounceRate).toBe(40);
    expect(result.totals.avgDuration).toBe(50);
  });
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}
