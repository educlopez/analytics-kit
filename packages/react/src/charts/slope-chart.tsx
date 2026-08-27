import { formatNumber, PALETTE } from "./chart.js";
import { SLOPE_CHART_VARIANTS, type ChartDatum, type SlopeChartVariant } from "./variants.js";

/**
 * Two dated axes joined by one line per item.
 *
 * The slope *is* the change, and crossings are the story. A grouped bar chart
 * shows the same two numbers while hiding both.
 */
export function SlopeChart({
  data,
  fromKey = "from",
  toKey = "to",
  labelKey = "label",
  fromLabel = "Before",
  toLabel = "After",
  variant = "paired",
  height = 260,
  className,
}: {
  data: ChartDatum[];
  fromKey?: string;
  toKey?: string;
  labelKey?: string;
  fromLabel?: string;
  toLabel?: string;
  variant?: SlopeChartVariant;
  height?: number;
  className?: string;
}) {
  const rows = data.map((row) => ({
    label: String(row[labelKey] ?? ""),
    from: Number(row[fromKey] ?? 0),
    to: Number(row[toKey] ?? 0),
  }));

  if (!rows.length) return <p className="ak-muted">No slope data.</p>;

  const values = rows.flatMap((row) => [row.from, row.to]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 18;
  const y = (value: number) => pad + ((max - value) / span) * (height - pad * 2);

  return (
    <div className={className}>
      <div className="ak-slope-head">
        <span>{fromLabel}</span>
        <span>{toLabel}</span>
      </div>
      <svg
        className="ak-slope"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ height }}
        role="img"
        aria-label={`${rows.length} items compared between ${fromLabel} and ${toLabel}`}
      >
        <line x1={18} x2={18} y1={0} y2={height} stroke="var(--ak-border)" />
        <line x1={82} x2={82} y1={0} y2={height} stroke="var(--ak-border)" />
        {rows.map((row, index) => {
          // Direction, not identity, carries the colour when the variant is
          // "change": with twenty items a per-item palette says nothing.
          const rose = row.to >= row.from;
          const stroke =
            variant === "change"
              ? rose
                ? "var(--ak-chart-2, var(--chart-2))"
                : "var(--ak-chart-3, var(--chart-3))"
              : PALETTE[index % PALETTE.length];
          return (
            <g key={row.label}>
              <line
                x1={18}
                x2={82}
                y1={y(row.from)}
                y2={y(row.to)}
                stroke={stroke}
                strokeWidth={1.8}
                strokeOpacity={0.85}
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={18} cy={y(row.from)} r={2.6} fill={stroke} />
              <circle cx={82} cy={y(row.to)} r={2.6} fill={stroke} />
            </g>
          );
        })}
      </svg>
      <ul className="ak-legend ak-legend-row">
        {rows.map((row, index) => (
          <li key={row.label}>
            <i
              style={{
                background:
                  variant === "change"
                    ? row.to >= row.from
                      ? "var(--ak-chart-2, var(--chart-2))"
                      : "var(--ak-chart-3, var(--chart-3))"
                    : PALETTE[index % PALETTE.length],
              }}
            />
            <span>{row.label}</span>
            <strong>
              {row.to >= row.from ? "+" : ""}
              {formatNumber(row.to - row.from)}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { SLOPE_CHART_VARIANTS };
export type { SlopeChartVariant };
