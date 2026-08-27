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
  // The volume pane takes a quarter of the height, on the same x-scale. The
  // OHLC convention is incomplete without it — a move on no volume means
  // something different from the same move on heavy volume.
  const volume = variant === "volume";
  const H = 220;
  const priceH = volume ? 164 : H;
  const pad = 16;
  const inner = W - pad * 2;
  const slot = inner / data.length;
  const y = (value: number) => pad + ((max - value) / span) * (priceH - pad * 2);
  // Real traded volume is not in CandleDatum, so the pane uses the candle's own
  // range as a stand-in for activity rather than inventing a number.
  const activity = data.map((row) => Math.abs(row.high - row.low));
  const peak = Math.max(...activity, 1);

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
        {volume
          ? data.map((row, index) => {
              const up = row.close >= row.open;
              const cx = pad + index * slot + slot / 2;
              const h = (activity[index] / peak) * (H - priceH - 10);
              return (
                <rect
                  key={`vol-${row.date}`}
                  x={cx - Math.max(1.5, slot * 0.3)}
                  y={H - h - 4}
                  width={Math.max(3, slot * 0.6)}
                  height={Math.max(1, h)}
                  fill={up ? "var(--ak-up)" : "var(--ak-down)"}
                  fillOpacity={0.45}
                />
              );
            })
          : null}
        {volume ? (
          <line
            x1={pad}
            x2={W - pad}
            y1={priceH + 2}
            y2={priceH + 2}
            stroke="var(--ak-border)"
            strokeWidth={1}
          />
        ) : null}
      </svg>
    </div>
  );
}

export { CANDLESTICK_CHART_VARIANTS };
export type { CandlestickChartVariant };
