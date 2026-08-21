import { useId } from "react";
import { Bar, BarChart as RechartsBar, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { BAR_CHART_VARIANTS, type BarChartVariant, type ChartDatum } from "./variants.js";

export function BarChart({
  data,
  dataKey = "value",
  labelKey = "label",
  variant = "vertical",
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: BarChartVariant;
  config?: ChartConfig;
  className?: string;
}) {
  const chartConfig: ChartConfig = config ?? {
    [dataKey]: { label: dataKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
  };
  const color = chartConfig[dataKey]?.color ?? "var(--ak-chart-1)";
  const hatchId = `ak-hatch-${useId().replace(/:/g, "")}`;
  const horizontal = variant === "horizontal";
  const radius = variant === "rounded" || variant === "hatched" ? 6 : 2;

  if (!data.length) return <p className="ak-muted">No breakdown data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsBar data={data} layout={horizontal ? "vertical" : "horizontal"}>
        {variant === "hatched" ? (
          <defs>
            <pattern id={hatchId} patternUnits="userSpaceOnUse" width="6" height="6">
              <path d="M0 6L6 0" stroke={color} strokeWidth="1.5" />
            </pattern>
          </defs>
        ) : null}
        <CartesianGrid
          vertical={!horizontal}
          horizontal={horizontal}
          stroke="var(--ak-border)"
          strokeDasharray="3 6"
        />
        {horizontal ? (
          <XAxis type="number" tickLine={false} axisLine={false} hide />
        ) : (
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: string) => String(value).slice(0, 8)}
          />
        )}
        {horizontal ? (
          <YAxis
            type="category"
            dataKey={labelKey}
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(value: string) => String(value).slice(0, 10)}
          />
        ) : null}
        <Tooltip
          cursor={{ fill: "var(--ak-surface-2)" }}
          content={({ active, payload, label }) =>
            active && payload?.[0] ? (
              <ChartTooltipBox
                label={String(label ?? "")}
                value={payload[0].value as number}
                name={chartConfig[dataKey]?.label}
              />
            ) : null
          }
        />
        <Bar
          dataKey={dataKey}
          fill={variant === "hatched" ? `url(#${hatchId})` : color}
          radius={radius}
          maxBarSize={48}
        />
      </RechartsBar>
    </ChartContainer>
  );
}

export { BAR_CHART_VARIANTS };
export type { BarChartVariant };
