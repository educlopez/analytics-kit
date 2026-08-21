"use client";

import { MetricCard, type MetricCardProps } from "@analytics-kit/react";

/**
 * KPI card with spark area and previous-period delta.
 * Pattern shared with Tremor Metric and shadcn chart cards.
 */
export function Example(props: MetricCardProps) {
  return <MetricCard metric="visitors" {...props} />;
}
