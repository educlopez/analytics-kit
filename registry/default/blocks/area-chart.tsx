"use client";

import { TimeseriesChart } from "@analytics-kit/react";

/** Area timeseries (shadcn chart / Tremor AreaChart). */
export function Example() {
  return <TimeseriesChart metric="visitors" span={4} />;
}
