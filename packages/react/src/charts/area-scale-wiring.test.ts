import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => children,
  AreaChart: ({ children }: { children?: ReactNode }) =>
    createElement("svg", { "data-area-chart": true }, children),
  Area: () => createElement("i", { "data-area": true }),
  Brush: () => createElement("i", { "data-brush": true }),
  CartesianGrid: () => createElement("i", { "data-grid": true }),
  Tooltip: () => null,
  XAxis: () => createElement("i", { "data-x-axis": true }),
  YAxis: ({ scale, hide }: { scale?: unknown; hide?: boolean }) =>
    createElement("i", {
      "data-y-axis-scale": typeof scale === "function" ? "custom" : String(scale),
      "data-y-axis-hidden": String(Boolean(hide)),
    }),
}));

import { AreaChart, ridgeGeometry } from "./area-chart.js";

const rows = [
  { date: "2026-08-01", value: -8, visitors: 5, views: 12 },
  { date: "2026-08-02", value: 0, visitors: 8, views: 9 },
  { date: "2026-08-03", value: 18, visitors: 4, views: 15 },
];

function render(variant: "band" | "stacked" | "stream" | "spark") {
  return renderToStaticMarkup(
    createElement(AreaChart, {
      data: rows,
      dataKeys: ["visitors", "views"],
      previous:
        variant === "band" ? rows.map((row) => ({ ...row, value: row.value + 3 })) : undefined,
      variant,
      scale: "symlog",
    }),
  );
}

function renderRidge(scale: "linear" | "log" | "symlog", values: number[] = [0, 1, 1_000]) {
  return renderToStaticMarkup(
    createElement(AreaChart, {
      data: values.map((visitors, index) => ({ date: `2026-08-${index + 1}`, visitors })),
      dataKeys: ["visitors"],
      variant: "ridge",
      scale,
    }),
  );
}

function ridgePolylineYs(markup: string): number[] {
  const points = /<polyline[^>]*points="([^"]+)"/.exec(markup)?.[1];
  if (!points) throw new Error("Expected rendered ridge polyline points");
  return points.split(" ").map((point) => Number(point.split(",")[1]));
}

describe("AreaChart scale wiring", () => {
  it.each(["band", "stacked"] as const)("wires a visible custom axis for %s", (variant) => {
    const markup = render(variant);
    expect(markup).toContain('data-y-axis-scale="custom"');
    expect(markup).toContain('data-y-axis-hidden="false"');
  });

  it.each(["stream", "spark"] as const)(
    "wires a hidden custom axis for chrome-free %s",
    (variant) => {
      const markup = render(variant);
      expect(markup).toContain('data-y-axis-scale="custom"');
      expect(markup).toContain('data-y-axis-hidden="true"');
    },
  );

  it("applies symlog to ridge geometry instead of linear normalization", () => {
    const linear = ridgeGeometry([0, 1, 1_000], "linear");
    const symlog = ridgeGeometry([0, 1, 1_000], "symlog");
    const linearMiddleY = Number(linear.points.split(" ")[1].split(",")[1]);
    const symlogMiddleY = Number(symlog.points.split(" ")[1].split(",")[1]);

    expect(symlog.points).not.toBe(linear.points);
    expect(symlogMiddleY).toBeLessThan(linearMiddleY);

    const linearMarkup = renderRidge("linear");
    const symlogMarkup = renderRidge("symlog");
    expect(symlogMarkup).not.toBe(linearMarkup);
    expect(symlogMarkup).toContain(`points="${symlog.points}"`);
  });

  it("keeps non-positive ridge values finite and at the log floor", () => {
    const log = ridgeGeometry([-10, 0, 1, 100], "log");
    const ys = log.points.split(" ").map((point) => Number(point.split(",")[1]));

    expect(ys.slice(0, 2)).toEqual([46, 46]);
    expect(ys.every(Number.isFinite)).toBe(true);
    expect(log.points).not.toMatch(/NaN|Infinity/);
  });

  it("keeps zero and negative ridge values finite on symlog", () => {
    const symlog = ridgeGeometry([-100, 0, 100], "symlog");
    const ys = symlog.points.split(" ").map((point) => Number(point.split(",")[1]));

    expect(ys.every(Number.isFinite)).toBe(true);
    expect(ys[0]).toBeGreaterThan(symlog.baseline);
    expect(ys[1]).toBeCloseTo(symlog.baseline, 2);
    expect(ys[2]).toBeLessThan(symlog.baseline);
  });

  it("keeps the zero baseline and rendered geometry finite across opposite extremes", () => {
    const geometry = ridgeGeometry([-Number.MAX_VALUE, 0, Number.MAX_VALUE], "linear");
    const markup = renderRidge("linear", [-Number.MAX_VALUE, 0, Number.MAX_VALUE]);

    expect(geometry.points).not.toMatch(/NaN|Infinity/);
    expect(geometry.baseline).toBeCloseTo(23);
    expect(geometry.points).toBe("0.00,46.00 50.00,23.00 100.00,0.00");
    expect(ridgePolylineYs(markup)).toEqual([46, 23, 0]);
    expect(markup).toContain('points="0,23 ');
    expect(markup).not.toMatch(/NaN|Infinity/);
  });

  it("uses logarithmic spacing for rendered ridge values", () => {
    const logYs = ridgePolylineYs(renderRidge("log", [1, 10, 100]));
    const linearYs = ridgePolylineYs(renderRidge("linear", [1, 10, 100]));

    expect(logYs).toEqual([46, 23, 0]);
    expect(linearYs[1]).toBeGreaterThan(logYs[1]);
  });

  it("renders non-finite log ridge input at the finite floor", () => {
    const values = [-10, Number.NaN, Number.POSITIVE_INFINITY, 1, 100];
    const markup = renderRidge("log", values);

    expect(ridgePolylineYs(markup)).toEqual([46, 46, 46, 46, 0]);
    expect(markup).not.toMatch(/NaN|Infinity/);
  });
});
