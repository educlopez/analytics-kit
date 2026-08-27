import { formatNumber, PALETTE } from "./chart.js";

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
  className,
}: {
  lanes: StripLane[];
  laneHeight?: number;
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
              <span className="ak-strip-track" style={{ height: laneHeight }}>
                {stamps.map((time, tick) => (
                  <span
                    key={tick}
                    className="ak-strip-tick"
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
