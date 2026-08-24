import { formatNumber } from "./chart.js";
import { cn } from "../lib/cn.js";
import { GAUGE_CHART_VARIANTS, type GaugeChartVariant } from "./variants.js";

export function GaugeChart({
  value,
  max = 100,
  label,
  variant = "arc",
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  variant?: GaugeChartVariant;
  className?: string;
}) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const color = "var(--ak-chart-1, var(--chart-1))";

  return (
    <div className={cn("ak-gauge", className)}>
      {variant === "ring" ? (
        <RingGauge ratio={ratio} color={color} />
      ) : variant === "tick" ? (
        <TickGauge ratio={ratio} color={color} />
      ) : (
        <ArcGauge ratio={ratio} color={color} />
      )}
      <p className="ak-gauge-value">{formatGauge(value, max)}</p>
      {label ? <p className="ak-gauge-label">{label}</p> : null}
    </div>
  );
}

function formatGauge(value: number, max: number): string {
  if (max === 100) return `${Math.round(value)}%`;
  return formatNumber(value);
}

function ArcGauge({ ratio, color }: { ratio: number; color: string }) {
  const r = 68;
  const circ = Math.PI * r;
  return (
    <svg viewBox="0 0 180 112" className="ak-gauge-svg" aria-hidden>
      <path
        d="M22 104 A 68 68 0 0 1 158 104"
        fill="none"
        stroke="var(--ak-border)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M22 104 A 68 68 0 0 1 158 104"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - ratio)}
      />
    </svg>
  );
}

function RingGauge({ ratio, color }: { ratio: number; color: string }) {
  const r = 58;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 160 160" className="ak-gauge-svg" aria-hidden>
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--ak-border)" strokeWidth="12" />
      <circle
        cx="80"
        cy="80"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - ratio)}
        transform="rotate(-90 80 80)"
      />
    </svg>
  );
}

function TickGauge({ ratio, color }: { ratio: number; color: string }) {
  const ticks = Array.from({ length: 21 }, (_, index) => index);
  const angle = 180 + 180 * ratio;
  const rad = (angle * Math.PI) / 180;
  const nx = 90 + Math.cos(rad) * 46;
  const ny = 100 + Math.sin(rad) * 46;
  return (
    <svg viewBox="0 0 180 120" className="ak-gauge-svg" aria-hidden>
      {ticks.map((tick) => {
        const deg = 180 + (180 * tick) / 20;
        const t = (deg * Math.PI) / 180;
        const inner = tick % 5 === 0 ? 58 : 64;
        return (
          <line
            key={tick}
            x1={90 + Math.cos(t) * inner}
            y1={100 + Math.sin(t) * inner}
            x2={90 + Math.cos(t) * 72}
            y2={100 + Math.sin(t) * 72}
            stroke={tick / 20 <= ratio ? color : "var(--ak-border)"}
            strokeWidth={tick % 5 === 0 ? 2.2 : 1.2}
          />
        );
      })}
      <line
        x1="90"
        y1="100"
        x2={nx}
        y2={ny}
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="90" cy="100" r="4" fill={color} />
    </svg>
  );
}

export { GAUGE_CHART_VARIANTS };
export type { GaugeChartVariant };
