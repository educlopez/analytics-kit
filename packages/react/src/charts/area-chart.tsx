import { useId } from "react";
import {
  scaleLinear as d3ScaleLinear,
  scaleLog as d3ScaleLog,
  scaleSymlog as d3ScaleSymlog,
} from "d3-scale";
import {
  Area,
  AreaChart as RechartsArea,
  Brush,
  CartesianGrid,
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

import {
  BarStripePattern,
  DitherDots,
  GlowFilter,
  GrainFilter,
  HatchPattern,
  RisoFilter,
  ScreentonePattern,
} from "./patterns.js";
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
  AREA_CHART_VARIANTS,
  AREA_MULTI_VARIANTS,
  type AreaChartVariant,
  type AxisScale,
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
  band: "monotone",
  ridge: "natural",
  riso: "monotone",
  screentone: "monotone",
  grain: "monotone",
};

/** Geometry for one independently-normalized ridgeline. */
export function ridgeGeometry(
  values: number[],
  scale: AxisScale,
  width = 100,
  height = 46,
): { points: string; baseline: number } {
  const finite = values.map((value) => (Number.isFinite(value) ? value : 0));
  let baseline = height;
  let y: (value: number) => number;

  if (scale === "log") {
    // Match the Recharts log-axis contract: non-positive values are outside
    // the domain and collapse to the floor rather than producing NaN/-Infinity.
    const max = Math.max(1, ...finite.filter((value) => value > 0));
    const transform = d3ScaleLog()
      .domain([1, max > 1 ? max : 10])
      .range([height, 0])
      .clamp(true);
    y = (value) => (value > 0 ? transform(Math.max(1, value)) : height);
  } else {
    const min = Math.min(0, ...finite);
    const max = Math.max(0, ...finite);
    if (min === max) {
      y = () => height;
    } else if (scale === "linear" && !Number.isFinite(max - min)) {
      // Opposite finite extremes can still overflow when subtracted
      // (`MAX_VALUE - -MAX_VALUE`). Normalize first so interpolation remains
      // finite while preserving their relative geometry and the zero baseline.
      const magnitude = Math.max(Math.abs(min), Math.abs(max));
      const normalizedMin = min / magnitude;
      const normalizedMax = max / magnitude;
      const transform = d3ScaleLinear().domain([normalizedMin, normalizedMax]).range([height, 0]);
      baseline = transform(0);
      y = (value) => transform(value / magnitude);
    } else {
      const transform = (scale === "symlog" ? d3ScaleSymlog() : d3ScaleLinear())
        .domain([min, max])
        .range([height, 0]);
      baseline = transform(0);
      y = transform;
    }
  }

  const points = finite
    .map((value, index) => {
      const x = (index / Math.max(finite.length - 1, 1)) * width;
      return `${x.toFixed(2)},${y(value).toFixed(2)}`;
    })
    .join(" ");
  return { points, baseline };
}

