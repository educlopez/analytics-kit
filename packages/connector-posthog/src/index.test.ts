import { describe, expect, it, vi } from "vitest";
import { createPostHogConnector, mapPosthogDimension } from "./index.js";

describe("posthog connector", () => {
  it("maps dimensions onto HogQL expressions", () => {
    expect(mapPosthogDimension("path")).toBe("properties.$current_url");
    expect(mapPosthogDimension("eventName")).toBe("event");
  });

  it("parses HogQL totals", async () => {
    const fetchImpl = vi.fn(async () => json({ results: [[42, 100, 50, 120]] }));

    const connector = createPostHogConnector({
      apiKey: "phx_test",
      projectId: "123",
      fetch: fetchImpl as unknown as typeof fetch,
    });

    const result = await connector.query({
      range: "7d",
      metrics: ["visitors", "pageviews", "visits"],
    });

    expect(result.totals).toEqual({ visitors: 42, pageviews: 100, visits: 50 });
    expect(String((fetchImpl.mock.calls[0] ?? [])[0])).toContain("/api/projects/123/query/");
  });
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}
