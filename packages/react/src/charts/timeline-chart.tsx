import type { Annotation } from "./annotations.js";

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
  className,
}: {
  /** `{ at, label, kind? }` — the same shape the annotations layer takes. */
  items: Annotation[];
  height?: number;
  className?: string;
}) {
  if (!items.length) return <p className="ak-muted">No timeline items.</p>;

  const sorted = [...items].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  const times = sorted.map((item) => new Date(item.at).getTime());
  const valid = times.every((time) => !Number.isNaN(time));
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min || 1;

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
          const above = index % 2 === 0;
          return (
            <span
              className={above ? "ak-timeline-pin is-above" : "ak-timeline-pin"}
              key={`${item.at}-${item.label}`}
              style={{ left: `${position}%` }}
            >
              <b style={{ background: KIND_COLOR[item.kind ?? "note"] }} />
              <em>{item.label}</em>
              <small>{item.at.slice(0, 10)}</small>
            </span>
          );
        })}
      </div>
    </div>
  );
}
