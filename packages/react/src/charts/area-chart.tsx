import { useId } from "react";
import { Area, AreaChart as RechartsArea, CartesianGrid, Tooltip, XAxis } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { AREA_CHART_VARIANTS, type AreaChartVariant, type ChartDatum } from "./variants.js";

const CURVE: Record<AreaChartVariant, "monotone" | "linear" | "natural" | "step"> = {
  gradient: "monotone",
  linear: "linear",
  natural: "natural",
  step: "step",
  dots: "monotone",
  spark: "monotone",
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
  const fill = variant === "gradient" || variant === "spark" || variant === "dots";
  const chartConfig: ChartConfig = config ?? {
    [dataKey]: { label: dataKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
  };
  const color = chartConfig[dataKey]?.color ?? "var(--ak-chart-1)";
  const gradId = `ak-area-${useId().replace(/:/g, "")}`;

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsArea
        data={data}
        margin={spark ? { top: 4, right: 0, left: 0, bottom: 0 } : undefined}
      >
        {fill ? (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
        ) : null}
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
          strokeWidth={2}
          fill={fill ? `url(#${gradId})` : "none"}
          dot={variant === "dots" ? { r: 3, fill: color, strokeWidth: 0 } : false}
          activeDot={spark ? false : { r: 4 }}
        />
      </RechartsArea>
    </ChartContainer>
  );
}

export { AREA_CHART_VARIANTS };
export type { AreaChartVariant };
