import { formatNumber } from "./chart.js";
import type { ChartDatum } from "./variants.js";

/** Key the previous-period series is merged onto. Internal to the ghost treatment. */
export const PREVIOUS_KEY = "__ak_previous";

/**
 * How a null in the data is drawn.
 *
 * `bridge` joins across the hole, `break` leaves the gap open. Neither coerces
 * the missing point to zero, which is what draws a cliff that reads as a
 * traffic collapse rather than as an outage in collection.
 */
export type GapMode = "bridge" | "break";

export function connectNulls(gaps: GapMode | undefined): boolean {
  return gaps !== "break";
}

/**
 * Merge a previous-period series onto the current rows so one recharts dataset
 * carries both. Aligned by index, not by date: the whole point of the
 * comparison is that day 1 of this period sits under day 1 of the last one.
 */
export function withPrevious(
  data: ChartDatum[],
  previous: ChartDatum[] | undefined,
  dataKey: string,
): ChartDatum[] {
  if (!previous?.length) return data;
  return data.map((row, index) => {
    const value = previous[index]?.[dataKey];
    return value == null ? row : { ...row, [PREVIOUS_KEY]: value };
  });
}

/**
 * Terminal dot with the value in a pill beside it.
 *
 * The pill hangs to the left because the emphasised point is the last one, so
 * it is always hard against the right edge of the plot.
 */
export function EndpointDot({
  cx,
  cy,
  value,
  color,
  show,
  index,
}: {
  cx?: number;
  cy?: number;
  /** An Area hands its dots a [base, value] pair; a Line hands them a number. */
  value?: string | number | (string | number)[];
  color: string;
  show?: boolean;
  /** recharts renders dots into an array, so the returned element carries its own key. */
  index?: number;
}) {
  if (cx == null || cy == null) return null;
  if (!show) return <circle key={index} cx={cx} cy={cy} r={0} fill="none" />;
  const point = Array.isArray(value) ? value[value.length - 1] : value;
  const label = typeof point === "number" ? formatNumber(point) : String(point ?? "");
  // Estimated rather than measured: getComputedTextLength would force a second
  // layout pass on every point, and the pill only has to enclose the digits.
  const width = label.length * 7 + 16;
  return (
    <g key={index} className="ak-endpoint">
      <rect
        className="ak-endpoint-pill"
        x={cx - width - 12}
        y={cy - 11}
        width={width}
        height={22}
        rx={11}
      />
      <text className="ak-endpoint-value" x={cx - width / 2 - 12} y={cy + 4} textAnchor="middle">
        {label}
      </text>
      <circle cx={cx} cy={cy} r={4.5} fill={color} stroke="var(--ak-surface)" strokeWidth={2} />
    </g>
  );
}
