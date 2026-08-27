import { cn } from "../lib/cn.js";
import { HEATMAP_CHART_VARIANTS, type ChartDatum, type HeatmapChartVariant } from "./variants.js";

export function HeatmapChart({
  data,
  dataKey = "value",
  labelKey = "date",
  variant = "calendar",
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: HeatmapChartVariant;
  className?: string;
}) {
  const cells = data.map((row) => ({
    label: String(row[labelKey] ?? ""),
    value: Number(row[dataKey] ?? 0),
  }));
  const max = Math.max(...cells.map((cell) => cell.value), 1);

  if (!cells.length) return <p className="ak-muted">No heatmap data.</p>;

  if (variant === "month") return <MonthGrid cells={cells} max={max} className={className} />;

  return (
    <div className={cn("ak-heat", variant === "matrix" ? "ak-heat-matrix" : undefined, className)}>
      {cells.map((cell) => {
        const t = cell.value / max;
        const fill =
          variant === "dither"
            ? `color-mix(in srgb, var(--ak-chart-1) ${Math.round(t * 55 + 8)}%, transparent)`
            : `color-mix(in srgb, var(--ak-chart-1) ${Math.round(t * 90)}%, var(--ak-surface-2))`;
        return (
          <span
            key={cell.label}
            style={{ background: fill }}
            title={`${cell.label}: ${cell.value}`}
          />
        );
      })}
    </div>
  );
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * A real calendar: weekday columns, one row per week, leading blanks so the
 * first day lands under its own weekday.
 *
 * The existing `calendar` variant is a year strip; this is the grid people
 * actually recognise as a calendar, and it needs real dates rather than an
 * ordered list of values.
 */
function MonthGrid({
  cells,
  max,
  className,
}: {
  cells: { label: string; value: number }[];
  max: number;
  className?: string;
}) {
  const parsed = cells
    .map((cell) => ({ ...cell, date: new Date(cell.label) }))
    .filter((cell) => !Number.isNaN(cell.date.getTime()));

  if (!parsed.length) {
    return <p className="ak-muted">The month variant needs a date per row.</p>;
  }

  // getUTCDay is Sunday-first; the grid is Monday-first, so Sunday moves to 6.
  const first = parsed[0].date;
  const lead = (first.getUTCDay() + 6) % 7;

  return (
    <div className={cn("ak-heat-month", className)}>
      {WEEKDAYS.map((day, index) => (
        <span className="ak-heat-weekday" key={`${day}-${index}`} aria-hidden="true">
          {day}
        </span>
      ))}
      {Array.from({ length: lead }, (_, index) => (
        <span className="ak-heat-blank" key={`lead-${index}`} aria-hidden="true" />
      ))}
      {parsed.map((cell) => {
        const t = cell.value / max;
        return (
          <span
            key={cell.label}
            className="ak-heat-day"
            style={{
              background: `color-mix(in srgb, var(--ak-chart-1) ${Math.round(t * 88)}%, var(--ak-surface-2))`,
            }}
            title={`${cell.label}: ${cell.value}`}
          >
            {cell.date.getUTCDate()}
          </span>
        );
      })}
    </div>
  );
}

export { HEATMAP_CHART_VARIANTS };
export type { HeatmapChartVariant };
