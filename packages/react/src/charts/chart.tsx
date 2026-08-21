import { type CSSProperties, type ReactElement, useId } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "../lib/cn.js";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

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
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
