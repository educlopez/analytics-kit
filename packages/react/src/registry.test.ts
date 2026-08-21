import { describe, expect, it } from "vitest";
import { defineWidget, getWidget } from "./registry.js";

describe("widget registry", () => {
  it("registers custom widgets for the dashboard to pick up later", () => {
    const component = () => null;
    defineWidget({
      id: "revenue-custom-test",
      title: "Revenue",
      required: { metrics: ["revenue"] },
      component,
    });
    expect(getWidget("revenue-custom-test")?.title).toBe("Revenue");
  });
});
