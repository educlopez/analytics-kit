import { formatNumber, PALETTE } from "./chart.js";
import type { ChartDatum } from "./variants.js";

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
  className,
}: {
  data: ChartDatum[];
  labelKey?: string;
  /** Segment keys, stacked in order within each column. */
  dataKeys: string[];
  height?: number;
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
      <div className="ak-mekko" style={{ height }}>
        {columns.map((column) => (
          <div
            className="ak-mekko-col"
            key={column.label}
            // Width is share of the grand total, so a wide column really did
            // carry more traffic.
            style={{ width: `${(column.total / grand) * 100}%` }}
          >
            {column.parts.map((value, index) => (
              <span
                key={dataKeys[index]}
                className="ak-mekko-cell"
                style={{
                  height: `${(value / column.total) * 100}%`,
                  background: PALETTE[index % PALETTE.length],
                }}
                title={`${column.label} · ${dataKeys[index]}: ${formatNumber(value)}`}
              />
            ))}
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
