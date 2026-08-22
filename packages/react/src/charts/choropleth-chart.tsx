import { cn } from "../lib/cn.js";
import { CHOROPLETH_CHART_VARIANTS, type ChartDatum, type ChoroplethChartVariant } from "./variants.js";

export function ChoroplethChart({
  data,
  dataKey = "value",
  labelKey = "label",
  variant = "tiles",
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: ChoroplethChartVariant;
  className?: string;
}) {
  const rows = data.map((row) => ({
    label: String(row[labelKey] ?? ""),
    value: Number(row[dataKey] ?? 0),
    code: String(row.code ?? String(row[labelKey] ?? "").slice(0, 2)).toUpperCase(),
  }));
  const max = Math.max(...rows.map((row) => row.value), 1);

  if (!rows.length) return <p className="ak-muted">No region data.</p>;

  return (
    <ul className={cn("ak-tiles", variant === "heat" ? "ak-tiles-heat" : undefined, className)}>
      {rows.map((row) => {
        const t = row.value / max;
        const fill =
          variant === "dither"
            ? `color-mix(in srgb, var(--ak-chart-1) ${Math.round(t * 70 + 10)}%, transparent)`
            : `color-mix(in srgb, var(--ak-chart-1) ${Math.round(t * 85 + 15)}%, var(--ak-surface-2))`;
        return (
          <li key={row.label} style={{ background: fill }} title={`${row.label}: ${row.value}`}>
            <strong>{row.code}</strong>
            <span>{Math.round(row.value).toLocaleString()}</span>
          </li>
        );
      })}
    </ul>
  );
}

export { CHOROPLETH_CHART_VARIANTS };
export type { ChoroplethChartVariant };
