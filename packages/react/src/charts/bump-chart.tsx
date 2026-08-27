import { PALETTE } from "./chart.js";
import { BUMP_CHART_VARIANTS, type BumpChartVariant, type ChartDatum } from "./variants.js";

/**
 * Rank over time, one ribbon per item.
 *
 * "Which pages are climbing" is a rank question, and absolute-value lines hide
 * it behind scale differences: a page going 900 → 1000 and one going 9 → 90
 * look nothing alike on a line chart, though the second is the real story.
 */
export function BumpChart({
  data,
  labelKey = "date",
  dataKeys,
  variant = "ribbon",
  height = 220,
  className,
}: {
  /** Shared time rows; each key is one tracked item. */
  data: ChartDatum[];
  labelKey?: string;
  dataKeys: string[];
  variant?: BumpChartVariant;
  height?: number;
  className?: string;
}) {
  if (!data.length || !dataKeys.length) return <p className="ak-muted">No rank data.</p>;

  // Rank is derived, never supplied: passing pre-ranked data would let a caller
  // hand over ranks that disagree with the values in the same row.
  const ranks = data.map((row) => {
    const ordered = [...dataKeys].sort((a, b) => Number(row[b] ?? 0) - Number(row[a] ?? 0));
    const lookup = new Map(ordered.map((key, index) => [key, index]));
    return lookup;
  });

  const W = 1000;
  const pad = 26;
  const step = dataKeys.length > 1 ? (height - pad * 2) / (dataKeys.length - 1) : 0;
  const x = (index: number) => pad + (index / Math.max(data.length - 1, 1)) * (W - pad * 2);
  const y = (rank: number) => pad + rank * step;

  return (
    <div className={className}>
      <svg
        className="ak-bump"
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        style={{ height }}
        role="img"
        aria-label={`Rank of ${dataKeys.length} items over ${data.length} periods`}
      >
        {dataKeys.map((key, keyIndex) => {
          const points = data.map((_, index) => {
            const rank = ranks[index].get(key) ?? 0;
            return `${x(index).toFixed(1)},${y(rank).toFixed(1)}`;
          });
          const color = PALETTE[keyIndex % PALETTE.length];
          return (
            <g key={key}>
              <polyline
                points={points.join(" ")}
                fill="none"
                stroke={color}
                strokeWidth={variant === "ribbon" ? 7 : 2}
                strokeOpacity={variant === "ribbon" ? 0.55 : 1}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {data.map((_, index) => (
                <circle
                  key={index}
                  cx={x(index)}
                  cy={y(ranks[index].get(key) ?? 0)}
                  r={2.6}
                  fill={color}
                />
              ))}
            </g>
          );
        })}
      </svg>
      <ul className="ak-legend ak-legend-row">
        {dataKeys.map((key, index) => {
          const finalRank = (ranks[ranks.length - 1].get(key) ?? 0) + 1;
          const firstRank = (ranks[0].get(key) ?? 0) + 1;
          const moved = firstRank - finalRank;
          return (
            <li key={key}>
              <i style={{ background: PALETTE[index % PALETTE.length] }} />
              <span>{key}</span>
              <strong>
                #{finalRank}
                {moved !== 0 ? ` (${moved > 0 ? "+" : ""}${moved})` : ""}
              </strong>
            </li>
          );
        })}
      </ul>
      <p className="ak-sr-only">
        Ranks from {String(data[0]?.[labelKey] ?? "")} to{" "}
        {String(data[data.length - 1]?.[labelKey] ?? "")}.
      </p>
    </div>
  );
}

export { BUMP_CHART_VARIANTS };
export type { BumpChartVariant };
