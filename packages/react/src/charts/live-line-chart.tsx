import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart as RechartsLine, Tooltip, XAxis } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { GlowFilter, PingDot } from "./patterns.js";
import { LIVE_LINE_CHART_VARIANTS, type ChartDatum, type LiveLineChartVariant } from "./variants.js";

export function LiveLineChart({
  data,
  dataKey = "value",
  labelKey = "date",
  variant = "stream",
  windowSize = 14,
  intervalMs = 700,
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: LiveLineChartVariant;
  windowSize?: number;
  intervalMs?: number;
  config?: ChartConfig;
  className?: string;
}) {
  const [end, setEnd] = useState(Math.min(windowSize, data.length));
  const chartConfig: ChartConfig = config ?? {
    [dataKey]: { label: dataKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
  };
  const color = chartConfig[dataKey]?.color ?? "var(--ak-chart-1)";

  useEffect(() => {
    setEnd((current) => {
      if (!data.length) return 0;
      if (current === 0 || current > data.length) return Math.min(windowSize, data.length);
      return current;
    });
  }, [data.length, windowSize]);

  useEffect(() => {
    if (data.length <= windowSize) return;
    const id = window.setInterval(() => {
      setEnd((current) => (current >= data.length ? windowSize : current + 1));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [data.length, intervalMs, windowSize]);

  const slice = data.slice(Math.max(0, end - windowSize), end);
  const last = slice.length - 1;

  if (!slice.length) return <p className="ak-muted">No live series.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsLine data={slice}>
        {variant === "glow" ? (
          <defs>
            <GlowFilter id="ak-live-glow" />
          </defs>
        ) : null}
        <CartesianGrid vertical={false} stroke="var(--ak-border)" strokeDasharray="3 6" />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={20}
          tickFormatter={(value: string) => String(value).slice(5, 10)}
        />
        <Tooltip
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
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={variant === "glow" ? 2.4 : 2}
          strokeDasharray={variant === "dashed" ? "5 4" : undefined}
          filter={variant === "glow" ? "url(#ak-live-glow)" : undefined}
          isAnimationActive={false}
          dot={
            variant === "stream"
              ? ({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) => (
                  <PingDot cx={cx} cy={cy} color={color} last={index === last} />
                )
              : false
          }
        />
      </RechartsLine>
    </ChartContainer>
  );
}

export { LIVE_LINE_CHART_VARIANTS };
export type { LiveLineChartVariant };
