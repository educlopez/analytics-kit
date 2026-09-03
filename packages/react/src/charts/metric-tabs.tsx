"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "../lib/cn.js";
import { METRIC_TABS_VARIANTS, type MetricTabsVariant } from "./variants.js";

export interface MetricTabItem {
  id: string;
  label: string;
  /** Preformatted, so the host keeps control of units and locale. */
  value: string;
  delta?: { text: string; positive: boolean } | null;
  /** Raw series for the inline spark. Values only — the shape is all it draws. */
  spark?: number[];
  /** Secondary line under the value, e.g. "vs. previous 30 days". */
  hint?: string;
  trailing?: ReactNode;
}

/** Polyline points for a spark, normalised into a 100×28 box. */
function sparkPoints(values: number[]): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      // 2px of padding top and bottom, so a peak is not clipped by the stroke.
      const y = 26 - ((value - min) / span) * 24;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function Spark({ values, active }: { values: number[]; active: boolean }) {
  const points = sparkPoints(values);
  if (!points) return null;
  return (
    <svg
      className="ak-mtab-spark"
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={active ? "var(--ak-chart-1, var(--chart-1))" : "currentColor"}
        strokeOpacity={active ? 1 : 0.35}
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Metric cards that are also the chart's tabs.
 *
 * The pattern a real analytics header uses: the same cards that report
 * visitors, views and bounce rate are what you click to change what the chart
 * below plots. Splitting those into a card row plus a separate tab strip
 * duplicates the labels and leaves two things to keep in sync.
 *
 * The host owns the selection, so the strip composes with any chart.
 */
export function MetricTabs({
  metrics,
  activeId,
  onChange,
  variant = "cards",
  showSpark = true,
  ariaLabel = "Metric",
  className,
}: {
  metrics: MetricTabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  /**
   * `cards` is the bordered row. `strip` drops the boxes for a rule under the
   * active metric. `segmented` compacts it into a pill group for a toolbar.
   * `stacked` runs vertically, for a sidebar next to a tall chart.
   */
  variant?: MetricTabsVariant;
  showSpark?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const current = activeId ?? metrics[0]?.id;
  const vertical = variant === "stacked";

  if (!metrics.length) return <p className="ak-muted">No metrics.</p>;

  // A tablist is expected to move with the arrow keys, and a roving tabindex is
  // what keeps Tab from walking through every metric to leave the strip.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const back = vertical ? "ArrowUp" : "ArrowLeft";
    const forward = vertical ? "ArrowDown" : "ArrowRight";
    const index = metrics.findIndex((metric) => metric.id === current);
    let next = index;
    if (event.key === back) next = (index - 1 + metrics.length) % metrics.length;
    else if (event.key === forward) next = (index + 1) % metrics.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = metrics.length - 1;
    else return;
    event.preventDefault();
    onChange?.(metrics[next].id);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[next]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={vertical ? "vertical" : "horizontal"}
      className={cn("ak-mtabs", `ak-mtabs-${variant}`, className)}
      onKeyDown={onKeyDown}
    >
      {metrics.map((metric) => {
        const active = metric.id === current;
        return (
          <button
            key={metric.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={cn("ak-mtab", active ? "is-active" : undefined)}
            onClick={() => onChange?.(metric.id)}
          >
            <span className="ak-mtab-head">
              <span className="ak-mtab-label">{metric.label}</span>
              {metric.trailing}
            </span>
            <span className="ak-mtab-value">{metric.value}</span>
            <span className="ak-mtab-foot">
              {metric.delta ? (
                <span className={metric.delta.positive ? "ak-delta-up" : "ak-delta-down"}>
                  {metric.delta.text}
                </span>
              ) : null}
              {metric.hint ? <span className="ak-muted">{metric.hint}</span> : null}
            </span>
            {showSpark && variant !== "segmented" && metric.spark?.length ? (
              <Spark values={metric.spark} active={active} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export { METRIC_TABS_VARIANTS };
export type { MetricTabsVariant };
