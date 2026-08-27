import type { ReactNode } from "react";
import type { ChartDatum } from "./variants.js";

/**
 * A grid of one-chart-per-category miniatures on a locked shared scale.
 *
 * The honest alternative to twelve independently-scaled cards: without a shared
 * domain, the eye compares shapes that were drawn to different rulers and
 * concludes things that are not true.
 */
export function SmallMultiples({
  groups,
  dataKey = "value",
  columns = 4,
  render,
  className,
}: {
  /** One entry per miniature. */
  groups: { label: string; data: ChartDatum[] }[];
  dataKey?: string;
  columns?: number;
  /**
   * Renders one miniature. `domain` is the shared min/max across every group —
   * pass it to the chart so the panels stay comparable.
   */
  render: (group: { label: string; data: ChartDatum[] }, domain: [number, number]) => ReactNode;
  className?: string;
}) {
  if (!groups.length) return <p className="ak-muted">No groups.</p>;

  const values = groups.flatMap((group) => group.data.map((row) => Number(row[dataKey] ?? 0)));
  const domain: [number, number] = values.length
    ? [Math.min(...values), Math.max(...values)]
    : [0, 1];

  return (
    <div
      className={className ? `ak-multiples ${className}` : "ak-multiples"}
      style={{ gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` }}
    >
      {groups.map((group) => (
        <figure className="ak-multiple" key={group.label}>
          <figcaption>{group.label}</figcaption>
          {render(group, domain)}
        </figure>
      ))}
    </div>
  );
}
