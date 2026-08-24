import { formatNumber, PALETTE } from "./chart.js";
import { TREEMAP_CHART_VARIANTS, type ChartDatum, type TreemapChartVariant } from "./variants.js";

interface Tile {
  label: string;
  value: number;
  delta: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Squarified treemap layout.
 *
 * Slice-and-dice is a few lines shorter but produces slivers you cannot read a
 * label in, which defeats the point of the chart.
 */
function squarify(
  rows: { label: string; value: number; delta: number }[],
  x: number,
  y: number,
  width: number,
  height: number,
): Tile[] {
  const total = rows.reduce((acc, row) => acc + row.value, 0);
  if (total <= 0 || !rows.length) return [];

  const tiles: Tile[] = [];
  let remaining = rows.slice();
  let left = x;
  let top = y;
  let free = width;
  let tall = height;
  let pool = total;

  while (remaining.length) {
    const horizontal = free >= tall;
    const side = horizontal ? tall : free;
    const row: typeof remaining = [];
    let rowSum = 0;
    let best = Infinity;

    // Grow the row while the worst aspect ratio in it keeps improving.
    while (remaining.length) {
      const next = remaining[0];
      const trySum = rowSum + next.value;
      const area = (trySum / pool) * free * tall;
      const thickness = area / side;
      const worst = Math.max(
        ...[...row, next].map((item) => {
          const length = ((item.value / trySum) * area) / thickness;
          return Math.max(thickness / length, length / thickness);
        }),
      );
      if (row.length && worst > best) break;
      best = worst;
      rowSum = trySum;
      row.push(next);
      remaining = remaining.slice(1);
    }

    const area = (rowSum / pool) * free * tall;
    const thickness = area / side;
    let offset = 0;
    for (const item of row) {
      const length = ((item.value / rowSum) * area) / thickness;
      tiles.push({
        ...item,
        x: horizontal ? left : left + offset,
        y: horizontal ? top + offset : top,
        width: horizontal ? thickness : length,
        height: horizontal ? length : thickness,
      });
      offset += length;
    }

    if (horizontal) {
      left += thickness;
      free -= thickness;
    } else {
      top += thickness;
      tall -= thickness;
    }
    pool -= rowSum;
  }

  return tiles;
}

export function TreemapChart({
  data,
  dataKey = "value",
  labelKey = "label",
  deltaKey = "delta",
  variant = "heat",
  height = 260,
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  /** Signed change per row. Only read by the diverging variant. */
  deltaKey?: string;
  variant?: TreemapChartVariant;
  height?: number;
  className?: string;
}) {
  const rows = data
    .map((row) => ({
      label: String(row[labelKey] ?? ""),
      value: Number(row[dataKey] ?? 0),
      delta: Number(row[deltaKey] ?? 0),
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);

  if (!rows.length) return <p className="ak-muted">No breakdown data.</p>;

  const width = 100;
  const tiles = squarify(rows, 0, 0, width, height);
  const total = rows.reduce((acc, row) => acc + row.value, 0);
  const peak = Math.max(...rows.map((row) => Math.abs(row.delta)), 1);

  return (
    <div className={`ak-treemap-wrap ${className ?? ""}`.trim()}>
      <svg
        className="ak-treemap"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ height }}
        role="img"
        aria-label={`Treemap of ${rows.length} categories totalling ${formatNumber(total)}`}
      >
        {tiles.map((tile, index) => {
          const diverging = variant === "diverging";
          const color = diverging
            ? tile.delta >= 0
              ? "var(--ak-chart-2, var(--chart-2))"
              : "var(--ak-chart-3, var(--chart-3))"
            : PALETTE[index % PALETTE.length];
          const opacity = diverging
            ? 0.2 + (Math.abs(tile.delta) / peak) * 0.7
            : 0.28 + (tile.value / rows[0].value) * 0.62;
          return (
            <g key={tile.label}>
              <rect
                x={tile.x}
                y={tile.y}
                width={Math.max(0, tile.width - 0.5)}
                height={Math.max(0, tile.height - 0.5)}
                fill={color}
                fillOpacity={opacity}
              />
              {/* One interpolated string, not several children: React splits
                  sibling expressions into separate text nodes, which a <title>
                  cannot round-trip through SSR without a hydration mismatch. */}
              <title>{`${tile.label}: ${formatNumber(tile.value)} (${Math.round((tile.value / total) * 100)}%)`}</title>
            </g>
          );
        })}
      </svg>
      {/* Labels live in HTML, not SVG text: the viewBox is stretched by
          preserveAspectRatio="none", which would distort any glyph inside it. */}
      <div className="ak-treemap-labels" aria-hidden="true">
        {tiles.map((tile) => {
          // Below this the label is unreadable and only adds noise.
          if (tile.width < 14 || tile.height < 26) return null;
          return (
            <span
              key={tile.label}
              className="ak-treemap-label"
              style={{
                left: `${tile.x}%`,
                top: `${(tile.y / height) * 100}%`,
                width: `${tile.width}%`,
                height: `${(tile.height / height) * 100}%`,
              }}
            >
              <b>{tile.label}</b>
              <em>
                {variant === "diverging" && tile.delta !== 0
                  ? `${tile.delta > 0 ? "+" : ""}${formatNumber(tile.delta)}`
                  : formatNumber(tile.value)}
              </em>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export { TREEMAP_CHART_VARIANTS };
export type { TreemapChartVariant };
