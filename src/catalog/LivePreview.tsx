"use client";

import { useCallback, useMemo } from "react";
import { createMockConnector, mockQuery } from "@analytics-kit/connector-mock";
import type { AnalyticsQuery } from "@analytics-kit/core";
import {
  AnalyticsProvider,
  AreaChart,
  BarChart,
  CandlestickChart,
  ChoroplethChart,
  ComposedChart,
  Dashboard,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  LiveLineChart,
  MetricCard,
  PieChart,
  ProfitLossChart,
  RadarChart,
  RankedList,
  RingChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  catalogDashboard,
  defaultDashboard,
  useQuery,
  type AnalyticsTheme,
  type AreaChartVariant,
  type BarChartVariant,
  type BarListVariant,
  type CandlestickChartVariant,
  type ChoroplethChartVariant,
  type ComposedChartVariant,
  type FunnelChartVariant,
  type GaugeChartVariant,
  type HeatmapChartVariant,
  type LineChartVariant,
  type LiveLineChartVariant,
  type MetricCardVariant,
  type PieChartVariant,
  type ProfitLossChartVariant,
  type RadarChartVariant,
  type RingChartVariant,
  type SankeyChartVariant,
  type ScatterChartVariant,
  type SunburstChartVariant,
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
  // The multi-series bar variants need more than one metric per label.
  const browsersDual = useQuery({
    metrics: ["visitors", "pageviews"],
    dimensions: ["browser"],
    limit: 6,
  });
  const countries = useQuery({
    metrics: [knobs.metric],
    dimensions: ["country"],
    limit: 12,
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
  const scatter = composed.map((row) => ({
    x: row.visitors,
    y: row.pageviews,
    z: Math.abs(row.pageviews - row.visitors),
  }));
  const totals = totalsQuery.data?.totals ?? {};
  const funnel = [
    { label: "Visitors", value: totals.visitors ?? 0 },
    { label: "Views", value: totals.pageviews ?? 0 },
    { label: "Visits", value: totals.visits ?? 0 },
    { label: "Events", value: totals.events ?? 0 },
  ];
  const sankeyNodes = funnel.map((row) => ({ name: row.label }));
  const sankeyLinks = funnel.slice(1).map((row, index) => ({
    source: index,
    target: index + 1,
    value: Math.max(1, Math.min(funnel[index].value, row.value)),
  }));
  const candles = series.map((row, index) => {
    const open = index > 0 ? series[index - 1].value : row.value;
    const close = row.value;
    return {
      date: row.date,
      open,
      high: Math.max(open, close) * 1.04,
      low: Math.min(open, close) * 0.96,
      close,
    };
  });
  const regions = (countries.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    value: row.values[knobs.metric] ?? 0,
    code: row.key,
  }));
  const deltas = series.map((row, index) => ({
    date: row.date,
    value: index === 0 ? 0 : row.value - series[index - 1].value,
  }));
  const tree = funnel.slice(0, 1).map((row) => ({
    label: row.label,
    value: row.value,
    children: funnel.slice(1),
  }));
  const breakdown = (browsers.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    value: row.values[knobs.metric] ?? 0,
  }));
  const breakdownDual = (browsersDual.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    visitors: row.values.visitors ?? 0,
    pageviews: row.values.pageviews ?? 0,
  }));
  // The treatments need data the plain sample series doesn't carry: a previous
  // period to compare against, and an actual hole to draw a gap across.
  const previousSeries = composed.map((point) => ({
    date: point.date,
    value: Math.round(point.visitors * 0.78),
  }));
  const holed =
    knobs.gaps === "off"
      ? series
      : series.map((point, index) =>
          index > 11 && index < 15 ? { ...point, value: null as unknown as number } : point,
        );
  const rows = browsers.data?.breakdown ?? [];
  const gaugeValue = totals[knobs.metric] ?? 0;
  const gaugeMax = knobs.metric === "bounceRate" ? 100 : Math.max(gaugeValue * 1.2, 1);
  // Knobs carry "" for "no variant chosen". Passing that through would beat each
  // chart's own default parameter and leave the preview blank.
  const activeVariant = knobs.variant || undefined;

  if (slug === "area-chart") {
    // The composition variants need a second series to compose.
    if (activeVariant === "stacked") {
      return (
        <AreaChart
          data={composed}
          dataKeys={["visitors", "pageviews"]}
          variant={activeVariant as AreaChartVariant}
        />
      );
    }
    return (
      <AreaChart
        data={holed}
        variant={activeVariant as AreaChartVariant}
        emphasizeLast={knobs.emphasizeLast}
        previous={knobs.compare ? previousSeries : undefined}
        gaps={knobs.gaps === "off" ? undefined : knobs.gaps}
      />
    );
  }
  if (slug === "line-chart") {
    return (
      <LineChart
        data={holed}
        variant={activeVariant as LineChartVariant}
        emphasizeLast={knobs.emphasizeLast}
        previous={knobs.compare ? previousSeries : undefined}
        gaps={knobs.gaps === "off" ? undefined : knobs.gaps}
      />
    );
  }
  if (slug === "bar-chart") {
    if (
      activeVariant === "grouped" ||
      activeVariant === "stacked" ||
      activeVariant === "stacked-100"
    ) {
      return (
        <BarChart
          data={breakdownDual}
          dataKeys={["visitors", "pageviews"]}
          variant={activeVariant as BarChartVariant}
        />
      );
    }
    return <BarChart data={breakdown} variant={activeVariant as BarChartVariant} />;
  }
  if (slug === "pie-chart") {
    return <PieChart data={breakdown} variant={activeVariant as PieChartVariant} />;
  }
  if (slug === "funnel-chart") {
    return <FunnelChart data={funnel} variant={activeVariant as FunnelChartVariant} />;
  }
  if (slug === "radar-chart") {
    return <RadarChart data={breakdown} variant={activeVariant as RadarChartVariant} />;
  }
  if (slug === "composed-chart") {
    return (
      <ComposedChart
        data={composed}
        barKey="visitors"
        lineKey="pageviews"
        variant={activeVariant as ComposedChartVariant}
      />
    );
  }
  if (slug === "scatter-chart") {
    return <ScatterChart data={scatter} variant={activeVariant as ScatterChartVariant} />;
  }
  if (slug === "sankey-chart") {
    return (
      <SankeyChart
        nodes={sankeyNodes}
        links={sankeyLinks}
        variant={activeVariant as SankeyChartVariant}
      />
    );
  }
  if (slug === "candlestick-chart") {
    return <CandlestickChart data={candles} variant={activeVariant as CandlestickChartVariant} />;
  }
  if (slug === "choropleth-chart") {
    return <ChoroplethChart data={regions} variant={activeVariant as ChoroplethChartVariant} />;
  }
  if (slug === "live-line-chart") {
    return <LiveLineChart data={series} variant={activeVariant as LiveLineChartVariant} />;
  }
  if (slug === "ring-chart") {
    return <RingChart data={breakdown} variant={activeVariant as RingChartVariant} />;
  }
  if (slug === "heatmap-chart") {
    return <HeatmapChart data={series} variant={activeVariant as HeatmapChartVariant} />;
  }
  if (slug === "sunburst-chart") {
    return <SunburstChart data={tree} variant={activeVariant as SunburstChartVariant} />;
  }
  if (slug === "profit-loss-chart") {
    return <ProfitLossChart data={deltas} variant={activeVariant as ProfitLossChartVariant} />;
  }
  if (slug === "gauge-chart") {
    return (
      <GaugeChart
        value={gaugeValue}
        max={gaugeMax}
        label={knobs.metric}
        variant={activeVariant as GaugeChartVariant}
      />
    );
  }
  if (slug === "metric-card") {
    return <MetricCard metric={knobs.metric} variant={activeVariant as MetricCardVariant} />;
  }
  if (slug === "ranked-list") {
    return (
      <RankedList rows={rows} metric={knobs.metric} variant={activeVariant as BarListVariant} />
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
  const previewQuery = useCallback(
    (query: AnalyticsQuery) =>
      mockQuery({ ...query, range: query.range ?? "30d" }, { profile: "full", seed: 11 }),
    [],
  );
  const resolved: PreviewKnobs = {
    variant: knobs?.variant ?? variant ?? "",
    metric: knobs?.metric ?? (slug === "gauge-chart" ? "bounceRate" : "visitors"),
    height: knobs?.height ?? 220,
    columns: knobs?.columns ?? 4,
    showRange: knobs?.showRange ?? true,
    emphasizeLast: knobs?.emphasizeLast ?? false,
    compare: knobs?.compare ?? false,
    gaps: knobs?.gaps ?? "off",
  };

  return (
    <AnalyticsProvider connector={connector} theme={theme} range="30d" previewQuery={previewQuery}>
      <PreviewInner slug={slug} knobs={resolved} preview={preview} />
    </AnalyticsProvider>
  );
}
