import { describe, expect, it } from "vitest";
import { createMockConnector } from "@analytics-kit/connector-mock";
import { createAnalyticsHandler } from "./index.js";

describe("createAnalyticsHandler", () => {
  it("returns connector capabilities on GET", async () => {
    const handler = createAnalyticsHandler({ connector: createMockConnector() });
    const response = await handler(new Request("https://app.test/api/analytics"));
    const body = await response.json();
    expect(body.id).toBe("mock");
    expect(body.capabilities.metrics.visitors).toBe(true);
  });

  it("runs queries on POST", async () => {
    const handler = createAnalyticsHandler({ connector: createMockConnector({ seed: 3 }) });
    const response = await handler(
      new Request("https://app.test/api/analytics", {
        method: "POST",
        body: JSON.stringify({ range: "7d", metrics: ["visitors"] }),
      }),
    );
    const body = await response.json();
    expect(body.totals.visitors).toBeGreaterThan(0);
    expect(body.meta.connectorId).toBe("mock");
  });
});
