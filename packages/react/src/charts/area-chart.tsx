import { useId } from "react";
import { Area, AreaChart as RechartsArea, CartesianGrid, Tooltip, XAxis } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { DitherDots, GlowFilter } from "./patterns.js";
import { AREA_CHART_VARIANTS, type AreaChartVariant, type ChartDatum } from "./variants.js";

const CURVE: Record<AreaChartVariant, "monotone" | "linear" | "natural" | "step"> = {
  gradient: "monotone",
  linear: "linear",
  natural: "natural",
  step: "step",
  dots: "monotone",
  spark: "monotone",
  dither: "monotone",
  glow: "monotone",
};

export function AreaChart({
  data,
  dataKey = "value",
  labelKey = "date",
  variant = "gradient",
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: AreaChartVariant;
  config?: ChartConfig;
  className?: string;
}) {
  const spark = variant === "spark";
  const fill =
    variant === "gradient" ||
    variant === "spark" ||
    variant === "dots" ||
    variant === "dither" ||
    variant === "glow";
  const chartConfig: ChartConfig = config ?? {
    [dataKey]: { label: dataKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
  };
  const color = chartConfig[dataKey]?.color ?? "var(--ak-chart-1)";
  const uid = useId().replace(/:/g, "");
  const gradId = `ak-area-${uid}`;
  const ditherId = `ak-dither-${uid}`;
  const glowId = `ak-glow-${uid}`;
  const fillUrl = variant === "dither" ? `url(#${ditherId})` : fill ? `url(#${gradId})` : "none";

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsArea
        data={data}
        margin={spark ? { top: 4, right: 0, left: 0, bottom: 0 } : undefined}
      >
        <defs>
          {fill && variant !== "dither" ? (
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={variant === "glow" ? 0.55 : 0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          ) : null}
          {variant === "dither" ? <DitherDots id={ditherId} color={color} /> : null}
          {variant === "glow" ? <GlowFilter id={glowId} /> : null}
        </defs>
        {spark ? null : (
          <CartesianGrid vertical={false} stroke="var(--ak-border)" strokeDasharray="3 6" />
        )}
        {spark ? null : (
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value: string) => String(value).slice(0, 10)}
          />
        )}
        {spark ? null : (
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
        )}
        <Area
          type={CURVE[variant]}
          dataKey={dataKey}
          stroke={color}
          strokeWidth={variant === "glow" ? 2.5 : 2}
          fill={fillUrl}
          filter={variant === "glow" ? `url(#${glowId})` : undefined}
          dot={variant === "dots" ? { r: 3, fill: color, strokeWidth: 0 } : false}
          activeDot={spark ? false : { r: 4 }}
        />
      </RechartsArea>
    </ChartContainer>
  );
}

export { AREA_CHART_VARIANTS };
export type { AreaChartVariant };
