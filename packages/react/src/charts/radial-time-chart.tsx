import { formatNumber } from "./chart.js";
import { RADIAL_TIME_VARIANTS, type RadialTimeVariant } from "./variants.js";

export interface RadialTimeCell {
  /** 0–23. */
  hour: number;
  /** 0 = Monday. */
  day: number;
  value: number;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Hours around the circle, weekdays as rings.
 *
 * Hour-of-day is genuinely cyclical: on a rectangular heatmap 23:00 and 00:00
 * sit at opposite ends, so a burst that straddles midnight reads as two
 * unrelated bursts. Here they are neighbours.
 */
export function RadialTimeChart({
  data,
  size = 260,
  variant = "rings",
  className,
}: {
  data: RadialTimeCell[];
  size?: number;
  /**
   * `rings` fills each hour cell by opacity. `dots` moves the value into the
   * dot's radius, which survives being printed or read at a glance. `bands`
   * drops the per-cell gaps so each weekday reads as one continuous ring.
   */
  variant?: RadialTimeVariant;
  className?: string;
}) {
  if (!data.length) return <p className="ak-muted">No cyclical data.</p>;

  const max = Math.max(...data.map((cell) => cell.value), 1);
  const centre = size / 2;
  const inner = size * 0.16;
  const ringWidth = (size * 0.42 - inner) / DAYS.length;
  const total = data.reduce((sum, cell) => sum + cell.value, 0);
  const peak = data.reduce((best, cell) => (cell.value > best.value ? cell : best), data[0]);

  // A hair short of a full slot so the segments read as cells, not as a ring
  // that happens to change colour — except in `bands`, which wants the ring.
  const slot = variant === "bands" ? 1 : 0.92;

  const arc = (cell: RadialTimeCell) => {
    const r0 = inner + cell.day * ringWidth;
    const r1 = r0 + ringWidth - (variant === "bands" ? 0 : 1);
    const a0 = (cell.hour / 24) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((cell.hour + slot) / 24) * Math.PI * 2 - Math.PI / 2;
    const p = (radius: number, angle: number) =>
      `${(centre + Math.cos(angle) * radius).toFixed(2)} ${(centre + Math.sin(angle) * radius).toFixed(2)}`;
    return `M${p(r0, a0)} L${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`;
  };

  return (
    <div className={className}>
      <svg
        className="ak-radial-time"
        viewBox={`0 0 ${size} ${size}`}
        style={{ height: size }}
        role="img"
        aria-label={`Activity by hour and weekday, ${formatNumber(total)} total, peak ${DAYS[peak.day]} at ${peak.hour}:00`}
      >
        {data.map((cell) => {
          const title = `${DAYS[cell.day]} ${String(cell.hour).padStart(2, "0")}:00 — ${formatNumber(cell.value)}`;
          if (variant === "dots") {
            // Centre of the cell, radius carrying the value.
            const angle = ((cell.hour + 0.5) / 24) * Math.PI * 2 - Math.PI / 2;
            const radius = inner + (cell.day + 0.5) * ringWidth;
            const r = Math.max(0.6, (ringWidth / 2 - 1.2) * Math.sqrt(cell.value / max));
            return (
              <circle
                key={`${cell.day}-${cell.hour}`}
                cx={centre + Math.cos(angle) * radius}
                cy={centre + Math.sin(angle) * radius}
                r={r}
                fill="var(--ak-chart-1, var(--chart-1))"
                fillOpacity={0.85}
              >
                <title>{title}</title>
              </circle>
            );
          }
          return (
            <path
              key={`${cell.day}-${cell.hour}`}
              d={arc(cell)}
              fill="var(--ak-chart-1, var(--chart-1))"
              fillOpacity={0.08 + (cell.value / max) * 0.82}
            >
              <title>{title}</title>
            </path>
          );
        })}
        {[0, 6, 12, 18].map((hour) => {
          const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
          const r = size * 0.46;
          return (
            <text
              key={hour}
              className="ak-radial-hour"
              x={centre + Math.cos(angle) * r}
              y={centre + Math.sin(angle) * r}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {String(hour).padStart(2, "0")}
            </text>
          );
        })}
      </svg>
      <p className="ak-radial-peak">
        Busiest: {DAYS[peak.day]} at {String(peak.hour).padStart(2, "0")}:00
      </p>
    </div>
  );
}

export { RADIAL_TIME_VARIANTS };
export type { RadialTimeVariant };
