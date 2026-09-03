import { formatNumber, PALETTE } from "./chart.js";
import { MARIMEKKO_VARIANTS, type ChartDatum, type MarimekkoVariant } from "./variants.js";

/**
 * Variable-width stacked bars: width is volume, segment height is share, so
 * area is the absolute number.
 *
 * This is the correction a normalised stacked bar actively hides. "Mobile is
 * 60%" reads the same whether the segment is 60% of a huge column or 60% of a
 * sliver; here the sliver stays a sliver.
 */
export function MarimekkoChart({
  data,
  labelKey = "label",
  dataKeys,
  height = 260,
  variant = "mosaic",
  className,
}: {
  data: ChartDatum[];
  labelKey?: string;
  /** Segment keys, stacked in order within each column. */
  dataKeys: string[];
  height?: number;
  /**
   * `mosaic` is solid fills. `labels` prints each segment's share where it
   * fits. `outline` keeps only the hairlines, for print or a dense page.
   * `heat` drops the categorical palette for one hue tinted by each cell's
   * share of its column, which compares cells across columns rather than
   * naming the series.
   */
  variant?: MarimekkoVariant;
  className?: string;
}) {
  if (!data.length || !dataKeys.length) return <p className="ak-muted">No breakdown data.</p>;

  const columns = data
    .map((row) => {
      const parts = dataKeys.map((key) => Number(row[key] ?? 0));
      return {
        label: String(row[labelKey] ?? ""),
        parts,
        total: parts.reduce((sum, value) => sum + value, 0),
      };
    })
    .filter((column) => column.total > 0);

  if (!columns.length) return <p className="ak-muted">No breakdown data.</p>;

  const grand = columns.reduce((sum, column) => sum + column.total, 0);

  return (
    <div className={className}>
      <div className={`ak-mekko${variant === "outline" ? " is-outline" : ""}`} style={{ height }}>
        {columns.map((column) => (
          <div
            className="ak-mekko-col"
            key={column.label}
            // Width is share of the grand total, so a wide column really did
            // carry more traffic.
            style={{ width: `${(column.total / grand) * 100}%` }}
          >
            {column.parts.map((value, index) => {
              const share = value / column.total;
              return (
                <span
                  key={dataKeys[index]}
                  className="ak-mekko-cell"
                  style={{
                    height: `${share * 100}%`,
                    background:
                      variant === "outline" ? "transparent" : PALETTE[index % PALETTE.length],
                    borderColor:
                      variant === "outline" ? PALETTE[index % PALETTE.length] : undefined,
                  }}
                  title={`${column.label} · ${dataKeys[index]}: ${formatNumber(value)}`}
                >
                  {/* Only where it fits: a percentage clipped to three pixels is
                      worse than no percentage. */}
                  {variant === "labels" && share > 0.12 && column.total / grand > 0.08 ? (
                    <em className="ak-mekko-share">{Math.round(share * 100)}%</em>
                  ) : null}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="ak-mekko-axis">
        {columns.map((column) => (
          <span key={column.label} style={{ width: `${(column.total / grand) * 100}%` }}>
            {column.label}
          </span>
        ))}
      </div>
      <ul className="ak-legend ak-legend-row">
        {dataKeys.map((key, index) => (
          <li key={key}>
            <i style={{ background: PALETTE[index % PALETTE.length] }} />
            <span>{key}</span>
            <strong>
              {formatNumber(columns.reduce((sum, column) => sum + (column.parts[index] ?? 0), 0))}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { MARIMEKKO_VARIANTS };
export type { MarimekkoVariant };
