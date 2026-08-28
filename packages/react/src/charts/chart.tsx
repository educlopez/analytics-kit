import { type CSSProperties, type ReactElement, useId } from "react";
import { scaleSymlog } from "d3-scale";
import { ResponsiveContainer } from "recharts";
import { cn } from "../lib/cn.js";
import type { AxisScale } from "./variants.js";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

/**
 * Pinned locale on purpose. Bare `toLocaleString()` follows the runtime's
 * locale, so Node renders `4279` where the browser renders `4,279` and React
 * throws a hydration mismatch on every server-rendered number.
 */
const NUMBER_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/**
 * Fractions are kept rather than rounded away. A pie slice sized from 1.5 that
 * prints "2" is a label disagreeing with its own geometry, and metrics like
 * bounce rate are routinely fractional. Integers still print as integers.
 */
export function formatNumber(value: number): string {
  return Number.isFinite(value) ? NUMBER_FORMAT.format(value) : "—";
}

export const PALETTE = [
  "var(--ak-chart-1, var(--chart-1))",
  "var(--ak-chart-2, var(--chart-2))",
  "var(--ak-chart-3, var(--chart-3))",
  "var(--ak-chart-4, var(--chart-4))",
  "var(--ak-chart-5, var(--chart-5))",
];

/**
 * Resolve the public scale option to something recharts can consume.
 * Recharts assigns the final domain and range, so symlog needs a fresh scale.
 */
export function rechartsScale(scale: AxisScale): "log" | ReturnType<typeof scaleSymlog> {
  return scale === "symlog" ? scaleSymlog() : "log";
}

export function numericAxisDomain(scale: Exclude<AxisScale, "linear">): [number | "auto", "auto"] {
  return scale === "log" ? [1, "auto"] : ["auto", "auto"];
}

/** Config for a multi-series chart, one palette colour per key. */
export function seriesConfig(keys: string[], config?: ChartConfig): ChartConfig {
  const out: ChartConfig = {};
  keys.forEach((key, index) => {
    out[key] = {
      label: config?.[key]?.label ?? key,
      color: config?.[key]?.color ?? PALETTE[index % PALETTE.length],
    };
  });
  return out;
}

export function ChartContainer({
  className,
  config,
  children,
}: {
  className?: string;
  config: ChartConfig;
  children: ReactElement;
}) {
  const id = useId().replace(/:/g, "");
  const vars: Record<string, string> = {};
  for (const [key, item] of Object.entries(config)) {
    if (item.color) vars[`--color-${key}`] = item.color;
  }

  return (
    <div
      data-chart={id}
      className={cn("ak-rechart flex h-[220px] w-full justify-center text-xs", className)}
      style={vars as CSSProperties}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Multi-series tooltip. A stacked chart is unreadable with a single value, so
 * every series in the hovered slot gets a row, plus a total when it means
 * something (it does for stacked, not for grouped).
 */
export function ChartTooltipRows({
  label,
  rows,
  total,
}: {
  label?: string;
  rows: { name: string; value: number; color: string }[];
  total?: boolean;
}) {
  if (!rows.length) return null;
  const sum = rows.reduce((acc, row) => acc + row.value, 0);
  return (
    <div className="rounded-lg border border-[color:var(--ak-border)] bg-[color:var(--ak-surface)] px-2.5 py-1.5 text-xs shadow-md">
      {label ? <p className="mb-1 text-[color:var(--ak-muted)]">{label}</p> : null}
      <ul className="ak-legend">
        {rows.map((row) => (
          <li key={row.name}>
            {/* Swatch and name are one unit — left them separate and
                space-between strands the dot at the far edge. */}
            <span className="ak-legend-name">
              <i style={{ background: row.color }} />
              {row.name}
            </span>
            <strong>{formatNumber(row.value)}</strong>
          </li>
        ))}
        {total && rows.length > 1 ? (
          <li className="ak-legend-total">
            <span>Total</span>
            <strong>{formatNumber(sum)}</strong>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

/** Series legend for the multi-series variants, totalled over the whole range. */
export function ChartLegend({
  keys,
  config,
  data,
}: {
  keys: string[];
  config: ChartConfig;
  data: Record<string, string | number>[];
}) {
  return (
    // Row layout, not the stacked list: this legend sits under a full-width
    // chart, where the list's space-between would strand each value at the far
    // edge of the card.
    <ul className="ak-legend ak-legend-row">
      {keys.map((key) => (
        <li key={key}>
          <i style={{ background: config[key]?.color }} />
          <span>{config[key]?.label ?? key}</span>
          <strong>{formatNumber(data.reduce((acc, row) => acc + Number(row[key] ?? 0), 0))}</strong>
        </li>
      ))}
    </ul>
  );
}

export function ChartTooltipBox({
  label,
  value,
  name,
}: {
  label?: string;
  value?: string | number;
  name?: string;
}) {
  if (value == null) return null;
  return (
    <div className="rounded-lg border border-[color:var(--ak-border)] bg-[color:var(--ak-surface)] px-2.5 py-1.5 text-xs shadow-md">
      {label ? <p className="mb-1 text-[color:var(--ak-muted)]">{label}</p> : null}
      <p className="font-medium text-[color:var(--ak-text)]">
        {name ? `${name}: ` : null}
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
    </div>
  );
}
