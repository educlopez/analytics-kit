import { formatNumber } from "./chart.js";
/**
 * Rows carry a series alongside the scalars, which ChartDatum cannot express —
 * it is Record<string, string | number>. Widening ChartDatum for one component
 * would loosen every chart's contract, so the table gets its own row type.
 */
export type SparkRow = Record<string, string | number | number[] | undefined>;

/**
 * A real table with a trailing sparkline and a signed delta per row.
 *
 * The densest analytics layout there is, and the one every dashboard ends up
 * hand-rolling. A table, not a chart: rows are text, so they stay selectable
 * and searchable.
 */
export function SparkTable({
  data,
  labelKey = "label",
  dataKey = "value",
  trendKey = "trend",
  deltaKey = "delta",
  label = "Name",
  className,
}: {
  data: SparkRow[];
  labelKey?: string;
  dataKey?: string;
  /** Field holding the row's series. Rows without one just omit the spark. */
  trendKey?: string;
  deltaKey?: string;
  /** Header for the first column. */
  label?: string;
  className?: string;
}) {
  if (!data.length) return <p className="ak-muted">No rows.</p>;

  return (
    <div className={className}>
      <div className="ak-sparktable-scroll">
        <table className="ak-sparktable">
          <thead>
            <tr>
              <th scope="col">{label}</th>
              <th scope="col">Value</th>
              <th scope="col">Trend</th>
              <th scope="col">Change</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const trend = Array.isArray(row[trendKey])
                ? (row[trendKey] as unknown as number[])
                : [];
              const delta = Number(row[deltaKey] ?? 0);
              return (
                <tr key={String(row[labelKey])}>
                  <th scope="row">{String(row[labelKey] ?? "")}</th>
                  <td className="ak-sparktable-value">{formatNumber(Number(row[dataKey] ?? 0))}</td>
                  <td className="ak-sparktable-trend">
                    {trend.length > 1 ? <RowSpark values={trend} /> : null}
                  </td>
                  <td className={delta >= 0 ? "ak-delta-up" : "ak-delta-down"}>
                    {delta > 0 ? "+" : ""}
                    {formatNumber(delta)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowSpark({ values }: { values: number[] }) {
  const width = 80;
  const height = 18;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="var(--ak-chart-1, var(--chart-1))"
        strokeWidth={1.4}
      />
    </svg>
  );
}