/** One ridgeline: an opaque filled curve on its own baseline. */
function RidgeLane({
  values,
  color,
  offset,
  scale,
}: {
  values: number[];
  color: string;
  offset: number;
  scale: AxisScale;
}) {
  const width = 100;
  const height = 46;
  const { points, baseline } = ridgeGeometry(values, scale, width, height);
  return (
    <svg
      className="ak-ridge-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ marginTop: offset === 0 ? 0 : -18 }}
    >
      <polygon points={`0,${baseline} ${points} ${width},${baseline}`} fill="var(--ak-surface)" />
      <polygon
        points={`0,${baseline} ${points} ${width},${baseline}`}
        fill={color}
        fillOpacity={0.42}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

interface EndpointProps {
  cx?: number;
  cy?: number;
  value?: number | number[];
  index?: number;
}

function AreaScaleAxis({ scale, hidden = false }: { scale: AxisScale; hidden?: boolean }) {
  if (scale === "linear") return null;
  return (
    <YAxis
      // Named scales do not include symlog, but recharts also accepts a
      // d3-compatible callable and assigns its final domain and range.
      scale={rechartsScale(scale)}
      domain={numericAxisDomain(scale)}
      allowDataOverflow
      hide={hidden}
      tickLine={false}
      axisLine={false}
      width={hidden ? 0 : 44}
    />
  );
}

export function AreaChart({
  data,
  dataKey = "value",
  dataKeys,
  labelKey = "date",
  variant = "gradient",
  scale = "linear",
  emphasizeLast = false,
  previous,
  gaps,
  annotations,
  brush = false,
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  /** Series keys for the multi-series variants. Falls back to `[dataKey]`. */
  dataKeys?: string[];
  labelKey?: string;
  variant?: AreaChartVariant;
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
  const risoId = `ak-area-riso-${uid}`;
  const toneId = `ak-area-tone-${uid}`;
  const grainId = `ak-area-grain-${uid}`;
  const last = data.length - 1;
  const rows = withPrevious(data, previous, dataKey);
  const join = connectNulls(gaps);
  const sync = useSyncGroup();
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
              : variant === "screentone"
                ? `url(#${toneId})`
                : variant === "riso" || variant === "grain"
                  ? color
                  : "none";

  if (!data.length) return <p className="ak-muted">No series data.</p>;

  if (variant === "band") {
    if (!previous?.length) {
      return <p className="ak-muted">The band variant needs a previous series.</p>;
    }
    // A ribbon between the two bounds: recharts stacks an invisible floor with
    // a visible span, which is how you draw a band without a range mark.
    const bandRows = data.map((row, index) => {
      const current = Number(row[dataKey] ?? 0);
      const before = Number(previous[index]?.[dataKey] ?? current);
      return {
        ...row,
        __ak_floor: Math.min(current, before),
        __ak_span: Math.abs(current - before),
      };
    });
    return (
      <ChartContainer className={className} config={chartConfig}>
        <RechartsArea data={bandRows} syncId={sync?.syncId}>
          <CartesianGrid vertical={false} stroke="var(--ak-border)" strokeDasharray="3 6" />
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value: string) => String(value).slice(0, 10)}
          />
          <AreaScaleAxis scale={scale} />
          <Tooltip
            cursor={{ stroke: "var(--ak-border)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipRows
                  label={String(label ?? "")}
                  rows={[
                    {
                      name: chartConfig[dataKey]?.label ?? dataKey,
                      value: Number(payload[0]?.payload?.[dataKey] ?? 0),
                      color,
                    },
                    {
                      name: "Previous",
                      value: Number(previous[payload[0]?.payload?.__ak_index ?? 0]?.[dataKey] ?? 0),
                      color: "var(--ak-muted)",
                    },
                  ]}
                />
              ) : null
            }
          />
          <Area
            dataKey="__ak_floor"
            stackId="ak-band"
            stroke="none"
            fill="none"
            legendType="none"
            tooltipType="none"
            isAnimationActive={false}
            activeDot={false}
          />
          <Area
            dataKey="__ak_span"
            stackId="ak-band"
            stroke="none"
            fill={color}
            fillOpacity={0.2}
            legendType="none"
            tooltipType="none"
            isAnimationActive={false}
            activeDot={false}
          />
          <Area
            type={CURVE[variant]}
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill="none"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4 }}
          />
        </RechartsArea>
      </ChartContainer>
    );
  }

  if (multi) {
    const stackConfig = seriesConfig(keys, config);
    const stream = variant === "stream";
    const ridge = variant === "ridge";
    if (ridge) {
      // Each series gets its own baseline, offset upward and allowed to overlap
      // the one behind. Drawn back to front with an opaque fill so the overlap
      // occludes rather than blends — that occlusion is the whole effect.
      return (
        <div className="ak-ridge">
          {[...keys].reverse().map((key, position) => {
            return (
              <div className="ak-ridge-lane" key={key} style={{ zIndex: position }}>
                <span className="ak-ridge-label">{stackConfig[key]?.label ?? key}</span>
                <RidgeLane
                  values={data.map((row) => Number(row[key] ?? 0))}
                  color={stackConfig[key]?.color ?? ""}
                  scale={scale}
                  // position, not index: the pull-up applies to every lane
                  // after the first one *drawn*, and lanes are drawn back to
                  // front so the overlap occludes correctly.
                  offset={position}
                />
              </div>
            );
          })}
        </div>
      );
    }

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
            {/* A stream's centred baseline is not a readable axis, but its
                hidden Y axis still owns the requested numeric transform. */}
            <AreaScaleAxis scale={scale} hidden={stream} />
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
        syncId={sync?.syncId}
        // Annotation labels sit above the plot area, which has no headroom by
        // default, so they get clipped by the top edge without this.
        margin={
          spark
            ? { top: 4, right: 0, left: 0, bottom: 0 }
            : annotations?.length
              ? { top: 20, right: 4, left: 0, bottom: 0 }
              : undefined
        }
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
          {variant === "screentone" ? <ScreentonePattern id={toneId} color={color} /> : null}
          {variant === "riso" ? <RisoFilter id={risoId} /> : null}
          {variant === "grain" ? <GrainFilter id={grainId} /> : null}
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
        {/* Spark keeps its chrome hidden, not its scale semantics. */}
        <AreaScaleAxis scale={scale} hidden={spark} />
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
          filter={
            variant === "glow"
              ? `url(#${glowId})`
              : variant === "riso"
                ? `url(#${risoId})`
                : variant === "grain"
                  ? `url(#${grainId})`
                  : undefined
          }
          dot={variant === "dots" ? { r: 3, fill: color, strokeWidth: 0 } : false}
          connectNulls={join}
          // recharts' mount animation starts clipped to zero width and needs a
          // second render to advance. Production has no StrictMode
          // double-render, so the area stayed a 1px sliver there while looking
          // correct in dev.
          isAnimationActive={false}
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
        {spark ? null : annotationLines(annotations)}
        {brush && !spark ? (
          <Brush
            dataKey={labelKey}
            height={22}
            travellerWidth={8}
            stroke="var(--ak-border)"
            fill="var(--ak-surface-2)"
          />
        ) : null}
      </RechartsArea>
    </ChartContainer>
  );
}

export { AREA_CHART_VARIANTS };
export type { AreaChartVariant };
