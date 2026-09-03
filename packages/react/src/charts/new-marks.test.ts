import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { projectSeries } from "./line-chart.js";
import { countryCoords, COUNTRY_COORDS } from "./country-coords.js";
import { globeOrientation, globeProject } from "./globe-chart.js";
import { MetricTabs } from "./metric-tabs.js";
import { EmptyState } from "../primitives/EmptyState.js";
import {
  EMPTY_STATE_VARIANTS,
  GLOBE_CHART_VARIANTS,
  LINE_CHART_VARIANTS,
  LINE_MULTI_VARIANTS,
  METRIC_TABS_VARIANTS,
} from "./variants.js";

describe("projectSeries", () => {
  it("continues a clean trend at its own slope", () => {
    const rising = [10, 20, 30, 40, 50];
    expect(projectSeries(rising, 3)).toEqual([60, 70, 80]);
  });

  it("never projects a negative count", () => {
    // A steep decline crosses zero inside the projected window, and a negative
    // visitor count says more about the fit than about the future.
    const falling = [100, 80, 60, 40, 20];
    expect(projectSeries(falling, 5).every((value) => value >= 0)).toBe(true);
    expect(projectSeries(falling, 5).at(-1)).toBe(0);
  });

  it("fits the tail, not the whole history", () => {
    // Flat for a long time, then rising. A window of 3 must follow the rise;
    // the full history would average it away.
    const values = [5, 5, 5, 5, 5, 5, 5, 10, 20, 30];
    expect(projectSeries(values, 1, 3)[0]).toBeGreaterThan(30);
    expect(projectSeries(values, 1, 10)[0]).toBeLessThan(35);
  });

  it("returns nothing it cannot support", () => {
    expect(projectSeries([1, 2, 3], 0)).toEqual([]);
    expect(projectSeries([7], 3)).toEqual([]);
    expect(projectSeries([], 3)).toEqual([]);
  });

  it("is flat for a flat series rather than drifting", () => {
    expect(projectSeries([42, 42, 42, 42], 3)).toEqual([42, 42, 42]);
  });
});

describe("country coordinates", () => {
  it("covers the codes providers actually report", () => {
    for (const code of ["US", "GB", "DE", "ES", "BR", "IN", "JP", "AU", "ZA"]) {
      expect(countryCoords(code), code).toBeDefined();
    }
    expect(Object.keys(COUNTRY_COORDS).length).toBeGreaterThan(200);
  });

  it("normalises the case providers send", () => {
    expect(countryCoords("us")).toEqual(countryCoords("US"));
    expect(countryCoords(" gb ")).toEqual(countryCoords("GB"));
  });

  it("returns undefined instead of a wrong place", () => {
    expect(countryCoords("ZZ")).toBeUndefined();
    expect(countryCoords("")).toBeUndefined();
  });

  it("holds every coordinate inside real latitude and longitude bounds", () => {
    for (const [code, [lat, lon]] of Object.entries(COUNTRY_COORDS)) {
      expect(Math.abs(lat), code).toBeLessThanOrEqual(90);
      expect(Math.abs(lon), code).toBeLessThanOrEqual(180);
    }
  });
});

describe("variant registration", () => {
  it("keeps the new line variants and marks dual as multi-series", () => {
    expect(LINE_CHART_VARIANTS).toContain("forecast");
    expect(LINE_CHART_VARIANTS).toContain("dual");
    // dual reads two keys off each row, so the catalog has to hand it dataKeys.
    expect(LINE_MULTI_VARIANTS).toContain("dual");
    expect(LINE_MULTI_VARIANTS).not.toContain("forecast");
  });

  it("gives every new mark a variant set", () => {
    for (const set of [GLOBE_CHART_VARIANTS, METRIC_TABS_VARIANTS, EMPTY_STATE_VARIANTS]) {
      expect(set.length).toBeGreaterThan(1);
      expect(new Set(set).size).toBe(set.length);
    }
  });
});

