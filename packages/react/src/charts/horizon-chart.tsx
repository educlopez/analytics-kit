import { formatNumber, PALETTE } from "./chart.js";
import { HORIZON_CHART_VARIANTS, type ChartDatum, type HorizonChartVariant } from "./variants.js";

/**
 * One horizon band: the series is clipped to a slice of its range and every
 * slice is redrawn against the same baseline, so a lane needs a fraction of the
 * height a line chart would want for the same resolution.
 */
function Lane({
  values,
  bands,
  color,
  height,
  mirror,
}: {
  values: number[];
  bands: number;
  color: string;
  height: number;
  mirror: boolean;
}) {
  const max = Math.max(...values.map((value) => Math.abs(value)), 1);
  const width = 100;
  const step = max / bands;

  return (
    <svg
      className="ak-horizon-lane"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      height={height}
      aria-hidden="true"
    >
      {Array.from({ length: bands }, (_, band) => {
        const floor = band * step;
        const negative = mirror && values.some((value) => value < 0);
        const points = values
          .map((value, index) => {
            const magnitude = negative ? Math.abs(value) : Math.max(0, value);
            const clipped = Math.min(Math.max(magnitude - floor, 0), step);
            const x = (index / Math.max(values.length - 1, 1)) * width;
            const y = height - (clipped / step) * height;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(" ");
        return (
          <polygon
            key={band}
            points={`0,${height} ${points} ${width},${height}`}
            fill={color}
            // Each band sits on top of the last, so opacity compounds into the
            // darker tone that reads as "higher" without any extra hue.
            fillOpacity={0.22 + band * (0.6 / bands)}
          />
        );
      })}
    </svg>
  );
}

export function HorizonChart({
  data,
  dataKeys,
  labelKey = "date",
  variant = "bands",
  bands = 3,
  laneHeight = 26,
  className,
}: {
  data: ChartDatum[];
  /** One lane per key. */
  dataKeys: string[];
  labelKey?: string;
  variant?: HorizonChartVariant;
  /** How many times the range is folded. Three is the usual sweet spot. */
  bands?: number;
  laneHeight?: number;
  className?: string;
}) {
  if (!data.length || !dataKeys.length) return <p className="ak-muted">No series data.</p>;

  const first = String(data[0]?.[labelKey] ?? "");
  const last = String(data[data.length - 1]?.[labelKey] ?? "");

  return (
    <div className={className}>
      <div className="ak-horizon">
        {dataKeys.map((key, index) => {
          const values = data.map((row) => Number(row[key] ?? 0));
          const total = values.reduce((acc, value) => acc + value, 0);
          return (
            <div className="ak-horizon-row" key={key}>
              <span className="ak-horizon-label" title={key}>
                {key}
              </span>
              <Lane
                values={values}
                bands={Math.max(1, bands)}
                color={PALETTE[index % PALETTE.length]}
                height={laneHeight}
                mirror={variant === "mirror"}
              />
              <span className="ak-horizon-total">{formatNumber(total)}</span>
            </div>
          );
        })}
      </div>
      <div className="ak-horizon-axis">
        <span>{first.slice(0, 10)}</span>
        <span>{last.slice(0, 10)}</span>
      </div>
      <p className="ak-sr-only">
        {dataKeys.length} series over {data.length} points, from {first} to {last}.
      </p>
    </div>
  );
}

export { HORIZON_CHART_VARIANTS };
export type { HorizonChartVariant };
