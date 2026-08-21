"use client";

import { BreakdownWidget } from "@analytics-kit/react";

/** Horizontal bar list (Tremor BarList). */
export function Example() {
  return <BreakdownWidget dimension="path" metric="pageviews" title="Top pages" />;
}
