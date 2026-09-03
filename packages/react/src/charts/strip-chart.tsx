import { formatNumber, PALETTE } from "./chart.js";
import { STRIP_CHART_VARIANTS, type StripChartVariant } from "./variants.js";

export interface StripLane {
  label: string;
  /** Event timestamps. Anything Date can parse. */
  at: (string | number | Date)[];
}

/**
 * One lane per event name, one tick per occurrence. No aggregation.
 *
 * Bursts, gaps and correlated spikes disappear the moment you bucket, which is
 * exactly what every other time mark in this set does. Density is the signal.
 */
export function StripChart({
  lanes,
  laneHeight = 26,
  variant = "ticks",
  className,
}: {
  lanes: StripLane[];
  laneHeight?: number;
  /**
   * `ticks` is one thin mark per event. `barcode` runs them full height with no
   * lane padding, so a burst reads as a solid block. `dots` rounds them and
   * lets overlap build up as opacity. `density` gives up on individual events
   * and buckets the lane, which is the only form that stays readable once a
   * lane carries thousands.
   */
  variant?: StripChartVariant;
  className?: string;
}) {
  if (!lanes.length) return <p className="ak-muted">No event lanes.</p>;

  const times = lanes.flatMap((lane) =>
    lane.at.map((value) => new Date(value).getTime()).filter((time) => !Number.isNaN(time)),
  );

  if (!times.length) return <p className="ak-muted">No parseable event times.</p>;

  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min || 1;

  return (
    <div className={className}>
      <div className="ak-strip">
        {lanes.map((lane, index) => {
          const stamps = lane.at
            .map((value) => new Date(value).getTime())
            .filter((time) => !Number.isNaN(time));
          return (
            <div className="ak-strip-lane" key={lane.label}>
              <span className="ak-strip-label" title={lane.label}>
                {lane.label}
              </span>
              <span
                className={`ak-strip-track${variant === "barcode" ? " is-barcode" : ""}`}
                style={{ height: laneHeight }}
              >
                {variant === "density"
                  ? (() => {
                      const buckets = 48;
                      const counts = new Array(buckets).fill(0);
                      for (const time of stamps) {
                        const slot = Math.min(
                          buckets - 1,
                          Math.floor(((time - min) / span) * buckets),
                        );
                        counts[slot] += 1;
                      }
                      const peak = Math.max(...counts, 1);
                      return counts.map((count, slot) => (
                        <span
                          key={slot}
                          className="ak-strip-bucket"
                          style={{
                            left: `${(slot / buckets) * 100}%`,
                            width: `${100 / buckets}%`,
                            background: PALETTE[index % PALETTE.length],
                            opacity: count ? 0.15 + (count / peak) * 0.85 : 0,
                          }}
                        />
                      ));
                    })()
                  : stamps.map((time, tick) => (
                      <span
                        key={tick}
                        className={`ak-strip-tick${variant === "dots" ? " is-dot" : ""}`}
                        style={{
                          left: `${((time - min) / span) * 100}%`,
                          background: PALETTE[index % PALETTE.length],
                        }}
                      />
                    ))}
              </span>
              <span className="ak-strip-count">{formatNumber(stamps.length)}</span>
            </div>
          );
        })}
      </div>
      <div className="ak-strip-axis">
        <span>{new Date(min).toISOString().slice(0, 16).replace("T", " ")}</span>
        <span>{new Date(max).toISOString().slice(0, 16).replace("T", " ")}</span>
      </div>
    </div>
  );
}

export { STRIP_CHART_VARIANTS };
export type { StripChartVariant };
