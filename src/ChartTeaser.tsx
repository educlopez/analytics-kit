"use client";

import { useCallback, useMemo } from "react";
import { createMockConnector, mockQuery } from "@wingtics/connector-mock";
import type { AnalyticsQuery } from "@wingtics/core";
import {
  AnalyticsProvider,
  AreaChart,
  PieChart,
  useQuery,
  type AnalyticsTheme,
} from "@wingtics/react";
import Link from "next/link";
import * as Button from "@/components/ui/button";

function TeaserCharts() {
  const series = useQuery({ metrics: ["visitors"], granularity: "day" });
  const browsers = useQuery({
    metrics: ["visitors"],
    dimensions: ["browser"],
    limit: 5,
  });
  const areaData = (series.data?.series ?? []).map((point) => ({
    date: point.date,
    value: point.values.visitors ?? 0,
  }));
  const pieData = (browsers.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    value: row.values.visitors ?? 0,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-20 bg-bg-weak-25 min-w-0 p-6 lg:rounded-3xl lg:p-8">
        <header className="mb-5">
          <h3 className="text-label-md lg:text-label-lg text-text-strong-950">Area · gradient</h3>
          <p className="text-label-sm text-text-soft-400 mt-1">
            The default trend. Color comes from <code className="font-mono">--chart-1</code> on this
            page.
          </p>
        </header>
        <AreaChart data={areaData} variant="gradient" />
        <code className="border-stroke-soft-200 text-text-soft-400 mt-5 block border-t pt-4 font-mono text-xs">
          {`<AreaChart variant="gradient" />`}
        </code>
      </article>
      <article className="rounded-20 bg-bg-weak-25 min-w-0 p-6 lg:rounded-3xl lg:p-8">
        <header className="mb-5">
          <h3 className="text-label-md lg:text-label-lg text-text-strong-950">Pie · donut</h3>
          <p className="text-label-sm text-text-soft-400 mt-1">
            Share of a dimension. Same query, a different drawing.
          </p>
        </header>
        <PieChart data={pieData} variant="donut" />
        <code className="border-stroke-soft-200 text-text-soft-400 mt-5 block border-t pt-4 font-mono text-xs">
          {`<PieChart variant="donut" />`}
        </code>
      </article>
    </div>
  );
}

export function ChartTeaser({ theme }: { theme: AnalyticsTheme }) {
  const connector = useMemo(
    () => createMockConnector({ profile: "full", siteName: "Chart teaser", seed: 11 }),
    [],
  );
  const previewQuery = useCallback(
    (query: AnalyticsQuery) =>
      mockQuery({ ...query, range: query.range ?? "30d" }, { profile: "full", seed: 11 }),
    [],
  );

  return (
    <div>
      <AnalyticsProvider
        connector={connector}
        theme={theme}
        range="30d"
        previewQuery={previewQuery}
      >
        <TeaserCharts />
      </AnalyticsProvider>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button.Root asChild className="rounded-10 cursor-pointer">
          <Link href="/components">All components &amp; config</Link>
        </Button.Root>
        <Button.Root variant="neutral" mode="stroke" asChild className="rounded-10 cursor-pointer">
          <Link href="/docs">Read the docs</Link>
        </Button.Root>
      </div>
    </div>
  );
}
