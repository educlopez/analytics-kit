import { describe, expect, it } from "vitest";
import {
  AREA_CHART_VARIANTS,
  BAR_CHART_VARIANTS,
  CANDLESTICK_CHART_VARIANTS,
  CHOROPLETH_CHART_VARIANTS,
  COMPOSED_CHART_VARIANTS,
  FUNNEL_CHART_VARIANTS,
  GAUGE_CHART_VARIANTS,
  HEATMAP_CHART_VARIANTS,
  LINE_CHART_VARIANTS,
  LIVE_LINE_CHART_VARIANTS,
  METRIC_CARD_VARIANTS,
  PIE_CHART_VARIANTS,
  PROFIT_LOSS_CHART_VARIANTS,
  RADAR_CHART_VARIANTS,
  RING_CHART_VARIANTS,
  SANKEY_CHART_VARIANTS,
  SCATTER_CHART_VARIANTS,
  SUNBURST_CHART_VARIANTS,
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
    expect(FUNNEL_CHART_VARIANTS).toContain("tape");
    expect(RADAR_CHART_VARIANTS).toContain("dither");
    expect(COMPOSED_CHART_VARIANTS).toContain("overlay");
    expect(GAUGE_CHART_VARIANTS).toContain("ring");
    expect(SCATTER_CHART_VARIANTS).toContain("bubble");
    expect(SANKEY_CHART_VARIANTS).toContain("dither");
    expect(CANDLESTICK_CHART_VARIANTS).toContain("hollow");
    expect(CHOROPLETH_CHART_VARIANTS).toContain("tiles");
    expect(LIVE_LINE_CHART_VARIANTS).toContain("stream");
    expect(RING_CHART_VARIANTS).toContain("nested");
    expect(HEATMAP_CHART_VARIANTS).toContain("calendar");
    expect(SUNBURST_CHART_VARIANTS).toContain("burst");
    expect(PROFIT_LOSS_CHART_VARIANTS).toContain("bars");
    expect(METRIC_CARD_VARIANTS).toContain("hero");
  });
});
