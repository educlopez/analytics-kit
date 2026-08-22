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

function PreviewInner({
  slug,
  variant,
  preview,
}: {
  slug: string;
  variant: string;
  preview?: boolean;
}) {
  const seriesQuery = useQuery({ metrics: ["visitors"], granularity: "day" });
  const browsers = useQuery({
    metrics: ["visitors"],
    dimensions: ["browser"],
    limit: 6,
  });
  const series = (seriesQuery.data?.series ?? []).map((point) => ({
    date: point.date,
    value: point.values.visitors ?? 0,
  }));
  const breakdown = (browsers.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    value: row.values.visitors ?? 0,
  }));
  const rows = browsers.data?.breakdown ?? [];

  if (slug === "area-chart") {
    return (
      <AreaChart
        data={series}
        variant={variant as AreaChartVariant}
        className={variant === "spark" ? "h-[88px]" : undefined}
      />
    );
  }
  if (slug === "line-chart") {
    return <LineChart data={series} variant={variant as LineChartVariant} />;
  }
  if (slug === "bar-chart") {
    return <BarChart data={breakdown} variant={variant as BarChartVariant} />;
  }
  if (slug === "pie-chart") {
    return <PieChart data={breakdown} variant={variant as PieChartVariant} />;
  }
  if (slug === "metric-card") {
    return <MetricCard metric="visitors" variant={variant as MetricCardVariant} />;
  }
  if (slug === "ranked-list") {
    return <RankedList rows={rows} metric="visitors" variant={variant as BarListVariant} />;
  }
  if (slug === "dashboard") {
    return (
      <Dashboard
        widgets={preview ? defaultDashboard : catalogDashboard}
        showRange={!preview}
        columns={4}
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
}: {
  slug: string;
  variant: string;
  theme: AnalyticsTheme;
  preview?: boolean;
}) {
  const connector = useMemo(
    () => createMockConnector({ profile: "full", siteName: "Catalog", seed: 11 }),
    [],
  );

  return (
    <AnalyticsProvider connector={connector} theme={theme} range="30d">
      <PreviewInner slug={slug} variant={variant} preview={preview} />
    </AnalyticsProvider>
  );
}
