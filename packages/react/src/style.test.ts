import { describe, expect, it } from "vitest";
import {
  AREA_CHART_VARIANTS,
  BAR_CHART_VARIANTS,
  LINE_CHART_VARIANTS,
  METRIC_CARD_VARIANTS,
  PIE_CHART_VARIANTS,
} from "./charts/variants.js";

describe("chart variants", () => {
  it("exposes visual forms, not color themes", () => {
    expect(AREA_CHART_VARIANTS).toContain("gradient");
    expect(AREA_CHART_VARIANTS).toContain("step");
    expect(LINE_CHART_VARIANTS).toContain("dashed");
    expect(BAR_CHART_VARIANTS).toContain("horizontal");
    expect(PIE_CHART_VARIANTS).toContain("donut");
    expect(METRIC_CARD_VARIANTS).toContain("hero");
  });
});
