import { useId } from "react";
import { CartesianGrid, Line, LineChart as RechartsLine, Tooltip, XAxis } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { GlowFilter, PingDot, RainbowGradient, ValueDot } from "./patterns.js";
import { LINE_CHART_VARIANTS, type ChartDatum, type LineChartVariant } from "./variants.js";

const CURVE: Record<LineChartVariant, "monotone" | "linear" | "step"> = {
  monotone: "monotone",
  linear: "linear",
  step: "step",
  dashed: "monotone",
  dots: "monotone",
  dither: "monotone",
  glow: "monotone",
  ping: "monotone",
  rainbow: "monotone",
  values: "monotone",
};

export function LineChart({
  data,
  dataKey = "value",
  labelKey = "date",
  variant = "monotone",
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: LineChartVariant;
  config?: ChartConfig;
  className?: string;
}) {
  const chartConfig: ChartConfig = config ?? {
    [dataKey]: { label: dataKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
  };
  const color = chartConfig[dataKey]?.color ?? "var(--ak-chart-1)";
  const uid = useId().replace(/:/g, "");
  const glowId = `ak-line-glow-${uid}`;
  const rainbowId = `ak-line-rainbow-${uid}`;
  const last = data.length - 1;
  const stroke = variant === "rainbow" ? `url(#${rainbowId})` : color;

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsLine data={data}>
        {variant === "glow" || variant === "rainbow" ? (
          <defs>
            {variant === "glow" ? <GlowFilter id={glowId} /> : null}
            {variant === "rainbow" ? <RainbowGradient id={rainbowId} /> : null}
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
          cursor={{ stroke: "var(--ak-border)" }}
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
        {variant === "glow" ? (
          <Line
            type={CURVE[variant]}
            dataKey={dataKey}
            stroke={color}
            strokeWidth={10}
            strokeOpacity={0.22}
            dot={false}
            activeDot={false}
            legendType="none"
            tooltipType="none"
            isAnimationActive={false}
          />
        ) : null}
        <Line
          type={CURVE[variant]}
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={variant === "glow" || variant === "rainbow" ? 2.5 : 2}
          strokeDasharray={
            variant === "dashed" ? "6 4" : variant === "dither" ? "0.1 5" : undefined
          }
          strokeLinecap={variant === "dither" ? "round" : undefined}
          filter={variant === "glow" ? `url(#${glowId})` : undefined}
          dot={
            variant === "dots"
              ? { r: 3, fill: color, strokeWidth: 0 }
              : variant === "ping"
                ? ({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) => (
                    <PingDot cx={cx} cy={cy} color={color} last={index === last} />
                  )
                : variant === "values"
                  ? ({
                      cx,
                      cy,
                      value,
                      index,
                    }: {
                      cx?: number;
                      cy?: number;
                      value?: number;
                      index?: number;
                    }) => (
                      <ValueDot
                        cx={cx}
                        cy={cy}
                        value={value}
                        color={color}
                        show={index === last || (index ?? 0) % 5 === 0}
                      />
                    )
                  : false
          }
          activeDot={{ r: 4 }}
        />
      </RechartsLine>
    </ChartContainer>
  );
}

export { LINE_CHART_VARIANTS };
export type { LineChartVariant };
