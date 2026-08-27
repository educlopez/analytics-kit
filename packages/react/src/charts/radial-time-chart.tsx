import { formatNumber } from "./chart.js";

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
  className,
}: {
  data: RadialTimeCell[];
  size?: number;
  className?: string;
}) {
  if (!data.length) return <p className="ak-muted">No cyclical data.</p>;

  const max = Math.max(...data.map((cell) => cell.value), 1);
  const centre = size / 2;
  const inner = size * 0.16;
  const ringWidth = (size * 0.42 - inner) / DAYS.length;
  const total = data.reduce((sum, cell) => sum + cell.value, 0);
  const peak = data.reduce((best, cell) => (cell.value > best.value ? cell : best), data[0]);

  const arc = (cell: RadialTimeCell) => {
    const r0 = inner + cell.day * ringWidth;
    const r1 = r0 + ringWidth - 1;
    // A hair short of a full slot so the segments read as cells, not as a ring
    // that happens to change colour.
    const a0 = (cell.hour / 24) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((cell.hour + 0.92) / 24) * Math.PI * 2 - Math.PI / 2;
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
        {data.map((cell) => (
          <path
            key={`${cell.day}-${cell.hour}`}
            d={arc(cell)}
            fill="var(--ak-chart-1, var(--chart-1))"
            fillOpacity={0.08 + (cell.value / max) * 0.82}
          >
            <title>{`${DAYS[cell.day]} ${String(cell.hour).padStart(2, "0")}:00 — ${formatNumber(cell.value)}`}</title>
          </path>
        ))}
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
