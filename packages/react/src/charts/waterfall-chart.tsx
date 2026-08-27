import { formatNumber } from "./chart.js";
import {
  WATERFALL_CHART_VARIANTS,
  type ChartDatum,
  type WaterfallChartVariant,
} from "./variants.js";

/**
 * Floating bars bridging a start total to an end total.
 *
 * Answers "where did the change come from", which a time series never does —
 * it shows that a number moved, not what moved it.
 */
export function WaterfallChart({
  data,
  dataKey = "value",
  labelKey = "label",
  variant = "bridge",
  height = 240,
  className,
}: {
  /** Signed steps in order. The running total is derived, not supplied. */
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: WaterfallChartVariant;
  height?: number;
  className?: string;
}) {
  if (!data.length) return <p className="ak-muted">No waterfall data.</p>;

  const steps = data.map((row) => ({
    label: String(row[labelKey] ?? ""),
    delta: Number(row[dataKey] ?? 0),
  }));

  let running = 0;
  const bars = steps.map((step) => {
    const from = running;
    running += step.delta;
    return { ...step, from, to: running };
  });

  const total = running;
  const values = bars.flatMap((bar) => [bar.from, bar.to]).concat(0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const y = (value: number) => ((max - value) / span) * height;

  const W = 1000;
  const slot = W / (bars.length + (variant === "bridge" ? 1 : 0));
  const barW = Math.min(64, slot * 0.58);

  return (
    <div className={className}>
      <svg
        className="ak-waterfall"
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        style={{ height }}
        role="img"
        aria-label={`Waterfall of ${bars.length} steps totalling ${formatNumber(total)}`}
      >
        {y(0) >= 0 && y(0) <= height ? (
          <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="var(--ak-border)" strokeWidth={1} />
        ) : null}
        {bars.map((bar, index) => {
          const cx = slot * index + slot / 2;
          const top = Math.min(y(bar.from), y(bar.to));
          const barH = Math.max(2, Math.abs(y(bar.to) - y(bar.from)));
          const next = bars[index + 1];
          return (
            <g key={`${bar.label}-${index}`}>
              <rect
                x={cx - barW / 2}
                y={top}
                width={barW}
                height={barH}
                rx={2}
                fill={
                  bar.delta >= 0
                    ? "var(--ak-chart-2, var(--chart-2))"
                    : "var(--ak-chart-3, var(--chart-3))"
                }
                fillOpacity={0.85}
              />
              {/* The connector is what makes it a bridge rather than a row of
                  unrelated bars: it carries the running total across. */}
              {next && variant === "bridge" ? (
                <line
                  x1={cx + barW / 2}
                  x2={slot * (index + 1) + slot / 2 - barW / 2}
                  y1={y(bar.to)}
                  y2={y(bar.to)}
                  stroke="var(--ak-border)"
                  strokeDasharray="3 3"
                />
              ) : null}
            </g>
          );
        })}
        {variant === "bridge" ? (
          <rect
            x={slot * bars.length + slot / 2 - barW / 2}
            y={Math.min(y(0), y(total))}
            width={barW}
            height={Math.max(2, Math.abs(y(total) - y(0)))}
            rx={2}
            fill="var(--ak-chart-1, var(--chart-1))"
            fillOpacity={0.85}
          />
        ) : null}
      </svg>
      <div className="ak-waterfall-axis">
        {bars.map((bar, index) => (
          <span key={`${bar.label}-label-${index}`}>
            <b>{bar.label}</b>
            <em>
              {bar.delta > 0 ? "+" : ""}
              {formatNumber(bar.delta)}
            </em>
          </span>
        ))}
        {variant === "bridge" ? (
          <span>
            <b>Total</b>
            <em>{formatNumber(total)}</em>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export { WATERFALL_CHART_VARIANTS };
export type { WaterfallChartVariant };
