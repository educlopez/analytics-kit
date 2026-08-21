import { useMemo, useState } from "react";
import type { SeriesPoint } from "@analytics-kit/core";

export function Timeseries({
  series,
  metric,
}: {
  series: SeriesPoint[];
  metric: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const chart = useMemo(() => {
    const width = 560;
    const height = 160;
    const pad = { t: 14, r: 12, b: 24, l: 12 };
    const values = series.map((point) => point.values[metric] ?? 0);
    const max = Math.max(...values, 1);
    const innerW = width - pad.l - pad.r;
    const innerH = height - pad.t - pad.b;
    const points = values.map((value, index) => {
      const x = pad.l + (index / Math.max(values.length - 1, 1)) * innerW;
      const y = pad.t + innerH - (value / max) * innerH;
      return { x, y, value, date: series[index]?.date ?? "" };
    });
    const line = points.map((point, i) => `${i ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
    const last = points.at(-1);
    const first = points[0];
    const area = first && last
      ? `${line} L${last.x.toFixed(1)},${pad.t + innerH} L${first.x.toFixed(1)},${pad.t + innerH} Z`
      : "";
    return { width, height, pad, points, line, area, max };
  }, [series, metric]);

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
          <linearGradient id="akArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--ak-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--ak-accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={chart.area} fill="url(#akArea)" />
        <path d={chart.line} fill="none" stroke="var(--ak-accent)" strokeWidth="2.5" />
        {active ? (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={chart.pad.t}
              y2={chart.height - chart.pad.b}
              stroke="var(--ak-border)"
            />
            <circle cx={active.x} cy={active.y} r="4" fill="var(--ak-accent)" />
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

export function RankedList({
  rows,
  metric,
}: {
  rows: Array<{ key: string; label?: string; values: Record<string, number> }>;
  metric: string;
}) {
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

export function Donut({
  rows,
  metric,
}: {
  rows: Array<{ key: string; label?: string; values: Record<string, number> }>;
  metric: string;
}) {
  const total = rows.reduce((sum, row) => sum + (row.values[metric] ?? 0), 0) || 1;
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const palette = ["var(--ak-accent)", "#7ee0c6", "#f5c16c", "#f07178", "#b4a7ff"];

  return (
    <div className="ak-donut">
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
                stroke={palette[index % palette.length]}
                strokeWidth="14"
                strokeDasharray={dash}
                strokeDashoffset={-current}
              />
            );
          })}
        </g>
      </svg>
      <ul className="ak-legend">
        {rows.map((row, index) => (
          <li key={row.key}>
            <i style={{ background: palette[index % palette.length] }} />
            <span>{row.label ?? row.key}</span>
            <strong>{Math.round(row.values[metric] ?? 0).toLocaleString()}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values }: { values: number[] }) {
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
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="ak-spark">
      <path d={d} fill="none" stroke="var(--ak-accent)" strokeWidth="2" />
    </svg>
  );
}
