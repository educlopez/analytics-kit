import { useId } from "react";
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart as RechartsLine,
  ReferenceArea,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltipBox,
  ChartTooltipRows,
  numericAxisDomain,
  rechartsScale,
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
import {
  LINE_CHART_VARIANTS,
  type AxisScale,
  type ChartDatum,
  type LineChartVariant,
} from "./variants.js";

/**
 * Rolling median and MAD, computed client-side. No model, no service — the
 * point of the anomaly variant is to direct attention, not to be clever.
 */
export function findAnomalyIndexes(values: number[], window = 7, threshold = 3.5): Set<number> {
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

/** Key the projection is merged onto. Internal to the forecast variant. */
const FORECAST_KEY = "__ak_forecast";

/**
 * Least-squares trend over the tail of a series, extended forward.
 *
 * Same footing as the anomaly variant: no model, no service, no call home. A
 * straight line through the recent past is the weakest claim that is still
 * worth drawing, and being obviously a straight line is part of why it reads
 * as a projection rather than as data.
 */
export function projectSeries(values: number[], periods: number, window = 14): number[] {
  if (periods <= 0 || values.length < 2) return [];
  const tail = values.slice(-Math.max(2, Math.min(window, values.length)));
  const n = tail.length;
  const meanX = (n - 1) / 2;
  const meanY = tail.reduce((sum, value) => sum + value, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i += 1) {
    sxy += (i - meanX) * (tail[i] - meanY);
    sxx += (i - meanX) ** 2;
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = meanY - slope * meanX;
  return Array.from({ length: periods }, (_, step) =>
    // Counts do not go negative, and a projection that dips below zero says
    // more about the fit than about the future.
    Math.max(0, Math.round(intercept + slope * (n - 1 + step + 1))),
  );
}

/**
 * Labels for the projected points.
 *
 * Dated labels get the series' own cadence continued — the gap between the
 * last two points, whatever it is. Anything else falls back to `+n`, because
 * inventing a date format the caller never used is worse than admitting the
 * axis is now counting steps.
 */
function forecastLabels(labels: string[], periods: number): string[] {
  const last = labels[labels.length - 1] ?? "";
  const prev = labels[labels.length - 2] ?? "";
  const lastMs = Date.parse(last);
  const prevMs = Date.parse(prev);
  const step = lastMs - prevMs;
  if (!Number.isFinite(lastMs) || !Number.isFinite(prevMs) || step <= 0) {
    return Array.from({ length: periods }, (_, i) => `+${i + 1}`);
  }
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(last);
  return Array.from({ length: periods }, (_, i) => {
    const iso = new Date(lastMs + step * (i + 1)).toISOString();
    return dateOnly ? iso.slice(0, 10) : iso;
  });
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
  forecast: "monotone",
  dual: "monotone",
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
  scale = "linear",
  emphasizeLast = false,
  previous,
  gaps,
  annotations,
  brush = false,
  anomalyThreshold = 3.5,
  forecastPeriods = 7,
  forecastWindow = 14,
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  /** Series keys for the multi-series variants. Falls back to `[dataKey]`. */
  dataKeys?: string[];
  labelKey?: string;
  variant?: LineChartVariant;
  /** Axis scale. symlog is log-like but remains defined through zero. */
  scale?: AxisScale;
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
  /** How many periods the forecast variant projects past the last real point. */
  forecastPeriods?: number;
  /** How much of the tail the trend is fitted to. */
  forecastWindow?: number;
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
      ? findAnomalyIndexes(
          data.map((row) => Number(row[dataKey] ?? 0)),
          7,
          anomalyThreshold,
        )
      : null;

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  if (variant === "forecast") {
    const values = data.map((row) => Number(row[dataKey] ?? 0));
    const projected = projectSeries(values, forecastPeriods, forecastWindow);
    const labels = forecastLabels(
      data.map((row) => String(row[labelKey] ?? "")),
      projected.length,
    );
    // The projection carries the last real point as its own first point, so the
    // dotted segment starts attached to the solid line instead of floating a
    // period away from it.
    const merged: ChartDatum[] = [
      ...data.map((row, index) => ({
        ...row,
        [FORECAST_KEY]: index === last ? values[last] : (null as unknown as number),
      })),
      ...projected.map((value, index) => ({
        [labelKey]: labels[index],
        [dataKey]: null as unknown as number,
        [FORECAST_KEY]: value,
      })),
    ];

    return (
      <ChartContainer className={className} config={chartConfig}>
        <RechartsLine data={merged} syncId={sync?.syncId}>
          <CartesianGrid vertical={false} stroke="var(--ak-border)" strokeDasharray="3 6" />
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value: string) => String(value).slice(0, 10)}
          />
          {scale === "linear" ? null : (
            <YAxis
              scale={rechartsScale(scale)}
              domain={numericAxisDomain(scale)}
              allowDataOverflow
              tickLine={false}
              axisLine={false}
              width={44}
            />
          )}
          {/* Tinting the span is the part that cannot be missed. A dotted stroke
              alone gets read as a style choice; a shaded region says this side of
              the chart was never measured. */}
          {labels.length ? (
            <ReferenceArea
              x1={String(data[last]?.[labelKey] ?? "")}
              x2={labels[labels.length - 1]}
              fill="var(--ak-muted)"
              fillOpacity={0.07}
              stroke="none"
            />
          ) : null}
          <Tooltip
            cursor={{ stroke: "var(--ak-border)" }}
            content={({ active, payload, label: axisLabel }) => {
              if (!active || !payload?.length) return null;
              const actual = payload.find((item) => item.dataKey === dataKey);
              const point = payload.find((item) => item.dataKey === FORECAST_KEY);
              const isProjected = actual?.value == null && point?.value != null;
              return (
                <ChartTooltipBox
                  label={String(axisLabel ?? "")}
                  value={Number(actual?.value ?? point?.value ?? 0)}
                  // Nothing else in the tooltip distinguishes a measured point
                  // from a projected one, and the number looks identical.
                  name={isProjected ? "Projected" : (chartConfig[dataKey]?.label ?? dataKey)}
                />
              );
            }}
          />
          <Line
            type={CURVE[variant]}
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            type={CURVE[variant]}
            dataKey={FORECAST_KEY}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="4 5"
            strokeOpacity={0.65}
            dot={false}
            activeDot={{ r: 3 }}
            legendType="none"
            connectNulls={false}
            isAnimationActive={false}
          />
          {annotationLines(annotations)}
        </RechartsLine>
      </ChartContainer>
    );
  }

  if (variant === "dual") {
    // Two axes only make sense for two series, and silently plotting one of them
    // against an axis the reader cannot attribute is the failure mode of this
    // chart. Fall back to naming the problem.
    if (keys.length < 2) {
      return <p className="ak-muted">A dual-axis line needs two keys in dataKeys.</p>;
    }
    const dualConfig = seriesConfig(keys.slice(0, 2), config);
    const [leftKey, rightKey] = keys;
    const leftColor = dualConfig[leftKey]?.color ?? "var(--ak-chart-1)";
    const rightColor = dualConfig[rightKey]?.color ?? "var(--ak-chart-2)";

    return (
      <div className="grid gap-3">
        <ChartContainer className={className} config={dualConfig}>
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
            {/* Each axis is tinted to its own series. Twin axes are only readable
                when the tick labels tell you which line they belong to, and
                position alone does not — the left axis is not "the first line"
                to anyone who did not build the chart. */}
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              width={46}
              tick={{ fill: leftColor, fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={46}
              tick={{ fill: rightColor, fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: "var(--ak-border)" }}
              content={({ active, payload, label: axisLabel }) =>
                active && payload?.length ? (
                  <ChartTooltipRows
                    label={String(axisLabel ?? "")}
                    rows={payload.map((item) => ({
                      name: dualConfig[String(item.dataKey)]?.label ?? String(item.dataKey),
                      value: Number(item.value ?? 0),
                      color: dualConfig[String(item.dataKey)]?.color ?? "",
                    }))}
                  />
                ) : null
              }
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={leftKey}
              stroke={leftColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={join}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={rightKey}
              stroke={rightColor}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={join}
              isAnimationActive={false}
            />
          </RechartsLine>
        </ChartContainer>
        <ChartLegend keys={keys.slice(0, 2)} config={dualConfig} data={data} />
      </div>
    );
  }

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
            {scale === "linear" ? null : (
              <YAxis
                scale={rechartsScale(scale)}
                domain={numericAxisDomain(scale)}
                allowDataOverflow
                tickLine={false}
                axisLine={false}
                width={44}
              />
            )}
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
        {scale === "linear" ? null : (
          <YAxis
            scale={rechartsScale(scale)}
            domain={numericAxisDomain(scale)}
            allowDataOverflow
            tickLine={false}
            axisLine={false}
            width={44}
          />
        )}
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
