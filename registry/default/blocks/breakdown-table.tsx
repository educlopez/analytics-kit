"use client";

import { BreakdownWidget } from "@analytics-kit/react";

/** Ranked table with share % (Tremor Table + BarList). */
export function Example() {
  return (
    <BreakdownWidget dimension="path" metric="pageviews" title="Pages" variant="table" span={2} />
  );
}