describe("metric tabs markup", () => {
  const metrics = [
    { id: "visitors", label: "Visitors", value: "4,191", spark: [1, 4, 2, 8] },
    { id: "pageviews", label: "Page views", value: "9,316", spark: [3, 3, 5, 1] },
  ];

  it("is a tablist with a roving tabindex", () => {
    const html = renderToStaticMarkup(
      createElement(MetricTabs, { metrics, activeId: "pageviews" }),
    );
    expect(html).toContain('role="tablist"');
    expect((html.match(/role="tab"/g) ?? []).length).toBe(2);
    expect((html.match(/aria-selected="true"/g) ?? []).length).toBe(1);
    // Exactly one stop, so Tab leaves the strip instead of walking every metric.
    expect((html.match(/tabindex="0"/g) ?? []).length).toBe(1);
    expect((html.match(/tabindex="-1"/g) ?? []).length).toBe(1);
  });

  it("selects the first metric when the host names none", () => {
    const html = renderToStaticMarkup(createElement(MetricTabs, { metrics }));
    const active = html.indexOf('aria-selected="true"');
    expect(html.slice(active, active + 400)).toContain("Visitors");
  });

  it("drops the spark when asked, and orients the stacked variant", () => {
    expect(
      renderToStaticMarkup(createElement(MetricTabs, { metrics, showSpark: false })),
    ).not.toContain("ak-mtab-spark");
    expect(
      renderToStaticMarkup(createElement(MetricTabs, { metrics, variant: "stacked" })),
    ).toContain('aria-orientation="vertical"');
  });
});

describe("empty state markup", () => {
  it("carries the icon by default and drops it on request", () => {
    expect(renderToStaticMarkup(createElement(EmptyState, { title: "None" }))).toContain(
      "ak-empty-icon",
    );
    expect(
      renderToStaticMarkup(createElement(EmptyState, { title: "None", icon: null })),
    ).not.toContain("ak-empty-icon");
  });

  it("omits the description and action rather than rendering empty boxes", () => {
    const bare = renderToStaticMarkup(createElement(EmptyState, { title: "None" }));
    expect(bare).not.toContain("ak-empty-desc");
    expect(bare).not.toContain("ak-empty-action");
  });
});

describe("globe projection", () => {
  it("centres the location its own orientation targets", () => {
    // The two are inverses: whatever phi/theta `globeOrientation` picks for a
    // location, `globeProject` must put that location in the middle of the
    // canvas, facing the camera. This is the pairing that was wrong — cobe's
    // spin composes the other way round, which put the hit targets 57px off
    // the drawn markers on a 720px canvas while still agreeing on y.
    for (const [lat, lon] of [
      [38, -97],
      [54, -2],
      [-14, -51],
      [35, 139],
      [0, 0],
      [-34, 151],
      [64, -18],
    ]) {
      const { phi, theta } = globeOrientation(lat, lon);
      const at = globeProject(lat, lon, phi, theta, 720);
      expect(Math.abs(at.x - 360), `lon ${lon}`).toBeLessThan(0.5);
      expect(at.front, `lon ${lon}`).toBe(true);
    }
  });

  it("puts a location on the far side behind the globe", () => {
    // Focused on the prime meridian, the antipode must report front: false so
    // its hit target is hidden and leaves the tab order.
    const { phi, theta } = globeOrientation(0, 0);
    expect(globeProject(0, 180, phi, theta, 720).front).toBe(false);
    expect(globeProject(0, 0, phi, theta, 720).front).toBe(true);
  });

  it("keeps every projected point inside the canvas", () => {
    const { phi, theta } = globeOrientation(38, -97);
    for (const [lat, lon] of Object.values(COUNTRY_COORDS)) {
      const at = globeProject(lat, lon, phi, theta, 720);
      expect(at.x).toBeGreaterThanOrEqual(0);
      expect(at.x).toBeLessThanOrEqual(720);
      expect(at.y).toBeGreaterThanOrEqual(0);
      expect(at.y).toBeLessThanOrEqual(720);
    }
  });

  it("clamps the tilt short of the poles", () => {
    // Straight down onto a pole is all distortion and no map.
    expect(Math.abs(globeOrientation(89, 0).theta)).toBeLessThan(Math.PI / 2);
    expect(Math.abs(globeOrientation(-89, 0).theta)).toBeLessThan(Math.PI / 2);
  });
});
