import { ReferenceLine } from "recharts";

export interface Annotation {
  /** Must match a value in the chart's labelKey field, e.g. an ISO date. */
  at: string;
  label: string;
  kind?: "deploy" | "release" | "incident" | "note";
}

const KIND_COLOR: Record<NonNullable<Annotation["kind"]>, string> = {
  deploy: "var(--ak-chart-2, var(--chart-2))",
  release: "var(--ak-chart-1, var(--chart-1))",
  incident: "var(--ak-chart-3, var(--chart-3))",
  note: "var(--ak-muted)",
};

/**
 * Dated markers over any x-scaled chart — deploys, releases, incidents.
 *
 * Returns an array rather than a fragment: recharts reads its children's types
 * to build the chart, and a fragment hides them, which is the same reason the
 * profit-loss series are spread rather than wrapped.
 */
export function annotationLines(items: Annotation[] | undefined) {
  if (!items?.length) return null;
  return items.map((item) => (
    <ReferenceLine
      key={`${item.at}-${item.label}`}
      x={item.at}
      stroke={KIND_COLOR[item.kind ?? "note"]}
      strokeDasharray="4 4"
      strokeWidth={1.4}
      label={{
        value: item.label,
        position: "top",
        fill: "var(--ak-muted)",
        fontSize: 11,
      }}
    />
  ));
}
