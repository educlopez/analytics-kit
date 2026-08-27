import { formatNumber, PALETTE } from "./chart.js";
import { SHARE_BAND_VARIANTS, type ChartDatum, type ShareBandVariant } from "./variants.js";

/**
 * One horizontal 100% band. Doubles as a table header.
 *
 * A donut spends 200px of height to say what this says in 20, which is why it
 * is the most under-used mark in dashboards.
 */
export function ShareBand({
  data,
  dataKey = "value",
  labelKey = "label",
  variant = "segments",
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: ShareBandVariant;
  className?: string;
}) {
  const rows = data
    .map((row) => ({
      label: String(row[labelKey] ?? ""),
      value: Number(row[dataKey] ?? 0),
    }))
    .filter((row) => row.value > 0);

  if (!rows.length) return <p className="ak-muted">No breakdown data.</p>;

  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className={className}>
      <div className="ak-band" role="img" aria-label={`Share of ${formatNumber(total)}`}>
        {rows.map((row, index) => {
          const share = row.value / total;
          return (
            <span
              key={row.label}
              className="ak-band-segment"
              style={{ width: `${share * 100}%`, background: PALETTE[index % PALETTE.length] }}
              title={`${row.label}: ${formatNumber(row.value)} (${Math.round(share * 100)}%)`}
            >
              {/* Only labelled where it fits: a percentage clipped to three
                  pixels is worse than no percentage. */}
              {share > 0.08 ? <em>{Math.round(share * 100)}%</em> : null}
            </span>
          );
        })}
      </div>
      {variant === "legend" ? (
        <ul className="ak-legend ak-legend-row">
          {rows.map((row, index) => (
            <li key={row.label}>
              <i style={{ background: PALETTE[index % PALETTE.length] }} />
              <span>{row.label}</span>
              <strong>{formatNumber(row.value)}</strong>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { SHARE_BAND_VARIANTS };
export type { ShareBandVariant };
