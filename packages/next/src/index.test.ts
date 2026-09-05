import { describe, expect, it } from "vitest";
import { createMockConnector } from "@wingtics/connector-mock";
import { createAnalyticsHandler, createRouteHandlers } from "./index.js";

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

describe("unsupported methods", () => {
  // Next answers an unexported verb itself, with an empty 405 and no content
  // type. Every other failure on this endpoint is JSON, so this one has to be
  // too or a client cannot use one parser for the whole surface.
  it("answers a JSON 405 with a code, a hint and Allow", async () => {
    const handlers = createRouteHandlers({ connector: createMockConnector({ seed: 3 }) });
    const response = await handlers.DELETE(
      new Request("https://example.test/api/analytics", { method: "DELETE" }),
    );
    expect(response.status).toBe(405);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("allow")).toBe("GET, POST, OPTIONS");
    const body = (await response.json()) as { error: string; code: string; hint: string };
    expect(body.code).toBe("METHOD_NOT_ALLOWED");
    expect(body.error).toContain("DELETE");
    expect(body.hint).toBeTruthy();
  });

  it("exports every verb it answers for", () => {
    const handlers = createRouteHandlers({ connector: createMockConnector({ seed: 3 }) });
    for (const verb of ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"] as const) {
      expect(typeof handlers[verb], verb).toBe("function");
    }
  });
});
