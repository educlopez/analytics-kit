import { Layer, Rectangle, Sankey, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipBox, type ChartConfig } from "./chart.js";
import {
  SANKEY_CHART_VARIANTS,
  type SankeyChartVariant,
  type SankeyLink,
  type SankeyNode,
} from "./variants.js";

const PALETTE = [
  "var(--ak-chart-1, var(--chart-1))",
  "var(--ak-chart-2, var(--chart-2))",
  "var(--ak-chart-3, var(--chart-3))",
  "var(--ak-chart-4, var(--chart-4))",
  "var(--ak-chart-5, var(--chart-5))",
];

export function SankeyChart({
  nodes,
  links,
  data,
  variant = "flow",
  className,
}: {
  nodes?: SankeyNode[];
  links?: SankeyLink[];
  data?: { nodes: SankeyNode[]; links: SankeyLink[] };
  variant?: SankeyChartVariant;
  className?: string;
}) {
  const payload = data ?? { nodes: nodes ?? [], links: links ?? [] };
  const config: ChartConfig = Object.fromEntries(
    payload.nodes.map((node, index) => [
      node.name,
      { label: node.name, color: PALETTE[index % PALETTE.length] },
    ]),
  );

  if (!payload.nodes.length || !payload.links.length) {
    return <p className="ak-muted">No flow data.</p>;
  }

  return (
    <ChartContainer className={className} config={config}>
      <Sankey
        data={payload}
        nodeWidth={14}
        nodePadding={22}
        linkCurvature={variant === "dither" ? 0.35 : 0.5}
        margin={{ top: 8, right: 88, bottom: 8, left: 8 }}
        node={(props) => <SankeyNodeBox {...props} />}
        link={{
          stroke: "var(--ak-chart-1)",
          strokeOpacity: variant === "dither" ? 0.28 : 0.35,
        }}
      >
        <Tooltip
          content={({ active, payload: tip }) =>
            active && tip?.[0] ? (
              <ChartTooltipBox
                label={String(tip[0].name ?? tip[0].payload?.name ?? "Flow")}
                value={(tip[0].value as number) ?? tip[0].payload?.value}
              />
            ) : null
          }
        />
        <Layer />
      </Sankey>
    </ChartContainer>
  );
}

function SankeyNodeBox({
  x,
  y,
  width,
  height,
  index,
  payload,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: { name?: string };
}) {
  if (x == null || y == null || width == null || height == null) return null;
  return (
    <g>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={PALETTE[(index ?? 0) % PALETTE.length]}
        radius={3}
      />
      <text
        x={x + width + 8}
        y={y + height / 2}
        className="ak-sankey-label"
        dominantBaseline="middle"
      >
        {payload?.name}
      </text>
    </g>
  );
}

export { SANKEY_CHART_VARIANTS };
export type { SankeyChartVariant };
