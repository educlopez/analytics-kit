import { useId } from "react";
import { Brush, CartesianGrid, Line, LineChart as RechartsLine, Tooltip, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltipBox,
  ChartTooltipRows,
  seriesConfig,
  type ChartConfig,
} from "./chart.js";
import { GlowFilter, PingDot, RainbowGradient, ValueDot } from "./patterns.js";
import { annotationLines, type Annotation } from "./annotations.js";
import { useSyncGroup } from "./sync.js";
import {
  connectNulls,
  EndpointDot,
  PREVIOUS_KEY,
  withPrevious,
  type GapMode,
} from "./treatments.js";
import { LINE_CHART_VARIANTS, type ChartDatum, type LineChartVariant } from "./variants.js";

/**
 * Rolling median and MAD, computed client-side. No model, no service — the
 * point of the anomaly variant is to direct attention, not to be clever.
 */
function outlierIndexes(values: number[], window = 7, threshold = 3.5): Set<number> {
  const out = new Set<number>();
  if (values.length < window + 2) return out;
  const median = (list: number[]) => {
    const sorted = [...list].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  for (let i = 0; i < values.length; i += 1) {
    const from = Math.max(0, i - window);
    const to = Math.min(values.length, i + window + 1);
    const slice = values.slice(from, to);
    const centre = median(slice);
    const mad = median(slice.map((value) => Math.abs(value - centre)));
    // 0.6745 converts MAD to a standard-deviation-equivalent for normal data.
    const score = mad === 0 ? 0 : (0.6745 * Math.abs(values[i] - centre)) / mad;
    if (score > threshold) out.add(i);
  }
  return out;
}

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
  focus: "monotone",
  anomaly: "monotone",
  riso: "monotone",
};

/** Ring plus a solid centre on the points the rolling MAD flagged. */
function AnomalyDot({
  cx,
  cy,
  index,
  flagged,
}: {
  cx?: number;
  cy?: number;
  index?: number;
  flagged: boolean;
}) {
  if (cx == null || cy == null || !flagged) {
    return <circle key={index} cx={cx ?? 0} cy={cy ?? 0} r={0} fill="none" />;
  }
  return (
    <g key={index}>
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill="none"
        stroke="var(--ak-chart-3, var(--chart-3))"
        strokeWidth={1.6}
      />
      <circle cx={cx} cy={cy} r={2.8} fill="var(--ak-chart-3, var(--chart-3))" />
    </g>
  );
}

interface EndpointProps {
  cx?: number;
  cy?: number;
  value?: number;
  index?: number;
}

export function LineChart({
  data,
  dataKey = "value",
  dataKeys,
  labelKey = "date",
  variant = "monotone",
  emphasizeLast = false,
  previous,
  gaps,
  annotations,
  brush = false,
  anomalyThreshold = 3.5,
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  /** Series keys for the multi-series variants. Falls back to `[dataKey]`. */
  dataKeys?: string[];
  labelKey?: string;
  variant?: LineChartVariant;
  /** Terminal dot plus a value pill on the final point. */
  emphasizeLast?: boolean;
  /** Previous-period rows, drawn dashed underneath and aligned by index. */
  previous?: ChartDatum[];
  /** How nulls are drawn. Defaults to bridging across them. */
  gaps?: GapMode;
  /** Dated markers drawn over the chart — deploys, releases, incidents. */
  annotations?: Annotation[];
  /** Drag-to-zoom strip under the chart. */
  brush?: boolean;
  /**
   * How far from the rolling median a point must sit to be flagged, in
   * MAD-derived standard deviations. Deliberately strict by default: a chart
   * that rings every wobble trains people to ignore the rings.
   */
  anomalyThreshold?: number;
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
  const rows = withPrevious(data, previous, dataKey);
  const join = connectNulls(gaps);
  const sync = useSyncGroup();
  const keys = dataKeys?.length ? dataKeys : [dataKey];
  const outliers =
    variant === "anomaly"
      ? outlierIndexes(
          data.map((row) => Number(row[dataKey] ?? 0)),
          7,
          anomalyThreshold,
        )
      : null;

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  if (variant === "focus") {
    const focusConfig = seriesConfig(keys, config);
    return (
      <div className="grid gap-3">
        <ChartContainer className={className} config={focusConfig}>
          <RechartsLine data={data} syncId={sync?.syncId}>
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
                active && payload?.length ? (
                  <ChartTooltipRows
                    label={String(label ?? "")}
                    rows={payload.map((item) => ({
                      name: focusConfig[String(item.dataKey)]?.label ?? String(item.dataKey),
                      value: Number(item.value ?? 0),
                      color: focusConfig[String(item.dataKey)]?.color ?? "",
                    }))}
                  />
                ) : null
              }
            />
            {keys.map((key) => (
              // Every series drawn faint; CSS promotes the hovered one, so
              // twenty lines stay legible without a second render or extra
              // state. Interaction is the variant.
              <Line
                key={key}
                className="ak-focus-line"
                type="monotone"
                dataKey={key}
                stroke={focusConfig[key]?.color}
                strokeWidth={1.6}
                dot={false}
                activeDot={{ r: 3 }}
                connectNulls={join}
                isAnimationActive={false}
              />
            ))}
          </RechartsLine>
        </ChartContainer>
        <ChartLegend keys={keys} config={focusConfig} data={data} />
      </div>
    );
  }

  return (
    <ChartContainer className={className} config={chartConfig}>
      <RechartsLine
        data={rows}
        syncId={sync?.syncId}
        // Annotation labels sit above the plot area, which has no headroom by
        // default, so they get clipped by the top edge without this.
        margin={annotations?.length ? { top: 20, right: 4, left: 0, bottom: 0 } : undefined}
      >
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
        {previous?.length ? (
          <Line
            type={CURVE[variant]}
            dataKey={PREVIOUS_KEY}
            stroke="var(--ak-muted)"
            strokeWidth={1.4}
            strokeOpacity={0.55}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
            legendType="none"
            tooltipType="none"
            connectNulls={join}
            isAnimationActive={false}
          />
        ) : null}
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
          connectNulls={join}
          // Same mount-animation gap as the area: the line starts with a ~2px
          // stroke-dasharray on a ~1000px path and never advances without a
          // second render, so production drew a 2px stub.
          isAnimationActive={false}
          activeDot={{ r: 4 }}
        />
        {outliers?.size ? (
          <Line
            type={CURVE[variant]}
            dataKey={dataKey}
            stroke="none"
            legendType="none"
            tooltipType="none"
            isAnimationActive={false}
            activeDot={false}
            dot={({ cx, cy, index }: EndpointProps) => (
              <AnomalyDot cx={cx} cy={cy} index={index} flagged={outliers.has(index ?? -1)} />
            )}
          />
        ) : null}
        {emphasizeLast ? (
          // Its own strokeless layer so the endpoint composes with the
          // variants that already render their own dots.
          <Line
            type={CURVE[variant]}
            dataKey={dataKey}
            stroke="none"
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
        {annotationLines(annotations)}
        {brush ? (
          <Brush
            dataKey={labelKey}
            height={22}
            travellerWidth={8}
            stroke="var(--ak-border)"
            fill="var(--ak-surface-2)"
          />
        ) : null}
      </RechartsLine>
    </ChartContainer>
  );
}

export { LINE_CHART_VARIANTS };
export type { LineChartVariant };
