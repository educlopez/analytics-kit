import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
} from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { PROFIT_LOSS_CHART_VARIANTS, type ChartDatum, type ProfitLossChartVariant } from "./variants.js";

export function ProfitLossChart({
  data,
  dataKey = "value",
  labelKey = "date",
  variant = "fill",
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: ProfitLossChartVariant;
  config?: ChartConfig;
  className?: string;
}) {
  const rows = data.map((row) => {
    const value = Number(row[dataKey] ?? 0);
    return {
      ...row,
      [dataKey]: value,
      up: value > 0 ? value : 0,
      down: value < 0 ? value : 0,
    };
  });
  const chartConfig: ChartConfig = config ?? {
    up: { label: "Up", color: "var(--ak-up)" },
    down: { label: "Down", color: "var(--ak-down)" },
  };

  if (!rows.length) return <p className="ak-muted">No series data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <ComposedChart data={rows}>
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
                value={payload[0].payload?.[dataKey] as number}
              />
            ) : null
          }
        />
        {variant === "bars" ? (
          <>
            <Bar dataKey="up" fill="var(--ak-up)" maxBarSize={18} radius={2} />
            <Bar dataKey="down" fill="var(--ak-down)" maxBarSize={18} radius={2} />
          </>
        ) : variant === "stroke" ? (
          <Line type="monotone" dataKey={dataKey} stroke="var(--ak-chart-1)" strokeWidth={2} dot={false} />
        ) : (
          <>
            <Area type="monotone" dataKey="up" stroke="var(--ak-up)" fill="var(--ak-up)" fillOpacity={0.28} />
            <Area type="monotone" dataKey="down" stroke="var(--ak-down)" fill="var(--ak-down)" fillOpacity={0.28} />
          </>
        )}
      </ComposedChart>
    </ChartContainer>
  );
}

export { PROFIT_LOSS_CHART_VARIANTS };
export type { ProfitLossChartVariant };
