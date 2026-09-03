import type { Annotation } from "./annotations.js";
import { TIMELINE_VARIANTS, type TimelineVariant } from "./variants.js";

const KIND_COLOR: Record<NonNullable<Annotation["kind"]>, string> = {
  deploy: "var(--ak-chart-2, var(--chart-2))",
  release: "var(--ak-chart-1, var(--chart-1))",
  incident: "var(--ak-chart-3, var(--chart-3))",
  note: "var(--ak-muted)",
};

/**
 * A dated rail with pins alternating above and below.
 *
 * The standalone twin of the annotations layer: same data shape, so a release
 * history can sit under a dashboard on the same dates without being restated.
 */
export function TimelineChart({
  items,
  height = 150,
  variant = "alternating",
  className,
}: {
  /** `{ at, label, kind? }` — the same shape the annotations layer takes. */
  items: Annotation[];
  height?: number;
  /**
   * `alternating` pins above and below the rail. `rail` keeps every pin on one
   * side. `dots` drops the labels to markers, for a dense release history.
   * `stacked` abandons the time axis for one row per item, which is the only
   * form that stays readable when items cluster on the same day.
   */
  variant?: TimelineVariant;
  className?: string;
}) {
  if (!items.length) return <p className="ak-muted">No timeline items.</p>;

  const sorted = [...items].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  const times = sorted.map((item) => new Date(item.at).getTime());
  const valid = times.every((time) => !Number.isNaN(time));
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min || 1;

  if (variant === "stacked") {
    return (
      <div className={className}>
        <ul className="ak-timeline-list">
          {sorted.map((item) => (
            <li key={`${item.at}-${item.label}`}>
              <b style={{ background: KIND_COLOR[item.kind ?? "note"] }} />
              <small>{item.at.slice(0, 10)}</small>
              <em>{item.label}</em>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <div className="ak-timeline" style={{ height }}>
        <span className="ak-timeline-rail" />
        {sorted.map((item, index) => {
          // Evenly spaced when the dates do not parse, rather than collapsing
          // every pin onto the same spot.
          const position = valid
            ? ((times[index] - min) / span) * 100
            : (index / Math.max(sorted.length - 1, 1)) * 100;
          const above = variant === "alternating" ? index % 2 === 0 : false;
          return (
            <span
              className={[
                "ak-timeline-pin",
                above ? "is-above" : "",
                variant === "dots" ? "is-dots" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={`${item.at}-${item.label}`}
              style={{ left: `${position}%` }}
              title={variant === "dots" ? `${item.at.slice(0, 10)} — ${item.label}` : undefined}
            >
              <b style={{ background: KIND_COLOR[item.kind ?? "note"] }} />
              {variant === "dots" ? null : (
                <>
                  <em>{item.label}</em>
                  <small>{item.at.slice(0, 10)}</small>
                </>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export { TIMELINE_VARIANTS };
export type { TimelineVariant };
