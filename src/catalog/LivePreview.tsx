"use client";

import { useMemo } from "react";
import { createMockConnector } from "@analytics-kit/connector-mock";
import {
  AnalyticsProvider,
  AreaChart,
  BarChart,
  Dashboard,
  LineChart,
  MetricCard,
  PieChart,
  RankedList,
  catalogDashboard,
  defaultDashboard,
  useQuery,
  type AnalyticsTheme,
  type AreaChartVariant,
  type BarChartVariant,
  type BarListVariant,
  type LineChartVariant,
  type MetricCardVariant,
  type PieChartVariant,
} from "@analytics-kit/react";
import type { PreviewKnobs } from "./knobs";

function PreviewInner({
  slug,
  knobs,
  preview,
}: {
  slug: string;
  knobs: PreviewKnobs;
  preview?: boolean;
}) {
  const seriesQuery = useQuery({ metrics: [knobs.metric], granularity: "day" });
  const browsers = useQuery({
    metrics: [knobs.metric],
    dimensions: ["browser"],
    limit: 6,
  });
  const series = (seriesQuery.data?.series ?? []).map((point) => ({
    date: point.date,
    value: point.values[knobs.metric] ?? 0,
  }));
  const breakdown = (browsers.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    value: row.values[knobs.metric] ?? 0,
  }));
  const rows = browsers.data?.breakdown ?? [];

  if (slug === "area-chart") {
    return <AreaChart data={series} variant={knobs.variant as AreaChartVariant} />;
  }
  if (slug === "line-chart") {
    return <LineChart data={series} variant={knobs.variant as LineChartVariant} />;
  }
  if (slug === "bar-chart") {
    return <BarChart data={breakdown} variant={knobs.variant as BarChartVariant} />;
  }
  if (slug === "pie-chart") {
    return <PieChart data={breakdown} variant={knobs.variant as PieChartVariant} />;
  }
  if (slug === "metric-card") {
    return <MetricCard metric={knobs.metric} variant={knobs.variant as MetricCardVariant} />;
  }
  if (slug === "ranked-list") {
    return (
      <RankedList rows={rows} metric={knobs.metric} variant={knobs.variant as BarListVariant} />
    );
  }
  if (slug === "dashboard") {
    return (
      <Dashboard
        widgets={preview ? defaultDashboard : catalogDashboard}
        showRange={preview ? false : knobs.showRange}
        columns={preview ? 4 : knobs.columns}
      />
    );
  }
  return null;
}

export function LivePreview({
  slug,
  variant,
  theme,
  preview,
  knobs,
}: {
  slug: string;
  variant?: string;
  theme: AnalyticsTheme;
  preview?: boolean;
  knobs?: Partial<PreviewKnobs>;
}) {
  const connector = useMemo(
    () => createMockConnector({ profile: "full", siteName: "Catalog", seed: 11 }),
    [],
  );
  const resolved: PreviewKnobs = {
    variant: knobs?.variant ?? variant ?? "",
    metric: knobs?.metric ?? "visitors",
    height: knobs?.height ?? 220,
    columns: knobs?.columns ?? 4,
    showRange: knobs?.showRange ?? true,
  };

  return (
    <AnalyticsProvider connector={connector} theme={theme} range="30d">
      <PreviewInner slug={slug} knobs={resolved} preview={preview} />
    </AnalyticsProvider>
  );
}
