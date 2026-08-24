import { formatNumber } from "./chart.js";
export function DitherDots({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6">
      <circle cx="1.4" cy="1.4" r="1" fill={color} />
      <circle cx="4.6" cy="4.6" r="0.85" fill={color} />
    </pattern>
  );
}

export function HatchPattern({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width="7" height="7">
      <path d="M-1 8L8 -1" stroke={color} strokeWidth="1.35" />
    </pattern>
  );
}

export function BarStripePattern({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="8">
      <rect width="2.4" height="8" fill={color} />
    </pattern>
  );
}

export function GlowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.2" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
        result="glow"
      />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

export function RainbowGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="var(--ak-chart-1, var(--chart-1, #2563eb))" />
      <stop offset="35%" stopColor="var(--ak-chart-2, var(--chart-2, #0f9f6e))" />
      <stop offset="70%" stopColor="var(--ak-chart-3, var(--chart-3, #f59e0b))" />
      <stop offset="100%" stopColor="var(--ak-chart-5, var(--chart-5, #ef4444))" />
    </linearGradient>
  );
}

export function FadeGradient({
  id,
  color,
  start = 0.95,
  end = 0.18,
}: {
  id: string;
  color: string;
  start?: number;
  end?: number;
}) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={start} />
      <stop offset="100%" stopColor={color} stopOpacity={end} />
    </linearGradient>
  );
}

export function DuotoneGradient({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stopColor={color} />
      <stop offset="52%" stopColor={color} />
      <stop offset="52%" stopColor={color} stopOpacity="0.36" />
      <stop offset="100%" stopColor={color} stopOpacity="0.36" />
    </linearGradient>
  );
}

export function PingDot({
  cx,
  cy,
  color,
  last,
}: {
  cx?: number;
  cy?: number;
  color: string;
  last?: boolean;
}) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      {last ? (
        <>
          <circle className="ak-ping" cx={cx} cy={cy} r={9} fill={color} />
          <circle className="ak-ping ak-ping-delay" cx={cx} cy={cy} r={9} fill={color} />
        </>
      ) : null}
      <circle cx={cx} cy={cy} r={3} fill={color} stroke="var(--ak-surface)" strokeWidth={1.5} />
    </g>
  );
}

export function ValueDot({
  cx,
  cy,
  value,
  color,
  show,
}: {
  cx?: number;
  cy?: number;
  value?: string | number;
  color: string;
  show?: boolean;
}) {
  if (cx == null || cy == null) return null;
  const label = typeof value === "number" ? formatNumber(value) : String(value ?? "");
  return (
    <g>
      <circle cx={cx} cy={cy} r={2.5} fill={color} />
      {show ? (
        <text x={cx} y={cy - 8} textAnchor="middle" className="ak-value-dot">
          {label}
        </text>
      ) : null}
    </g>
  );
}
