import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { candleActivity } from "./candlestick-chart.js";
import { CandlestickChart } from "./candlestick-chart.js";
import { findAnomalyIndexes } from "./line-chart.js";

const CHARTS_DIR = dirname(fileURLToPath(import.meta.url));
describe("chart markup contracts", () => {
  it("uses real candle volume and preserves the range fallback", () => {
    const base = { date: "2026-08-01", open: 10, high: 16, low: 8, close: 12 };
    expect(candleActivity([{ ...base, volume: 1_200 }])).toEqual([1_200]);
    expect(candleActivity([base])).toEqual([8]);
    expect(candleActivity([{ ...base, volume: -20 }])).toEqual([0]);
    expect(candleActivity([{ ...base, volume: Number.NaN }])).toEqual([8]);
    expect(candleActivity([{ ...base, volume: Number.POSITIVE_INFINITY }])).toEqual([8]);
    expect(
      candleActivity([{ ...base, high: Number.POSITIVE_INFINITY, volume: Number.NaN }]),
    ).toEqual([0]);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("renders %s candle volume through the finite OHLC fallback", (_label, volume) => {
    const markup = renderToStaticMarkup(
      createElement(CandlestickChart, {
        variant: "volume",
        data: [
          {
            date: "2026-08-01",
            open: 10,
            high: 16,
            low: 8,
            close: 12,
            volume,
          },
        ],
      }),
    );

    expect(markup).toContain('fill-opacity="0.45"');
    expect(markup).toContain('height="46"');
    expect(markup).not.toMatch(/NaN|Infinity/);
  });

  it("does not draw a minimum-height bar for zero or negative volume", () => {
    const markup = renderToStaticMarkup(
      createElement(CandlestickChart, {
        variant: "volume",
        data: [
          { date: "2026-08-01", open: 10, high: 16, low: 8, close: 12, volume: 0 },
          { date: "2026-08-02", open: 12, high: 17, low: 9, close: 11, volume: -20 },
          { date: "2026-08-03", open: 11, high: 18, low: 10, close: 16, volume: 500 },
        ],
      }),
    );
    expect(markup.match(/fill-opacity="0\.45"/g)).toHaveLength(1);
  });

  it("keeps candle geometry finite across opposite finite extremes", () => {
    const markup = renderToStaticMarkup(
      createElement(CandlestickChart, {
        variant: "volume",
        data: [
          {
            date: "2026-08-01",
            open: -Number.MAX_VALUE,
            high: Number.MAX_VALUE,
            low: -Number.MAX_VALUE,
            close: Number.MAX_VALUE,
          },
          {
            date: "2026-08-02",
            open: Number.MAX_VALUE,
            high: Number.MAX_VALUE,
            low: -Number.MAX_VALUE,
            close: -Number.MAX_VALUE,
            volume: Number.MAX_VALUE,
          },
        ],
      }),
    );

    expect(markup).not.toMatch(/NaN|Infinity/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("keeps candle geometry finite with %s OHLC values", (_label, malformed) => {
    const markup = renderToStaticMarkup(
      createElement(CandlestickChart, {
        data: [
          {
            date: "2026-08-01",
            open: malformed,
            high: malformed,
            low: malformed,
            close: malformed,
          },
          { date: "2026-08-02", open: 10, high: 16, low: 8, close: 12 },
        ],
      }),
    );

    expect(markup).not.toMatch(/NaN|Infinity/);
  });

  it("exposes the anomaly detector used to qualify provider previews", () => {
    const values = [10, 11, 9, 12, 10, 11, 10, 100, 9, 11, 10, 12, 9, 10];
    expect(findAnomalyIndexes(values)).toContain(7);
    expect(findAnomalyIndexes(Array.from({ length: 14 }, () => 10))).toEqual(new Set());
  });

  it.each(["pie-chart.tsx", "ring-chart.tsx", "sunburst-chart.tsx"])(
    "%s groups each swatch with its label",
    (file) => {
      const source = readFileSync(join(CHARTS_DIR, file), "utf8");
      expect(source).toContain('<span className="ak-legend-name">');
      expect(source).not.toMatch(/<li[^>]*>\s*<i\b/);
    },
  );

  it("does not rely on a global direct-child legend span rule", () => {
    const styles = readFileSync(join(CHARTS_DIR, "../styles.css"), "utf8");
    expect(styles).not.toContain(".ak-legend li > span");
  });
});
