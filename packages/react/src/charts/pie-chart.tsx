import { useId } from "react";
import { Cell, Pie, PieChart as RechartsPie, RadialBar, RadialBarChart, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipBox, formatNumber, type ChartConfig } from "./chart.js";
import { DitherDots, GlowFilter } from "./patterns.js";
import { PIE_CHART_VARIANTS, type ChartDatum, type PieChartVariant } from "./variants.js";

const PALETTE = [
  "var(--ak-chart-1, var(--chart-1))",
  "var(--ak-chart-2, var(--chart-2))",
  "var(--ak-chart-3, var(--chart-3))",
  "var(--ak-chart-4, var(--chart-4))",
  "var(--ak-chart-5, var(--chart-5))",
];

export function PieChart({
  data,
  dataKey = "value",
  labelKey = "label",
  variant = "donut",
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: PieChartVariant;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const glowId = `ak-pie-glow-${uid}`;
  const config: ChartConfig = Object.fromEntries(
    data.map((row, index) => [
      String(row[labelKey]),
      { label: String(row[labelKey]), color: PALETTE[index % PALETTE.length] },
    ]),
  );
  // The half arc gets a bigger radius: a semicircle drawn at the full-circle
  // radius leaves the top half of the container empty.
  const inner = variant === "pie" ? 0 : variant === "rounded" ? 52 : variant === "half" ? 104 : 58;
  const total = data.reduce((sum, row) => sum + Number(row[dataKey] ?? 0), 0);
  const half = variant === "half";
  // Leader lines to labels outside the ring, so the eye stops shuttling
  // between a swatch and an arc.
  const callout = variant === "callout";
  const showLegend = variant !== "pie" && !half && !callout;

  if (!data.length) return <p className="ak-muted">No breakdown data.</p>;

  return (
    <div
      className={variant === "legend" ? "grid gap-3 sm:grid-cols-[1fr_minmax(0,1fr)]" : undefined}
    >
      <ChartContainer className={className} config={config}>
        {variant === "radial" ? (
          <RadialBarChart
            data={data}
            innerRadius="18%"
            outerRadius="92%"
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey={dataKey} background cornerRadius={6} isAnimationActive={false}>
              {data.map((row, index) => (
                <Cell key={String(row[labelKey])} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </RadialBar>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <ChartTooltipBox
                    label={String(payload[0].payload?.[labelKey] ?? payload[0].name ?? "")}
                    value={payload[0].value as number}
                  />
                ) : null
              }
            />
          </RadialBarChart>
        ) : (
          <RechartsPie>
            <defs>
              {variant === "dither"
                ? data.map((row, index) => (
                    <DitherDots
                      key={String(row[labelKey])}
                      id={`${uid}-slice-${index}`}
                      color={PALETTE[index % PALETTE.length]}
                    />
                  ))
                : null}
              {variant === "glow" ? <GlowFilter id={glowId} /> : null}
            </defs>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={labelKey}
              // A semicircle: half the height, and the vacated middle becomes
              // room for the total instead of dead space.
              startAngle={half ? 180 : 0}
              endAngle={half ? 0 : 360}
              cy={half ? "78%" : "50%"}
              // Recharts runs the mount animation off a post-hydration effect that
              // never fires here, leaving the pie layer with zero sectors until
              // something forces a re-render. Drawing straight away is the fix.
              isAnimationActive={false}
              innerRadius={inner}
              paddingAngle={variant === "rounded" ? 4 : 0}
              cornerRadius={variant === "rounded" ? 10 : 0}
              stroke="var(--ak-surface)"
              strokeWidth={2}
              filter={variant === "glow" ? `url(#${glowId})` : undefined}
              outerRadius={half ? 140 : callout ? 66 : 80}
              label={
                callout
                  ? ({ name, percent }: { name?: string; percent?: number }) =>
                      `${name} ${Math.round((percent ?? 0) * 100)}%`
                  : undefined
              }
              labelLine={callout ? { stroke: "var(--ak-border)" } : false}
            >
              {data.map((row, index) => (
                <Cell
                  key={String(row[labelKey])}
                  fill={
                    variant === "dither"
                      ? `url(#${uid}-slice-${index})`
                      : PALETTE[index % PALETTE.length]
                  }
                />
              ))}
            </Pie>
            {half ? (
              <text className="ak-pie-total" x="50%" y="74%" textAnchor="middle">
                {formatNumber(total)}
              </text>
            ) : null}
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <ChartTooltipBox
                    label={String(payload[0].name ?? "")}
                    value={payload[0].value as number}
                  />
                ) : null
              }
            />
          </RechartsPie>
        )}
      </ChartContainer>
      {showLegend ? (
        <ul className="ak-legend">
          {data.map((row, index) => (
            <li key={String(row[labelKey])}>
              <i style={{ background: PALETTE[index % PALETTE.length] }} />
              <span>{String(row[labelKey])}</span>
              <strong>{formatNumber(Number(row[dataKey] ?? 0))}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      {variant === "donut" ||
      variant === "dither" ||
      variant === "rounded" ||
      variant === "glow" ? (
        <p className="sr-only">Total {formatNumber(total)}</p>
      ) : null}
    </div>
  );
}

export { PIE_CHART_VARIANTS };
export type { PieChartVariant };
