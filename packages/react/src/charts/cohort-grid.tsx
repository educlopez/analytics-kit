import { formatNumber } from "./chart.js";
import { COHORT_GRID_VARIANTS, type CohortGridVariant } from "./variants.js";

export interface CohortRow {
  /** What the cohort is, usually the signup week or month. */
  label: string;
  /** How many people entered the cohort. */
  size: number;
  /** Retained count per period since, index 0 being the first period. */
  values: number[];
}

/**
 * Opacity of a cell's fill, from its retained share.
 *
 * Capped at 0.45 rather than running to 1. The value sits on top of this fill,
 * and the fill is a theme colour whose luminance flips between light and dark
 * mode — so a ramp that reaches full saturation puts the text at about 2:1 in
 * one theme or the other. At this ceiling both themes clear AA, and the floor
 * keeps a 2% cell visible as "something retained" rather than an empty slot.
 */
function tone(share: number): number {
  return share <= 0 ? 0 : 0.08 + Math.min(1, share) * 0.37;
}

/**
 * Retention grid: cohorts down, periods since across.
 *
 * Rows are ragged on purpose. A cohort that started three weeks ago has three
 * periods of history, and padding it out to the full width would invent data.
 */
export function CohortGrid({
  data,
  variant = "triangle",
  periodLabel = "Period",
  className,
}: {
  data: CohortRow[];
  variant?: CohortGridVariant;
  /** Column header prefix, e.g. "Week" gives Week 0, Week 1… */
  periodLabel?: string;
  className?: string;
}) {
  if (!data.length) return <p className="ak-muted">No cohort data.</p>;

  const periods = Math.max(...data.map((row) => row.values.length));
  const percent = variant !== "counts";

  return (
    <div className={className}>
      <div className="ak-cohort-scroll">
        <table className="ak-cohort">
          <thead>
            <tr>
              <th scope="col">Cohort</th>
              <th scope="col">Size</th>
              {Array.from({ length: periods }, (_, index) => (
                <th scope="col" key={index}>
                  {periodLabel} {index}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td className="ak-cohort-size">{formatNumber(row.size)}</td>
                {Array.from({ length: periods }, (_, index) => {
                  const value = row.values[index];
                  if (value == null) {
                    // Not "zero retained" — no data yet. Drawn as an empty slot.
                    return <td key={index} className="ak-cohort-empty" aria-label="No data yet" />;
                  }
                  const share = row.size > 0 ? value / row.size : 0;
                  return (
                    <td key={index} className="ak-cohort-cell">
                      <span
                        className="ak-cohort-fill"
                        style={{ opacity: tone(share) }}
                        aria-hidden="true"
                      />
                      <span className="ak-cohort-value">
                        {percent ? `${Math.round(share * 100)}%` : formatNumber(value)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { COHORT_GRID_VARIANTS };
export type { CohortGridVariant };
