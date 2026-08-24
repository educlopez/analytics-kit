import { useId } from "react";
import { Area, AreaChart as RechartsArea, CartesianGrid, Tooltip, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltipBox,
  ChartTooltipRows,
  seriesConfig,
  type ChartConfig,
} from "./chart.js";

import { BarStripePattern, DitherDots, GlowFilter, HatchPattern } from "./patterns.js";
import {
  connectNulls,
  EndpointDot,
  PREVIOUS_KEY,
  withPrevious,
  type GapMode,
} from "./treatments.js";
import {
  AREA_CHART_VARIANTS,
  AREA_MULTI_VARIANTS,
  type AreaChartVariant,
  type ChartDatum,
} from "./variants.js";

const CURVE: Record<AreaChartVariant, "monotone" | "linear" | "natural" | "step"> = {
  gradient: "monotone",
  linear: "linear",
  natural: "natural",
  step: "step",
  dots: "monotone",
  spark: "monotone",
  dither: "monotone",
  glow: "monotone",
  hatched: "monotone",
  bars: "monotone",
  solid: "monotone",
  stacked: "monotone",
  stream: "natural",
};

interface EndpointProps {
  cx?: number;
  cy?: number;
  value?: number | number[];
  index?: number;
}

export function AreaChart({
  data,
  dataKey = "value",
  dataKeys,
  labelKey = "date",
  variant = "gradient",
  emphasizeLast = false,
  previous,
  gaps,
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  /** Series keys for the multi-series variants. Falls back to `[dataKey]`. */
  dataKeys?: string[];
  labelKey?: string;
  variant?: AreaChartVariant;
  /** Terminal dot plus a value pill on the final point. */
  emphasizeLast?: boolean;
  /** Previous-period rows, drawn dashed underneath and aligned by index. */
  previous?: ChartDatum[];
  /** How nulls are drawn. Defaults to bridging across them. */
  gaps?: GapMode;
  config?: ChartConfig;
  className?: string;
}) {
  const spark = variant === "spark";
  const multi = AREA_MULTI_VARIANTS.includes(variant);
  const keys = dataKeys?.length ? dataKeys : [dataKey];
  const faded =
    variant === "gradient" || variant === "spark" || variant === "dots" || variant === "glow";
  const chartConfig: ChartConfig = config ?? {
    [dataKey]: { label: dataKey, color: "var(--ak-chart-1, var(--chart-1, #2563eb))" },
  };
  const color = chartConfig[dataKey]?.color ?? "var(--ak-chart-1)";
  const uid = useId().replace(/:/g, "");
  const gradId = `ak-area-${uid}`;
  const ditherId = `ak-dither-${uid}`;
  const hatchId = `ak-area-hatch-${uid}`;
  const barsId = `ak-area-bars-${uid}`;
  const glowId = `ak-glow-${uid}`;
  const last = data.length - 1;
  const rows = withPrevious(data, previous, dataKey);
  const join = connectNulls(gaps);
  const fill =
    variant === "dither"
      ? `url(#${ditherId})`
      : variant === "hatched"
        ? `url(#${hatchId})`
        : variant === "bars"
          ? `url(#${barsId})`
          : faded
            ? `url(#${gradId})`
            : variant === "solid"
              ? color
              : "none";

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  if (multi) {
    const stackConfig = seriesConfig(keys, config);
    const stream = variant === "stream";
    return (
      <div className="grid gap-3">
        <ChartContainer className={className} config={stackConfig}>
          {/* silhouette centres the stack on a floating baseline, which is what
              makes each ribbon's own thickness its value. */}
          <RechartsArea data={data} stackOffset={stream ? "silhouette" : "none"}>
            {/* A stream has no meaningful zero, so gridlines would invite
                reading heights off an axis that means nothing. */}
            {stream ? null : (
              <CartesianGrid vertical={false} stroke="var(--ak-border)" strokeDasharray="3 6" />
            )}
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
                active && payload?.length ? (
                  <ChartTooltipRows
                    label={String(label ?? "")}
                    total
                    rows={payload.map((item) => ({
                      name: stackConfig[String(item.dataKey)]?.label ?? String(item.dataKey),
                      value: Number(item.value ?? 0),
                      color: stackConfig[String(item.dataKey)]?.color ?? "",
                    }))}
                  />
                ) : null
              }
            />
            {keys.map((key) => (
              <Area
                key={key}
                type={CURVE[variant]}
                dataKey={key}
                stackId="ak-stack"
                stroke={stream ? "none" : stackConfig[key]?.color}
                strokeWidth={1}
                fill={stackConfig[key]?.color}
                fillOpacity={stream ? 0.85 : 0.62}
                // Same mount-animation gap as the other recharts marks: without
                // this the bands never paint until something forces a re-render.
                isAnimationActive={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </RechartsArea>
        </ChartContainer>
        <ChartLegend keys={keys} config={stackConfig} data={data} />
      </div>
    );
  }

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsArea
        data={rows}
        margin={spark ? { top: 4, right: 0, left: 0, bottom: 0 } : undefined}
      >
        <defs>
          {faded ? (
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={variant === "glow" ? 0.55 : 0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          ) : null}
          {variant === "dither" ? <DitherDots id={ditherId} color={color} /> : null}
          {variant === "hatched" ? <HatchPattern id={hatchId} color={color} /> : null}
          {variant === "bars" ? <BarStripePattern id={barsId} color={color} /> : null}
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
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const point = payload.find((item) => item.dataKey === dataKey) ?? payload[0];
              if (!previous?.length) {
                return (
                  <ChartTooltipBox
                    label={String(label ?? "")}
                    value={point.value as number}
                    name={chartConfig[dataKey]?.label}
                  />
                );
              }
              return (
                <ChartTooltipRows
                  label={String(label ?? "")}
                  rows={[
                    {
                      name: chartConfig[dataKey]?.label ?? dataKey,
                      value: Number(point.value ?? 0),
                      color,
                    },
                    {
                      name: "Previous",
                      value: Number(point.payload?.[PREVIOUS_KEY] ?? 0),
                      color: "var(--ak-muted)",
                    },
                  ]}
                />
              );
            }}
          />
        )}
        {previous?.length ? (
          // An unfilled Area, not a Line: the AreaChart container does not
          // render Line children, so a Line here silently draws nothing.
          <Area
            type={CURVE[variant]}
            dataKey={PREVIOUS_KEY}
            stroke="var(--ak-muted)"
            strokeWidth={1.4}
            strokeOpacity={0.55}
            strokeDasharray="5 4"
            fill="none"
            dot={false}
            activeDot={false}
            legendType="none"
            tooltipType="none"
            connectNulls={join}
            isAnimationActive={false}
          />
        ) : null}
        <Area
          type={CURVE[variant]}
          dataKey={dataKey}
          stroke={color}
          strokeWidth={variant === "glow" ? 2.5 : 2}
          fill={fill}
          fillOpacity={variant === "solid" ? 0.22 : 1}
          filter={variant === "glow" ? `url(#${glowId})` : undefined}
          dot={variant === "dots" ? { r: 3, fill: color, strokeWidth: 0 } : false}
          connectNulls={join}
          activeDot={spark ? false : { r: 4 }}
        />
        {emphasizeLast ? (
          // Its own bare layer so the endpoint composes with the variants that
          // already render their own dots. Area, not Line, for the same reason
          // as the ghost above.
          <Area
            type={CURVE[variant]}
            dataKey={dataKey}
            stroke="none"
            fill="none"
            legendType="none"
            tooltipType="none"
            isAnimationActive={false}
            activeDot={false}
            dot={({ cx, cy, value, index }: EndpointProps) => (
              <EndpointDot
                cx={cx}
                cy={cy}
                value={value}
                color={color}
                show={index === last}
                index={index}
              />
            )}
          />
        ) : null}
      </RechartsArea>
    </ChartContainer>
  );
}

export { AREA_CHART_VARIANTS };
export type { AreaChartVariant };
