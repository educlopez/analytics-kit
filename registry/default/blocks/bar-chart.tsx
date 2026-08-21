"use client";

import { BreakdownWidget } from "@analytics-kit/react";

/** Vertical category bars (shadcn BarChart). */
export function Example() {
  return <BreakdownWidget dimension="browser" metric="visitors" title="Browsers" variant="bars" />;
}
