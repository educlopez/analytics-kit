"use client";

import { useMemo } from "react";
import { createMockConnector } from "@analytics-kit/connector-mock";
import {
  AnalyticsProvider,
  AreaChart,
  BarChart,
  ComposedChart,
  Dashboard,
  FunnelChart,
  GaugeChart,
  LineChart,
  MetricCard,
  PieChart,
  RadarChart,
  RankedList,
  catalogDashboard,
  defaultDashboard,
  useQuery,
  type AnalyticsTheme,
  type AreaChartVariant,
  type BarChartVariant,
  type BarListVariant,
  type ComposedChartVariant,
  type FunnelChartVariant,
  type GaugeChartVariant,
  type LineChartVariant,
  type MetricCardVariant,
  type PieChartVariant,
  type RadarChartVariant,
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
  const dualQuery = useQuery({ metrics: ["visitors", "pageviews"], granularity: "day" });
  const totalsQuery = useQuery({
    metrics: ["visitors", "pageviews", "visits", "events", "bounceRate"],
  });
  const browsers = useQuery({
    metrics: [knobs.metric],
    dimensions: ["browser"],
    limit: 6,
  });
  const series = (seriesQuery.data?.series ?? []).map((point) => ({
    date: point.date,
    value: point.values[knobs.metric] ?? 0,
  }));
  const composed = (dualQuery.data?.series ?? []).map((point) => ({
    date: point.date,
    visitors: point.values.visitors ?? 0,
    pageviews: point.values.pageviews ?? 0,
  }));
  const totals = totalsQuery.data?.totals ?? {};
  const funnel = [
    { label: "Visitors", value: totals.visitors ?? 0 },
    { label: "Views", value: totals.pageviews ?? 0 },
    { label: "Visits", value: totals.visits ?? 0 },
    { label: "Events", value: totals.events ?? 0 },
  ];
  const breakdown = (browsers.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    value: row.values[knobs.metric] ?? 0,
  }));
  const rows = browsers.data?.breakdown ?? [];
  const gaugeValue = totals[knobs.metric] ?? 0;
  const gaugeMax = knobs.metric === "bounceRate" ? 100 : Math.max(gaugeValue * 1.2, 1);

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
  if (slug === "funnel-chart") {
    return <FunnelChart data={funnel} variant={knobs.variant as FunnelChartVariant} />;
  }
  if (slug === "radar-chart") {
    return <RadarChart data={breakdown} variant={knobs.variant as RadarChartVariant} />;
  }
  if (slug === "composed-chart") {
    return (
      <ComposedChart
        data={composed}
        barKey="visitors"
        lineKey="pageviews"
        variant={knobs.variant as ComposedChartVariant}
      />
    );
  }
  if (slug === "gauge-chart") {
    return (
      <GaugeChart
        value={gaugeValue}
        max={gaugeMax}
        label={knobs.metric}
        variant={knobs.variant as GaugeChartVariant}
      />
    );
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
    metric: knobs?.metric ?? (slug === "gauge-chart" ? "bounceRate" : "visitors"),
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
