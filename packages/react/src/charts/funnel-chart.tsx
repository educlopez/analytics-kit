import { useId } from "react";
import { cn } from "../lib/cn.js";
import { FUNNEL_CHART_VARIANTS, type ChartDatum, type FunnelChartVariant } from "./variants.js";

const PALETTE = [
  "var(--ak-chart-1, var(--chart-1))",
  "var(--ak-chart-2, var(--chart-2))",
  "var(--ak-chart-3, var(--chart-3))",
  "var(--ak-chart-4, var(--chart-4))",
  "var(--ak-chart-5, var(--chart-5))",
];

type Stage = { label: string; value: number };

function formatPct(value: number): string {
  return `${Math.round(value)}%`;
}

export function FunnelChart({
  data,
  dataKey = "value",
  labelKey = "label",
  variant = "tape",
  className,
}: {
  data: ChartDatum[];
  dataKey?: string;
  labelKey?: string;
  variant?: FunnelChartVariant;
  className?: string;
}) {
  const stages: Stage[] = data.map((row) => ({
    label: String(row[labelKey] ?? ""),
    value: Number(row[dataKey] ?? 0),
  }));
  const head = stages[0]?.value || 1;

  if (!stages.length) return <p className="ak-muted">No funnel data.</p>;

  if (variant === "vertical") {
    return <VerticalFunnel stages={stages} head={head} className={className} />;
  }

  return <RibbonFunnel stages={stages} head={head} variant={variant} className={className} />;
}

function RibbonFunnel({
  stages,
  head,
  variant,
  className,
}: {
  stages: Stage[];
  head: number;
  variant: "tape" | "steps";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const W = 1000;
  const H = 250;
  const padX = 28;
  const mid = 128;
  const maxHalf = 46;
  const n = stages.length;
  const gap = variant === "steps" ? 12 : 0;
  const inner = W - padX * 2;
  const seg = (inner - gap * Math.max(n - 1, 0)) / n;
  const half = (index: number) => Math.max(12, (stages[index].value / head) * maxHalf);

  return (
    <div className={cn("ak-funnel", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="ak-funnel-svg" role="img">
        <defs>
          <linearGradient id={`${uid}-tape`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--ak-chart-1, var(--chart-1))" />
            <stop offset="40%" stopColor="var(--ak-chart-4, var(--chart-4))" />
            <stop offset="75%" stopColor="var(--ak-chart-3, var(--chart-3))" />
            <stop offset="100%" stopColor="var(--ak-chart-5, var(--chart-5))" />
          </linearGradient>
        </defs>
        {variant === "tape" ? (
          <>
            <path
              d={ribbonPath(stages, padX, seg, mid, maxHalf * 1.55, head)}
              fill={`url(#${uid}-tape)`}
              opacity="0.12"
            />
            <path
              d={ribbonPath(stages, padX, seg, mid, maxHalf * 1.28, head)}
              fill={`url(#${uid}-tape)`}
              opacity="0.2"
            />
            <path
              d={ribbonPath(stages, padX, seg, mid, maxHalf, head)}
              fill={`url(#${uid}-tape)`}
            />
          </>
        ) : (
          stages.map((stage, index) => {
            const x = padX + index * (seg + gap);
            const h = half(index);
            return (
              <rect
                key={stage.label}
                x={x}
                y={mid - h}
                width={seg}
                height={h * 2}
                rx={14}
                fill={PALETTE[index % PALETTE.length]}
              />
            );
          })
        )}
        {stages.map((stage, index) => {
          const x = padX + index * (seg + gap) + seg / 2;
          const share = (stage.value / head) * 100;
          const drop =
            index < n - 1
              ? ((stage.value - stages[index + 1].value) / (stage.value || 1)) * 100
              : null;
          return (
            <g key={stage.label}>
              <text x={x} y={36} textAnchor="middle" className="ak-funnel-label">
                {stage.label}
              </text>
              <text x={x} y={52} textAnchor="middle" className="ak-funnel-count">
                {Math.round(stage.value).toLocaleString()}
              </text>
              <rect
                x={x - 28}
                y={mid - 12}
                width={56}
                height={24}
                rx={12}
                className="ak-funnel-pill"
              />
              <text x={x} y={mid + 5} textAnchor="middle" className="ak-funnel-pill-text">
                {formatPct(share)}
              </text>
              {drop != null ? (
                <text
                  x={x + seg / 2 + gap / 2}
                  y={mid + maxHalf + 28}
                  textAnchor="middle"
                  className="ak-funnel-drop"
                >
                  −{formatPct(Math.max(0, drop))}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ribbonPath(
  stages: Stage[],
  padX: number,
  seg: number,
  mid: number,
  maxHalf: number,
  head: number,
): string {
  const half = (index: number) => Math.max(10, (stages[index].value / head) * maxHalf);
  const n = stages.length;
  const xs = [padX, ...stages.map((_, index) => padX + (index + 1) * seg)];
  const hs = [half(0), ...stages.map((_, index) => half(Math.min(index + 1, n - 1)))];
  const top = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${mid - hs[i]}`).join(" ");
  const bottom = xs
    .slice()
    .reverse()
    .map((x, i) => `L ${x} ${mid + hs[hs.length - 1 - i]}`)
    .join(" ");
  return `${top} ${bottom} Z`;
}

function VerticalFunnel({
  stages,
  head,
  className,
}: {
  stages: Stage[];
  head: number;
  className?: string;
}) {
  return (
    <ol className={cn("ak-funnel-vertical", className)}>
      {stages.map((stage, index) => {
        const share = (stage.value / head) * 100;
        const drop =
          index < stages.length - 1
            ? ((stage.value - stages[index + 1].value) / (stage.value || 1)) * 100
            : null;
        return (
          <li key={stage.label}>
            <div className="ak-funnel-vertical-meta">
              <span>{stage.label}</span>
              <strong>{Math.round(stage.value).toLocaleString()}</strong>
            </div>
            <div className="ak-funnel-vertical-track">
              <div
                className="ak-funnel-vertical-fill"
                style={{
                  width: `${Math.max(8, share)}%`,
                  background: PALETTE[index % PALETTE.length],
                }}
              />
            </div>
            <div className="ak-funnel-vertical-meta">
              <em>{formatPct(share)}</em>
              {drop != null ? (
                <span className="ak-funnel-drop">−{formatPct(Math.max(0, drop))}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { FUNNEL_CHART_VARIANTS };
export type { FunnelChartVariant };
