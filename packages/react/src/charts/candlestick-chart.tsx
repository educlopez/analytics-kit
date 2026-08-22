import { cn } from "../lib/cn.js";
import {
  CANDLESTICK_CHART_VARIANTS,
  type CandleDatum,
  type CandlestickChartVariant,
} from "./variants.js";

export function CandlestickChart({
  data,
  variant = "ohlc",
  className,
}: {
  data: CandleDatum[];
  variant?: CandlestickChartVariant;
  className?: string;
}) {
  if (!data.length) return <p className="ak-muted">No candle data.</p>;
  const lows = data.map((row) => row.low);
  const highs = data.map((row) => row.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = max - min || 1;
  const W = 1000;
  const H = 220;
  const pad = 16;
  const inner = W - pad * 2;
  const slot = inner / data.length;
  const y = (value: number) => pad + ((max - value) / span) * (H - pad * 2);

  return (
    <div className={cn("ak-candles", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="ak-funnel-svg" role="img">
        {data.map((row, index) => {
          const up = row.close >= row.open;
          const color = up ? "var(--ak-up)" : "var(--ak-down)";
          const cx = pad + index * slot + slot / 2;
          const bodyTop = y(Math.max(row.open, row.close));
          const bodyBot = y(Math.min(row.open, row.close));
          const bodyH = Math.max(2, bodyBot - bodyTop);
          const hollow = variant === "hollow" && up;
          return (
            <g key={row.date}>
              <line
                x1={cx}
                x2={cx}
                y1={y(row.high)}
                y2={y(row.low)}
                stroke={color}
                strokeWidth={variant === "wick" ? 1.6 : 1.2}
              />
              <rect
                x={cx - (variant === "wick" ? 2 : 6)}
                y={bodyTop}
                width={variant === "wick" ? 4 : 12}
                height={bodyH}
                fill={hollow ? "var(--ak-surface)" : color}
                stroke={color}
                strokeWidth={1.2}
                rx={1}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export { CANDLESTICK_CHART_VARIANTS };
export type { CandlestickChartVariant };
