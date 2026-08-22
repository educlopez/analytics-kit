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

  return (
    <div className={cn("ak-heat", variant === "matrix" ? "ak-heat-matrix" : undefined, className)}>
      {cells.map((cell) => {
        const t = cell.value / max;
        const fill =
          variant === "dither"
            ? `color-mix(in srgb, var(--ak-chart-1) ${Math.round(t * 55 + 8)}%, transparent)`
            : `color-mix(in srgb, var(--ak-chart-1) ${Math.round(t * 90)}%, var(--ak-surface-2))`;
        return (
          <span key={cell.label} style={{ background: fill }} title={`${cell.label}: ${cell.value}`} />
        );
      })}
    </div>
  );
}

export { HEATMAP_CHART_VARIANTS };
export type { HeatmapChartVariant };
