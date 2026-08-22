import { useId } from "react";
import { Bar, BarChart as RechartsBar, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { DitherDots, DuotoneGradient, FadeGradient, GlowFilter, HatchPattern } from "./patterns.js";
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
  const uid = useId().replace(/:/g, "");
  const hatchId = `ak-hatch-${uid}`;
  const ditherId = `ak-bar-dither-${uid}`;
  const fadeId = `ak-bar-fade-${uid}`;
  const duotoneId = `ak-bar-duo-${uid}`;
  const glowId = `ak-bar-glow-${uid}`;
  const horizontal = variant === "horizontal";
  const radius = variant === "vertical" || variant === "horizontal" ? 2 : 6;
  const fill =
    variant === "hatched"
      ? `url(#${hatchId})`
      : variant === "dither"
        ? `url(#${ditherId})`
        : variant === "gradient"
          ? `url(#${fadeId})`
          : variant === "duotone"
            ? `url(#${duotoneId})`
            : color;
  const decorated =
    variant === "hatched" ||
    variant === "dither" ||
    variant === "gradient" ||
    variant === "duotone" ||
    variant === "glow";

  if (!data.length) return <p className="ak-muted">No breakdown data.</p>;

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsBar data={data} layout={horizontal ? "vertical" : "horizontal"}>
        {decorated ? (
          <defs>
            {variant === "hatched" ? <HatchPattern id={hatchId} color={color} /> : null}
            {variant === "dither" ? <DitherDots id={ditherId} color={color} /> : null}
            {variant === "gradient" ? <FadeGradient id={fadeId} color={color} /> : null}
            {variant === "duotone" ? <DuotoneGradient id={duotoneId} color={color} /> : null}
            {variant === "glow" ? <GlowFilter id={glowId} /> : null}
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
          fill={fill}
          radius={radius}
          maxBarSize={48}
          filter={variant === "glow" ? `url(#${glowId})` : undefined}
        />
      </RechartsBar>
    </ChartContainer>
  );
}

export { BAR_CHART_VARIANTS };
export type { BarChartVariant };
