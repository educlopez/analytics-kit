import { describe, expect, it } from "vitest";
import { clearWidgets, defineWidget, getWidget, listWidgets } from "./registry.js";

describe("widget registry", () => {
  it("registers custom widgets for the dashboard to pick up later", () => {
    clearWidgets();
    const component = () => null;
    defineWidget({
      id: "revenue",
      title: "Revenue",
      required: { metrics: ["revenue"] },
      component,
    });
    expect(getWidget("revenue")?.title).toBe("Revenue");
    expect(listWidgets().map((widget) => widget.id)).toEqual(["revenue"]);
  });
});
