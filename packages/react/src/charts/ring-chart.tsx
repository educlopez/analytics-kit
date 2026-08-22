import { cn } from "../lib/cn.js";
import { RING_CHART_VARIANTS, type ChartDatum, type RingChartVariant } from "./variants.js";

const PALETTE = [
  "var(--ak-chart-1, var(--chart-1))",
  "var(--ak-chart-2, var(--chart-2))",
  "var(--ak-chart-3, var(--chart-3))",
  "var(--ak-chart-4, var(--chart-4))",
  "var(--ak-chart-5, var(--chart-5))",
];

export function RingChart({
  data,
  dataKey = "value",
  labelKey = "label",
  variant = "stack",
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: RingChartVariant;
  className?: string;
}) {
  const rows = data.map((row) => ({
    label: String(row[labelKey] ?? ""),
    value: Number(row[dataKey] ?? 0),
  }));
  const max = Math.max(...rows.map((row) => row.value), 1);

  if (!rows.length) return <p className="ak-muted">No ring data.</p>;

  const cx = 90;
  const cy = 90;
  const nested = variant === "nested";

  return (
    <div className={cn("ak-rings", className)}>
      <svg viewBox="0 0 180 180" className="ak-gauge-svg" aria-hidden>
        {rows.slice(0, 5).map((row, index) => {
          const r = nested ? 74 - index * 12 : 62;
          const circ = 2 * Math.PI * r;
          const ratio = row.value / max;
          const width = nested ? 9 : variant === "track" ? 16 : 12;
          return (
            <g key={row.label}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ak-border)" strokeWidth={width} />
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={PALETTE[index % PALETTE.length]}
                strokeWidth={width}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - ratio)}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </g>
          );
        })}
      </svg>
      <ul className="ak-legend">
        {rows.slice(0, 5).map((row, index) => (
          <li key={row.label}>
            <i style={{ background: PALETTE[index % PALETTE.length] }} />
            <span>{row.label}</span>
            <strong>{Math.round(row.value).toLocaleString()}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { RING_CHART_VARIANTS };
export type { RingChartVariant };
