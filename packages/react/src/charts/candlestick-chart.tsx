import { cn } from "../lib/cn.js";
import {
  CANDLESTICK_CHART_VARIANTS,
  type CandleDatum,
  type CandlestickChartVariant,
} from "./variants.js";

/** Real volume when present; candle range only as a 0.5-compatible fallback. */
export function candleActivity(data: CandleDatum[]): number[] {
  return data.map((row) => {
    const range = Math.abs(row.high - row.low);
    const fallback = Number.isFinite(range) ? range : 0;
    // A non-finite volume is malformed rather than meaningfully high/low.
    // Treat it as absent and preserve the price-range compatibility fallback.
    if (row.volume == null || !Number.isFinite(row.volume)) return fallback;
    return Math.max(0, row.volume);
  });
}

function finitePrice(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/**
 * Map prices into the plot without subtracting opposite IEEE-754 extremes.
 *
 * A conventional `(max - value) / (max - min)` overflows when the domain
 * reaches from `-Number.MAX_VALUE` to `Number.MAX_VALUE`. Dividing the whole
 * domain by its largest magnitude first preserves ordinary geometry while
 * keeping every intermediate finite. Malformed non-finite prices collapse to
 * zero, matching the chart's existing finite volume fallback.
 */
function candleYScale(data: CandleDatum[], top: number, bottom: number): (value: number) => number {
  const prices = data.flatMap((row) => [row.open, row.high, row.low, row.close]).map(finitePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min;

  if (span === 0) return () => top;

  if (!Number.isFinite(span)) {
    const magnitude = Math.max(Math.abs(min), Math.abs(max), 1);
    const normalizedMin = min / magnitude;
    const normalizedMax = max / magnitude;
    const normalizedSpan = normalizedMax - normalizedMin;
    return (value) =>
      top + ((normalizedMax - finitePrice(value) / magnitude) / normalizedSpan) * (bottom - top);
  }

  return (value) => top + ((max - finitePrice(value)) / span) * (bottom - top);
}

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
  const y = candleYScale(data, pad, priceH - pad);
  // Prefer real traded volume. The range fallback preserves the 0.5 API for
  // existing consumers whose CandleDatum rows predate the optional field.
  const activity = candleActivity(data);
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
              // Zero volume means no activity. Rendering a minimum-height bar
              // would turn absence into a visible event.
              if (activity[index] <= 0) return null;
              const up = row.close >= row.open;
              const cx = pad + index * slot + slot / 2;
              const h = (activity[index] / peak) * (H - priceH - 10);
              return (
                <rect
                  key={`vol-${row.date}`}
                  x={cx - Math.max(1.5, slot * 0.3)}
                  y={H - h - 4}
                  width={Math.max(3, slot * 0.6)}
                  height={h}
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
