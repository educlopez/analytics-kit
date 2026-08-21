import { CartesianGrid, Line, LineChart as RechartsLine, Tooltip, XAxis } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { LINE_CHART_VARIANTS, type ChartDatum, type LineChartVariant } from "./variants.js";

const CURVE: Record<LineChartVariant, "monotone" | "linear" | "step"> = {
  monotone: "monotone",
  linear: "linear",
  step: "step",
  dashed: "monotone",
  dots: "monotone",
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

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsLine data={data}>
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
        <Line
          type={CURVE[variant]}
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          strokeDasharray={variant === "dashed" ? "6 4" : undefined}
          dot={variant === "dots" ? { r: 3, fill: color, strokeWidth: 0 } : false}
          activeDot={{ r: 4 }}
        />
      </RechartsLine>
    </ChartContainer>
  );
}

export { LINE_CHART_VARIANTS };
export type { LineChartVariant };
