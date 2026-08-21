"use client";

import { MetricCard, type MetricCardProps } from "@analytics-kit/react";

/** KPI card. variant: default | spark | compact | hero */
export function Example(props: MetricCardProps) {
  return <MetricCard metric="visitors" variant="spark" {...props} />;
}
