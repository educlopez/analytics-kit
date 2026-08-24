import { useId } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadar, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { DitherDots, GlowFilter } from "./patterns.js";
import { RADAR_CHART_VARIANTS, type ChartDatum, type RadarChartVariant } from "./variants.js";

export function RadarChart({
  data,
  dataKey = "value",
  labelKey = "label",
  variant = "fill",
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: RadarChartVariant;
  config?: ChartConfig;
  className?: string;
}) {
  const chartConfig: ChartConfig = config ?? {
    [dataKey]: { label: dataKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
  };
  const color = chartConfig[dataKey]?.color ?? "var(--ak-chart-1)";
  const uid = useId().replace(/:/g, "");
  const ditherId = `ak-radar-dither-${uid}`;
  const glowId = `ak-radar-glow-${uid}`;
  const fill = variant === "dither" ? `url(#${ditherId})` : variant === "stroke" ? "none" : color;
  const fillOpacity = variant === "fill" || variant === "glow" ? 0.28 : 1;

  if (!data.length) return <p className="ak-muted">No radar data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="72%">
        <defs>
          {variant === "dither" ? <DitherDots id={ditherId} color={color} /> : null}
          {variant === "glow" ? <GlowFilter id={glowId} /> : null}
        </defs>
        <PolarGrid stroke="var(--ak-border)" />
        <PolarAngleAxis dataKey={labelKey} tick={{ fill: "var(--ak-muted)", fontSize: 11 }} />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <ChartTooltipBox
                label={String(payload[0].payload?.[labelKey] ?? "")}
                value={payload[0].value as number}
                name={chartConfig[dataKey]?.label}
              />
            ) : null
          }
        />
        <Radar
          dataKey={dataKey}
          stroke={color}
          strokeWidth={variant === "glow" ? 2.4 : 2}
          fill={fill}
          fillOpacity={fillOpacity}
          filter={variant === "glow" ? `url(#${glowId})` : undefined}
          isAnimationActive={false}
        />
      </RechartsRadar>
    </ChartContainer>
  );
}

export { RADAR_CHART_VARIANTS };
export type { RadarChartVariant };
