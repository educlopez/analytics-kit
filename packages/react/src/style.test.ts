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
    expect(AREA_CHART_VARIANTS).toContain("dither");
    expect(AREA_CHART_VARIANTS).toContain("glow");
    expect(AREA_CHART_VARIANTS).toContain("hatched");
    expect(AREA_CHART_VARIANTS).toContain("bars");
    expect(AREA_CHART_VARIANTS).toContain("solid");
    expect(LINE_CHART_VARIANTS).toContain("dashed");
    expect(LINE_CHART_VARIANTS).toContain("dither");
    expect(LINE_CHART_VARIANTS).toContain("ping");
    expect(LINE_CHART_VARIANTS).toContain("rainbow");
    expect(LINE_CHART_VARIANTS).toContain("values");
    expect(BAR_CHART_VARIANTS).toContain("horizontal");
    expect(BAR_CHART_VARIANTS).toContain("dither");
    expect(BAR_CHART_VARIANTS).toContain("glow");
    expect(BAR_CHART_VARIANTS).toContain("gradient");
    expect(BAR_CHART_VARIANTS).toContain("duotone");
    expect(PIE_CHART_VARIANTS).toContain("donut");
    expect(PIE_CHART_VARIANTS).toContain("dither");
    expect(PIE_CHART_VARIANTS).toContain("rounded");
    expect(PIE_CHART_VARIANTS).toContain("radial");
    expect(PIE_CHART_VARIANTS).toContain("glow");
    expect(METRIC_CARD_VARIANTS).toContain("hero");
  });
});
