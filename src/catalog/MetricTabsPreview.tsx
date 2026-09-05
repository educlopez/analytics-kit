"use client";

import { useState } from "react";
import { LineChart, MetricTabs, type MetricTabsVariant } from "@wingtics/react";
import { formatMetric } from "@wingtics/core";

/**
 * The strip is only half the pattern — the point is that the chart underneath
 * follows the selection. A preview showing the cards alone would demonstrate
 * four metric cards, which the catalog already has.
 */
const METRICS = [
  { id: "visitors", label: "Visitors" },
  { id: "pageviews", label: "Page views" },
  { id: "visits", label: "Visits" },
  { id: "events", label: "Events" },
] as const;

/** Last seven points against the seven before them — a real comparison over real rows. */
function trailingDelta(values: number[]): { text: string; positive: boolean } | null {
  if (values.length < 14) return null;
  const recent = values.slice(-7).reduce((sum, value) => sum + value, 0);
  const prior = values.slice(-14, -7).reduce((sum, value) => sum + value, 0);
  if (prior === 0) return null;
  const change = ((recent - prior) / prior) * 100;
  return {
    text: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
    positive: change >= 0,
  };
}

export function MetricTabsPreview({
  rows,
  variant,
}: {
  rows: Record<string, string | number>[];
  variant?: MetricTabsVariant;
}) {
  const [active, setActive] = useState<string>("visitors");

  const metrics = METRICS.map((metric) => {
    const values = rows.map((row) => Number(row[metric.id] ?? 0));
    const total = values.reduce((sum, value) => sum + value, 0);
    return {
      id: metric.id,
      label: metric.label,
      value: formatMetric(metric.id, total),
      delta: trailingDelta(values),
      spark: values,
      hint: "vs. prior 7 days",
    };
  });

  const series = rows.map((row) => ({
    date: String(row.date ?? ""),
    value: Number(row[active] ?? 0),
  }));

  return (
    <div className="grid gap-4">
      <MetricTabs metrics={metrics} activeId={active} onChange={setActive} variant={variant} />
      <LineChart data={series} variant="monotone" emphasizeLast />
    </div>
  );
}
