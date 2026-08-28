import { formatNumber } from "./chart.js";
import { cn } from "../lib/cn.js";
import {
  SUNBURST_CHART_VARIANTS,
  type SunburstChartVariant,
  type SunburstNode,
} from "./variants.js";

const PALETTE = [
  "var(--ak-chart-1, var(--chart-1))",
  "var(--ak-chart-2, var(--chart-2))",
  "var(--ak-chart-3, var(--chart-3))",
  "var(--ak-chart-4, var(--chart-4))",
  "var(--ak-chart-5, var(--chart-5))",
];

function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function wedge(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

export function SunburstChart({
  data,
  variant = "nest",
  className,
}: {
  data: SunburstNode[];
  variant?: SunburstChartVariant;
  className?: string;
}) {
  const total = data.reduce((sum, node) => sum + node.value, 0) || 1;
  const cx = 110;
  const cy = 110;
  const burst = variant === "burst";

  if (!data.length) return <p className="ak-muted">No hierarchy data.</p>;

  const inner: { path: string; color: string; label: string }[] = [];
  const outer: { path: string; color: string; label: string }[] = [];
  let angle = -Math.PI / 2;
  data.forEach((node, index) => {
    const sweep = (node.value / total) * Math.PI * 2;
    const color = PALETTE[index % PALETTE.length];
    inner.push({
      path: wedge(cx, cy, burst ? 28 : 36, burst ? 62 : 68, angle, angle + sweep),
      color,
      label: node.label,
    });
    const kids = node.children?.length ? node.children : [{ label: node.label, value: node.value }];
    const kidTotal = kids.reduce((sum, kid) => sum + kid.value, 0) || 1;
    let kidAngle = angle;
    kids.forEach((kid) => {
      const kidSweep = (kid.value / kidTotal) * sweep;
      outer.push({
        path: wedge(cx, cy, burst ? 66 : 72, burst ? 104 : 100, kidAngle, kidAngle + kidSweep),
        color,
        label: kid.label,
      });
      kidAngle += kidSweep;
    });
    angle += sweep;
  });

  return (
    <div className={cn("ak-sunburst", className)}>
      <svg viewBox="0 0 220 220" className="ak-gauge-svg" role="img">
        {inner.map((slice) => (
          <path key={`i-${slice.label}`} d={slice.path} fill={slice.color} opacity="0.95" />
        ))}
        {outer.map((slice, index) => (
          <path
            key={`o-${slice.label}-${index}`}
            d={slice.path}
            fill={slice.color}
            opacity="0.55"
          />
        ))}
      </svg>
      <ul className="ak-legend">
        {data.map((node, index) => (
          <li key={node.label}>
            <span className="ak-legend-name">
              <i style={{ background: PALETTE[index % PALETTE.length] }} />
              {node.label}
            </span>
            <strong>{formatNumber(node.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { SUNBURST_CHART_VARIANTS };
export type { SunburstChartVariant };
