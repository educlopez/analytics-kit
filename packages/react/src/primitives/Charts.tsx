import type { BreakdownRow, SeriesPoint } from "@analytics-kit/core";
import { useId } from "react";
import { AreaChart, type AreaChartVariant } from "../charts/area-chart.js";
import { BarChart, type BarChartVariant } from "../charts/bar-chart.js";
import { PieChart, type PieChartVariant } from "../charts/pie-chart.js";
import { type BarListVariant } from "../charts/variants.js";

function svgId(reactId: string, prefix: string): string {
  return `${prefix}-${reactId.replace(/:/g, "")}`;
}

export function Timeseries({
  series,
  metric,
  variant = "gradient",
}: {
  series: SeriesPoint[];
  metric: string;
  variant?: AreaChartVariant;
}) {
  return (
    <AreaChart
      data={series.map((point) => ({ date: point.date, value: point.values[metric] ?? 0 }))}
      variant={variant}
      config={{ value: { label: metric, color: "var(--ak-chart-1, var(--chart-1))" } }}
    />
  );
}

export function RankedList({
  rows,
  metric,
  variant = "bar",
}: {
  rows: BreakdownRow[];
  metric: string;
  variant?: BarListVariant;
}) {
  const max = Math.max(...rows.map((row) => row.values[metric] ?? 0), 1);
  if (!rows.length) return <p className="ak-muted">No breakdown data.</p>;
  if (variant === "table") {
    return <BreakdownTable rows={rows} metric={metric} />;
  }
  return (
    <ul className={variant === "compact" ? "ak-rank ak-rank-compact" : "ak-rank"}>
      {rows.map((row) => {
        const value = row.values[metric] ?? 0;
        return (
          <li key={row.key} className="ak-rank-row">
            <div className="ak-rank-top">
              <span className="ak-rank-label">{row.label ?? row.key}</span>
              <span className="ak-rank-value">{Math.round(value).toLocaleString()}</span>
            </div>
            {variant === "compact" ? null : (
              <div className="ak-rank-track">
                <div className="ak-rank-fill" style={{ width: `${(value / max) * 100}%` }} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryBars({
  rows,
  metric,
  variant = "rounded",
}: {
  rows: BreakdownRow[];
  metric: string;
  variant?: BarChartVariant;
}) {
  return (
    <BarChart
      data={rows.map((row) => ({
        label: row.label ?? row.key,
        value: row.values[metric] ?? 0,
      }))}
      variant={variant}
      config={{ value: { label: metric, color: "var(--ak-chart-1, var(--chart-1))" } }}
    />
  );
}

export function Donut({
  rows,
  metric,
  variant = "donut",
}: {
  rows: BreakdownRow[];
  metric: string;
  variant?: PieChartVariant;
}) {
  return (
    <PieChart
      data={rows.map((row) => ({
        label: row.label ?? row.key,
        value: row.values[metric] ?? 0,
      }))}
      variant={variant}
    />
  );
}

export function Sparkline({ values, fill = false }: { values: number[]; fill?: boolean }) {
  const fillId = svgId(useId(), "ak-spark");
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const width = 120;
  const height = 36;
  const d = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  return (
    // The number beside it already carries the value; the shape is trend garnish,
    // so it stays out of the accessibility tree rather than reading as an unnamed graphic.
    <svg
      viewBox={`0 0 ${width} ${height}`}
      // The CSS pins the height, so let the path stretch to whatever width the
      // card gives it rather than scaling both axes together.
      preserveAspectRatio="none"
      className="ak-spark"
      aria-hidden="true"
    >
      {fill ? (
        <>
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--ak-chart-1)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--ak-chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${fillId})`} />
        </>
      ) : null}
      <path
        d={d}
        fill="none"
        stroke="var(--ak-chart-1)"
        strokeWidth="2"
        // Non-uniform scaling would squash the stroke along with the path.
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function BreakdownTable({ rows, metric }: { rows: BreakdownRow[]; metric: string }) {
  const total = rows.reduce((sum, row) => sum + (row.values[metric] ?? 0), 0) || 1;
  const max = Math.max(...rows.map((row) => row.values[metric] ?? 0), 1);
  if (!rows.length) return <p className="ak-muted">No breakdown data.</p>;
  return (
    <table className="ak-table">
      <tbody>
        {rows.map((row) => {
          const value = row.values[metric] ?? 0;
          return (
            <tr key={row.key}>
              <th>{row.label ?? row.key}</th>
              <td className="ak-table-bar">
                <div className="ak-rank-track">
                  <div className="ak-rank-fill" style={{ width: `${(value / max) * 100}%` }} />
                </div>
              </td>
              <td>{Math.round(value).toLocaleString()}</td>
              <td className="ak-muted">{Math.round((value / total) * 100)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function Tracker({ values }: { values: number[] }) {
  if (!values.length) return <p className="ak-muted">No series data.</p>;
  const max = Math.max(...values, 1);
  return (
    <div className="ak-tracker" role="img" aria-label="Daily activity">
      {values.map((value, index) => {
        const intensity = value / max;
        return (
          <span
            key={index}
            className="ak-tracker-cell"
            title={String(Math.round(value))}
            style={{ opacity: 0.18 + intensity * 0.82 }}
          />
        );
      })}
    </div>
  );
}

export { AreaChart } from "../charts/area-chart.js";
export { BarChart } from "../charts/bar-chart.js";
export { LineChart } from "../charts/line-chart.js";
export { PieChart } from "../charts/pie-chart.js";
export const BarList = RankedList;
