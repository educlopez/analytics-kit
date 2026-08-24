import { useId } from "react";
import {
  CartesianGrid,
  Scatter,
  ScatterChart as RechartsScatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { GlowFilter } from "./patterns.js";
import { SCATTER_CHART_VARIANTS, type ChartDatum, type ScatterChartVariant } from "./variants.js";

export function ScatterChart({
  data,
  xKey = "x",
  yKey = "y",
  zKey = "z",
  variant = "dots",
  config,
  className,
}: {
  data: ChartDatum[];
  xKey?: string;
  yKey?: string;
  zKey?: string;
  variant?: ScatterChartVariant;
  config?: ChartConfig;
  className?: string;
}) {
  const chartConfig: ChartConfig = config ?? {
    [yKey]: { label: yKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
  };
  const color = chartConfig[yKey]?.color ?? "var(--ak-chart-1)";
  const glowId = `ak-scatter-glow-${useId().replace(/:/g, "")}`;

  if (!data.length) return <p className="ak-muted">No scatter data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsScatter>
        {variant === "glow" ? (
          <defs>
            <GlowFilter id={glowId} />
          </defs>
        ) : null}
        <CartesianGrid stroke="var(--ak-border)" strokeDasharray="3 6" />
        <XAxis dataKey={xKey} type="number" tickLine={false} axisLine={false} name={xKey} />
        <YAxis dataKey={yKey} type="number" tickLine={false} axisLine={false} name={yKey} />
        {variant === "bubble" ? <ZAxis dataKey={zKey} range={[40, 220]} /> : null}
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <ChartTooltipBox
                label={`${payload[0].payload?.[xKey] ?? ""}`}
                value={payload[0].payload?.[yKey] as number}
                name={yKey}
              />
            ) : null
          }
        />
        <Scatter
          data={data}
          fill={color}
          fillOpacity={variant === "glow" ? 0.85 : 0.75}
          filter={variant === "glow" ? `url(#${glowId})` : undefined}
          isAnimationActive={false}
        />
      </RechartsScatter>
    </ChartContainer>
  );
}

export { SCATTER_CHART_VARIANTS };
export type { ScatterChartVariant };
