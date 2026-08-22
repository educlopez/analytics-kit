import { useId } from "react";
import { Cell, Pie, PieChart as RechartsPie, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import { DitherDots } from "./patterns.js";
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
  const config: ChartConfig = Object.fromEntries(
    data.map((row, index) => [
      String(row[labelKey]),
      { label: String(row[labelKey]), color: PALETTE[index % PALETTE.length] },
    ]),
  );
  const inner = variant === "pie" ? 0 : 58;
  const total = data.reduce((sum, row) => sum + Number(row[dataKey] ?? 0), 0);

  if (!data.length) return <p className="ak-muted">No breakdown data.</p>;

  return (
    <div
      className={variant === "legend" ? "grid gap-3 sm:grid-cols-[1fr_minmax(0,1fr)]" : undefined}
    >
      <ChartContainer className={className} config={config}>
        <RechartsPie>
          {variant === "dither" ? (
            <defs>
              {data.map((row, index) => (
                <DitherDots
                  key={String(row[labelKey])}
                  id={`${uid}-slice-${index}`}
                  color={PALETTE[index % PALETTE.length]}
                />
              ))}
            </defs>
          ) : null}
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={labelKey}
            innerRadius={inner}
            outerRadius={80}
            stroke="var(--ak-surface)"
            strokeWidth={2}
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
      </ChartContainer>
      {variant === "legend" || variant === "donut" || variant === "dither" ? (
        <ul className="ak-legend">
          {data.map((row, index) => (
            <li key={String(row[labelKey])}>
              <i style={{ background: PALETTE[index % PALETTE.length] }} />
              <span>{String(row[labelKey])}</span>
              <strong>{Number(row[dataKey] ?? 0).toLocaleString()}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      {variant === "donut" || variant === "dither" ? (
        <p className="sr-only">Total {Math.round(total).toLocaleString()}</p>
      ) : null}
    </div>
  );
}

export { PIE_CHART_VARIANTS };
export type { PieChartVariant };
