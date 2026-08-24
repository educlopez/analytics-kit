import { useId } from "react";
import {
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltipBox,
  ChartTooltipRows,
  formatNumber,
  seriesConfig,
  type ChartConfig,
} from "./chart.js";
import { DitherDots, DuotoneGradient, FadeGradient, GlowFilter, HatchPattern } from "./patterns.js";
import {
  BAR_CHART_VARIANTS,
  BAR_MULTI_VARIANTS,
  type BarChartVariant,
  type ChartDatum,
} from "./variants.js";

export function BarChart({
  data,
  dataKey = "value",
  dataKeys,
  labelKey = "label",
  variant = "vertical",
  config,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  /** Series keys for the multi-series variants. Falls back to `[dataKey]`. */
  dataKeys?: string[];
  labelKey?: string;
  variant?: BarChartVariant;
  config?: ChartConfig;
  className?: string;
}) {
  const multi = BAR_MULTI_VARIANTS.includes(variant);
  const keys = dataKeys?.length ? dataKeys : [dataKey];
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
  const horizontal = variant === "horizontal" || variant === "diverging";
  // Zero-centred bars running both ways, gainers and losers coloured apart.
  const diverging = variant === "diverging";
  // No axes, no grid, no ticks: a display-scale mark for a marketing page.
  const editorial = variant === "editorial";
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

  if (multi) {
    const multiConfig = seriesConfig(keys, config);
    const normalized = variant === "stacked-100";
    // Normalising here rather than in the axis keeps the tooltip honest: it
    // still reports the real counts, only the drawing is rebased to share.
    const rows: ChartDatum[] = normalized
      ? data.map((row) => {
          const total = keys.reduce((acc, key) => acc + Number(row[key] ?? 0), 0);
          const scaled: ChartDatum = { ...row };
          for (const key of keys) {
            scaled[`${key}__share`] = total > 0 ? (Number(row[key] ?? 0) / total) * 100 : 0;
          }
          return scaled;
        })
      : data;

    return (
      <div className="grid gap-3">
        <ChartContainer className={className} config={multiConfig}>
          <RechartsBar data={rows}>
            <CartesianGrid vertical={false} stroke="var(--ak-border)" strokeDasharray="3 6" />
            <XAxis
              dataKey={labelKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => String(value).slice(0, 8)}
            />
            {normalized ? (
              <YAxis
                tickLine={false}
                axisLine={false}
                width={34}
                domain={[0, 100]}
                // Explicit ticks: left to itself recharts derives them from the
                // summed shares and lands on 100.00000000000001.
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value: number) => `${Math.round(value)}%`}
              />
            ) : null}
            <Tooltip
              cursor={{ fill: "var(--ak-surface-2)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltipRows
                    label={String(label ?? "")}
                    total={variant !== "grouped"}
                    rows={keys.map((key) => ({
                      name: multiConfig[key]?.label ?? key,
                      value: Number(payload[0]?.payload?.[key] ?? 0),
                      color: multiConfig[key]?.color ?? "",
                    }))}
                  />
                ) : null
              }
            />
            {keys.map((key) => (
              <Bar
                key={key}
                dataKey={normalized ? `${key}__share` : key}
                stackId={variant === "grouped" ? undefined : "ak-stack"}
                fill={multiConfig[key]?.color}
                isAnimationActive={false}
                radius={variant === "grouped" ? 2 : 0}
                maxBarSize={48}
              />
            ))}
          </RechartsBar>
        </ChartContainer>
        <ChartLegend keys={keys} config={multiConfig} data={data} />
      </div>
    );
  }

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
        {editorial ? null : (
          <CartesianGrid
            vertical={!horizontal}
            horizontal={horizontal}
            stroke="var(--ak-border)"
            strokeDasharray="3 6"
          />
        )}
        {diverging ? <ReferenceLine x={0} stroke="var(--ak-border)" strokeWidth={1.5} /> : null}
        {horizontal ? (
          <XAxis type="number" tickLine={false} axisLine={false} hide />
        ) : editorial ? (
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval={0}
            tickFormatter={(value: string) => String(value).slice(0, 12)}
          />
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
          // Same mount-animation gap as the pie: without this the bars never
          // paint until something forces a re-render.
          isAnimationActive={false}
          radius={radius}
          maxBarSize={editorial ? 96 : 48}
          filter={variant === "glow" ? `url(#${glowId})` : undefined}
        >
          {diverging
            ? data.map((row) => (
                <Cell
                  key={String(row[labelKey])}
                  fill={
                    Number(row[dataKey] ?? 0) >= 0
                      ? "var(--ak-chart-2, var(--chart-2))"
                      : "var(--ak-chart-3, var(--chart-3))"
                  }
                />
              ))
            : null}
          {editorial ? (
            // The value belongs inside the bar: with no axis to read against,
            // an unlabelled bar is a shape rather than a number.
            <LabelList
              dataKey={dataKey}
              position="insideTop"
              offset={14}
              className="ak-bar-editorial-label"
              formatter={(value: number) => formatNumber(value)}
            />
          ) : null}
        </Bar>
      </RechartsBar>
    </ChartContainer>
  );
}

export { BAR_CHART_VARIANTS };
export type { BarChartVariant };
