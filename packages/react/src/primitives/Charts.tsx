import { useId, useMemo, useState } from "react";
import type { BreakdownRow, SeriesPoint } from "@analytics-kit/core";
import { CHART_PALETTE } from "../style.js";

function svgId(reactId: string, prefix: string): string {
  return `${prefix}-${reactId.replace(/:/g, "")}`;
}

export function Timeseries({
  series,
  metric,
  height = 168,
}: {
  series: SeriesPoint[];
  metric: string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const reactId = useId();
  const clipId = svgId(reactId, "ak-clip");
  const fillId = svgId(reactId, "ak-fill");
  const chart = useMemo(() => {
    const width = 560;
    const pad = { t: 12, r: 8, b: 26, l: 8 };
    const values = series.map((point) => point.values[metric] ?? 0);
    const max = Math.max(...values, 1);
    const innerW = width - pad.l - pad.r;
    const innerH = height - pad.t - pad.b;
    const points = values.map((value, index) => {
      const x = pad.l + (index / Math.max(values.length - 1, 1)) * innerW;
      const y = pad.t + innerH - (value / max) * innerH;
      return { x, y, value, date: series[index]?.date ?? "" };
    });
    const line = points
      .map((point, i) => `${i ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(" ");
    const last = points.at(-1);
    const first = points[0];
    const area =
      first && last
        ? `${line} L${last.x.toFixed(1)},${pad.t + innerH} L${first.x.toFixed(1)},${pad.t + innerH} Z`
        : "";
    const ticks = [0, 0.5, 1].map((ratio) => pad.t + innerH - ratio * innerH);
    return { width, height, pad, points, line, area, max, ticks, innerH };
  }, [series, metric, height]);

  if (!series.length) return <p className="ak-muted">No series data.</p>;

  const active = hover != null ? chart.points[hover] : chart.points.at(-1);

  return (
    <div className="ak-chart">
      <svg
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        className="ak-chart-svg"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const index = Math.round(ratio * (chart.points.length - 1));
          setHover(Math.min(Math.max(index, 0), chart.points.length - 1));
        }}
      >
        <defs>
          <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--ak-chart-1)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--ak-chart-1)" stopOpacity="0.02" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect
              x={chart.pad.l}
              y={chart.pad.t}
              width={chart.width - chart.pad.l - chart.pad.r}
              height={chart.innerH}
            />
          </clipPath>
        </defs>
        {chart.ticks.map((y) => (
          <line
            key={y}
            x1={chart.pad.l}
            x2={chart.width - chart.pad.r}
            y1={y}
            y2={y}
            className="ak-chart-grid"
          />
        ))}
        <g clipPath={`url(#${clipId})`}>
          <path d={chart.area} fill={`url(#${fillId})`} />
          <path d={chart.line} fill="none" stroke="var(--ak-chart-1)" strokeWidth="2.4" />
        </g>
        {active ? (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={chart.pad.t}
              y2={chart.height - chart.pad.b}
              stroke="var(--ak-border)"
            />
            <circle cx={active.x} cy={active.y} r="4.5" fill="var(--ak-chart-1)" />
          </>
        ) : null}
        <text x={chart.pad.l} y={chart.height - 6} className="ak-chart-label">
          {chart.points[0]?.date.slice(0, 10)}
        </text>
        <text
          x={chart.width - chart.pad.r}
          y={chart.height - 6}
          textAnchor="end"
          className="ak-chart-label"
        >
          {chart.points.at(-1)?.date.slice(0, 10)}
        </text>
      </svg>
      {active ? (
        <div className="ak-chart-caption">
          <strong>{Math.round(active.value).toLocaleString()}</strong>
          <span className="ak-muted">{active.date.slice(0, 10)}</span>
        </div>
      ) : null}
    </div>
  );
}

export function RankedList({ rows, metric }: { rows: BreakdownRow[]; metric: string }) {
  const max = Math.max(...rows.map((row) => row.values[metric] ?? 0), 1);
  if (!rows.length) return <p className="ak-muted">No breakdown data.</p>;
  return (
    <ul className="ak-rank">
      {rows.map((row) => {
        const value = row.values[metric] ?? 0;
        return (
          <li key={row.key} className="ak-rank-row">
            <div className="ak-rank-top">
              <span className="ak-rank-label">{row.label ?? row.key}</span>
              <span className="ak-rank-value">{Math.round(value).toLocaleString()}</span>
            </div>
            <div className="ak-rank-track">
              <div className="ak-rank-fill" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryBars({ rows, metric }: { rows: BreakdownRow[]; metric: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!rows.length) return <p className="ak-muted">No breakdown data.</p>;
  const max = Math.max(...rows.map((row) => row.values[metric] ?? 0), 1);
  const height = 148;
  const pad = { t: 8, r: 8, b: 28, l: 8 };
  const innerH = height - pad.t - pad.b;
  const gap = 8;
  const barW = Math.min(48, (560 - pad.l - pad.r - gap * (rows.length - 1)) / rows.length);
  const active = hover != null ? rows[hover] : null;

  return (
    <div className="ak-chart">
      <svg viewBox="0 0 560 148" className="ak-chart-svg" onMouseLeave={() => setHover(null)}>
        {rows.map((row, index) => {
          const value = row.values[metric] ?? 0;
          const h = (value / max) * innerH;
          const x = pad.l + index * (barW + gap);
          const y = pad.t + innerH - h;
          return (
            <g key={row.key} onMouseEnter={() => setHover(index)}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 2)}
                rx="6"
                fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                opacity={hover == null || hover === index ? 1 : 0.45}
              />
              <text x={x + barW / 2} y={height - 8} textAnchor="middle" className="ak-chart-label">
                {(row.label ?? row.key).slice(0, 8)}
              </text>
            </g>
          );
        })}
      </svg>
      {active ? (
        <div className="ak-chart-caption">
          <strong>{Math.round(active.values[metric] ?? 0).toLocaleString()}</strong>
          <span className="ak-muted">{active.label ?? active.key}</span>
        </div>
      ) : null}
    </div>
  );
}

export function Donut({ rows, metric }: { rows: BreakdownRow[]; metric: string }) {
  const total = rows.reduce((sum, row) => sum + (row.values[metric] ?? 0), 0) || 1;
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="ak-donut">
      <div className="ak-donut-ring">
        <svg viewBox="0 0 120 120" className="ak-donut-svg">
          <g transform="translate(60,60) rotate(-90)">
            {rows.map((row, index) => {
              const value = row.values[metric] ?? 0;
              const length = (value / total) * circ;
              const dash = `${length} ${circ - length}`;
              const current = offset;
              offset += length;
              return (
                <circle
                  key={row.key}
                  r={radius}
                  cx="0"
                  cy="0"
                  fill="none"
                  stroke={CHART_PALETTE[index % CHART_PALETTE.length]}
                  strokeWidth="14"
                  strokeDasharray={dash}
                  strokeDashoffset={-current}
                />
              );
            })}
          </g>
        </svg>
        <div className="ak-donut-center">
          <strong>{Math.round(total).toLocaleString()}</strong>
          <span>total</span>
        </div>
      </div>
      <ul className="ak-legend">
        {rows.map((row, index) => (
          <li key={row.key}>
            <i style={{ background: CHART_PALETTE[index % CHART_PALETTE.length] }} />
            <span>{row.label ?? row.key}</span>
            <strong>{Math.round(row.values[metric] ?? 0).toLocaleString()}</strong>
          </li>
        ))}
      </ul>
    </div>
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
    <svg viewBox={`0 0 ${width} ${height}`} className="ak-spark">
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
      <path d={d} fill="none" stroke="var(--ak-chart-1)" strokeWidth="2" />
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

/** Names used in the shadcn registry recipes (Tremor / shadcn charts vocabulary). */
export const AreaChart = Timeseries;
export const BarList = RankedList;
export const BarChart = CategoryBars;
