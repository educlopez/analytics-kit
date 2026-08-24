import { useId } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart as RechartsComposed,
  Line,
  Tooltip,
  XAxis,
} from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { GlowFilter } from "./patterns.js";
import { COMPOSED_CHART_VARIANTS, type ChartDatum, type ComposedChartVariant } from "./variants.js";

export function ComposedChart({
  data,
  labelKey = "date",
  barKey = "bar",
  lineKey = "line",
  variant = "combo",
  config,
  className,
}: {
  data: ChartDatum[];
  labelKey?: string;
  barKey?: string;
  lineKey?: string;
  variant?: ComposedChartVariant;
  config?: ChartConfig;
  className?: string;
}) {
  const chartConfig: ChartConfig = config ?? {
    [barKey]: { label: barKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
    [lineKey]: { label: lineKey, color: "var(--ak-chart-3, var(--chart-3, #f59e0b))" },
  };
  const barColor = chartConfig[barKey]?.color ?? "var(--ak-chart-1)";
  const lineColor = chartConfig[lineKey]?.color ?? "var(--ak-chart-3)";
  const glowId = `ak-composed-glow-${useId().replace(/:/g, "")}`;

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsComposed data={data}>
        {variant === "highlight" || variant === "overlay" ? (
          <defs>
            <GlowFilter id={glowId} />
            <linearGradient id={`${glowId}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>
        ) : null}
        <CartesianGrid vertical={false} stroke="var(--ak-border)" strokeDasharray="3 6" />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => String(value).slice(0, 10)}
        />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.[0] ? (
              <ChartTooltipBox
                label={String(label ?? "")}
                value={payload[0].value as number}
                name={String(payload[0].name ?? "")}
              />
            ) : null
          }
        />
        {variant === "overlay" ? null : (
          <Bar
            dataKey={barKey}
            fill={barColor}
            isAnimationActive={false}
            radius={4}
            maxBarSize={28}
            fillOpacity={variant === "highlight" ? 0.35 : 0.85}
          />
        )}
        {variant === "overlay" ? (
          <Line
            type="monotone"
            dataKey={barKey}
            stroke="var(--ak-text)"
            strokeWidth={1.6}
            strokeDasharray="3 5"
            dot={false}
            isAnimationActive={false}
          />
        ) : null}
        {variant === "highlight" || variant === "overlay" ? (
          <Area
            type="monotone"
            dataKey={lineKey}
            stroke={lineColor}
            strokeWidth={2.4}
            fill={`url(#${glowId}-fill)`}
            filter={`url(#${glowId})`}
            dot={false}
            isAnimationActive={false}
          />
        ) : (
          <Line
            type="monotone"
            dataKey={lineKey}
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        )}
      </RechartsComposed>
    </ChartContainer>
  );
}

export { COMPOSED_CHART_VARIANTS };
export type { ComposedChartVariant };
