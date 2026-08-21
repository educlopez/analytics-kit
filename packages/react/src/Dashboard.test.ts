import { describe, expect, it } from "vitest";
import { catalogDashboard, defaultDashboard } from "./Dashboard.js";
import { getWidget } from "./registry.js";

describe("built-in dashboards", () => {
  it("registers every default and catalog widget", () => {
    for (const item of [...defaultDashboard, ...catalogDashboard]) {
      expect(getWidget(item.widget), item.widget).toBeDefined();
    }
  });
});
