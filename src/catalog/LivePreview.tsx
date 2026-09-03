"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createMockConnector, mockQuery } from "@analytics-kit/connector-mock";
import { createHttpConnector, type AnalyticsQuery, type SeriesPoint } from "@analytics-kit/core";
import {
  AnalyticsProvider,
  AreaChart,
  HorizonChart,
  WaterfallChart,
  ShareBand,
  SlopeChart,
  QuotaBar,
  BumpChart,
  MarimekkoChart,
  SparkTable,
  TimelineChart,
  StripChart,
  RadialTimeChart,
  CohortGrid,
  TreemapChart,
  BarChart,
  CandlestickChart,
  ChoroplethChart,
  ComposedChart,
  Dashboard,
  EmptyState,
  GlobeChart,
  FunnelChart,
  findAnomalyIndexes,
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
  type HorizonChartVariant,
  type WaterfallChartVariant,
  type ShareBandVariant,
  type SlopeChartVariant,
  type BreakdownCardVariant,
  type BumpChartVariant,
  type MarimekkoVariant,
  type QuotaBarVariant,
  type RadialTimeVariant,
  type SparkTableVariant,
  type StripChartVariant,
  type TimelineVariant,
  type CohortGridVariant,
  type TreemapChartVariant,
  type BarChartVariant,
  type BarListVariant,
  type CandlestickChartVariant,
  type ChoroplethChartVariant,
  type ComposedChartVariant,
  type EmptyStateVariant,
  type GlobeChartVariant,
  type MetricTabsVariant,
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
import { BreakdownCardPreview } from "./BreakdownCardPreview";
import { MetricTabsPreview } from "./MetricTabsPreview";
import type { PreviewKnobs } from "./knobs";
import { buildRadialTimePreviewQuery } from "./previewQueries";

function useCredentialedSeries({
  enabled,
  metric,
  granularity,
  range,
  queryKind,
  limit,
}: {
  enabled: boolean;
  metric: string;
  granularity: "day" | "hour";
  range?: AnalyticsQuery["range"];
  queryKind?: "radial-time";
  limit?: number;
}): SeriesPoint[] | undefined {
  const [live, setLive] = useState<{
    key: string;
    series: SeriesPoint[];
  }>();
  const rangeKey = queryKind ?? String(range);
  const key = `${metric}:${granularity}:${rangeKey}:${limit ?? "default"}`;

  useEffect(() => {
    if (!enabled || (!range && !queryKind)) return;
    let cancelled = false;
    const connector = createHttpConnector({ endpoint: "/api/analytics" });
    const query =
      queryKind === "radial-time"
        ? buildRadialTimePreviewQuery(metric)
        : { range: range!, metrics: [metric], granularity, limit };
    void connector
      .query(query)
      .then((result) => {
        // Mock connector ids are explicit (`mock:vercel`, etc.). Keep them out
        // of paths labelled as provider data while allowing future real ids.
        if (!cancelled && !result.meta.connectorId.startsWith("mock") && result.series.length) {
          setLive({ key, series: result.series });
        }
      })
      .catch(() => {
        // Each caller owns an explicit deterministic fallback for offline use.
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, granularity, key, limit, metric, queryKind, range]);

  return live?.key === key ? live.series : undefined;
}

function PreviewInner({
  slug,
  knobs,
  preview,
}: {
  slug: string;
  knobs: PreviewKnobs;
  preview?: boolean;
}) {
  const liveHourlySeries = useCredentialedSeries({
    enabled: slug === "radial-time-chart",
    metric: knobs.metric,
    granularity: "hour",
    queryKind: "radial-time",
  });
  const liveAnomalySeries = useCredentialedSeries({
    enabled: slug === "line-chart" && knobs.variant === "anomaly",
    metric: knobs.metric,
    granularity: "day",
    range: "30d",
  });
  const seriesQuery = useQuery({ metrics: [knobs.metric], granularity: "day" });
  const dualQuery = useQuery({ metrics: ["visitors", "pageviews"], granularity: "day" });
  const horizonQuery = useQuery({
    metrics: ["visitors", "pageviews", "visits", "events"],
    granularity: "day",
  });
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
  // The breakdown card's tabs each stand on their own query, so switching a
  // dimension is a real dimension change and not three slices of one.
  const countriesDual = useQuery({
    metrics: ["visitors", "pageviews"],
    dimensions: ["country"],
    limit: 8,
  });
  const devicesDual = useQuery({
    metrics: ["visitors", "pageviews"],
    dimensions: ["device"],
    limit: 8,
  });
  // Same dimension over a wider window, so the treemap's delta is a real
  // difference of two queries rather than an invented number. No date maths
  // here on purpose: Date.now() in a server-rendered preview reintroduces the
  // hydration mismatch fixed earlier.
  // Four separate real windows. The mock has no time-series-by-dimension, and
  // ranking the four metrics against each other never changes order — a bump
  // chart with no bumps demonstrates nothing.
  const rank7 = useQuery({ metrics: ["visitors"], dimensions: ["browser"], range: "7d", limit: 5 });
  const rank28 = useQuery({
    metrics: ["visitors"],
    dimensions: ["browser"],
    range: "28d",
    limit: 5,
  });
  const rank90 = useQuery({
    metrics: ["visitors"],
    dimensions: ["browser"],
    range: "90d",
    limit: 5,
  });
  const countriesWide = useQuery({
    metrics: ["visitors"],
    dimensions: ["country"],
    range: "90d",
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
  // Ordered so the stages actually nest: every visitor made a visit, every
  // visit made a view. Listing visitors before views produces a "funnel" that
  // widens, which is not a funnel.
  const funnel = [
    { label: "Views", value: totals.pageviews ?? 0 },
    { label: "Visits", value: totals.visits ?? 0 },
    { label: "Visitors", value: totals.visitors ?? 0 },
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
      // The catalog has no market feed, so daily visitors are the real
      // activity measure carried into this financial-shape preview.
      volume: row.value,
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
  const wideByKey = new Map(
    (countriesWide.data?.breakdown ?? []).map((row) => [row.key, row.values.visitors ?? 0]),
  );
  const treemap = (countries.data?.breakdown ?? []).map((row) => {
    const current = row.values[knobs.metric] ?? 0;
    const wide = wideByKey.get(row.key) ?? 0;
    // The 90-day window minus the current 30 leaves the preceding 60, so half
    // of that is the comparable prior month.
    const prior = Math.max(0, wide - current) / 2;
    return {
      label: row.label ?? row.key,
      value: current,
      delta: Math.round(current - prior),
    };
  });
  // Cohorts are the retained counts the mock reports for successive windows,
  // each cohort seeing one fewer period than the one before it.
  const cohorts = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map((label, index) => {
    const size = Math.max(1, Math.round((totals.visitors ?? 400) / (4 + index)));
    const periods = 5 - index;
    return {
      label,
      size,
      values: Array.from({ length: periods }, (_, step) =>
        Math.round(size * Math.max(0.08, 1 - step * (0.22 + index * 0.02))),
      ),
    };
  });
  // Horizon lanes come from the metrics that actually vary over time, rather
  // than from invented per-page series.
  const horizonKeys = ["visitors", "pageviews", "visits", "events"];
  const horizon = (horizonQuery.data?.series ?? []).map((point) => ({
    date: point.date,
    visitors: point.values.visitors ?? 0,
    pageviews: point.values.pageviews ?? 0,
    visits: point.values.visits ?? 0,
    events: point.values.events ?? 0,
  }));
  // Annotations are pinned to real dates from the series so the markers land
  // on points that exist rather than floating off the axis.
  const sampleAnnotations = [
    series[8] && { at: String(series[8].date), label: "v0.3.0", kind: "release" as const },
    series[18] && { at: String(series[18].date), label: "Deploy", kind: "deploy" as const },
  ].filter(Boolean) as { at: string; label: string; kind: "release" | "deploy" }[];
  // The treatments need data the plain sample series doesn't carry: a previous
  // period to compare against, and an actual hole to draw a gap across.
  const previousSeries = composed.map((point) => ({
    date: point.date,
    value: Math.round(point.visitors * 0.78),
  }));
  // Explicit demonstration fallback. A credentialed provider series replaces
  // this only when the same detector used by LineChart finds a real outlier.
  const spiked = series.map((point, index) =>
    index === 9
      ? { ...point, value: Math.round(point.value * 3.2) }
      : index === 21
        ? { ...point, value: Math.round(point.value * 0.18) }
        : point,
  );
  const liveAnomaly = (liveAnomalySeries ?? []).map((point) => ({
    date: point.date,
    value: point.values[knobs.metric] ?? 0,
  }));
  const hasLiveAnomalies = findAnomalyIndexes(liveAnomaly.map((point) => point.value)).size > 0;
  const anomalyPreview = hasLiveAnomalies
    ? { data: liveAnomaly, source: "provider" as const }
    : { data: spiked, source: "synthetic" as const };
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

  if (slug === "strip-chart") {
    // Ticks derived from the real per-day counts: a day with 40 visitors gets
    // 40 ticks spread across that day, rather than invented timestamps.
    const lanes = horizonKeys.slice(0, 4).map((key) => ({
      label: key,
      at: horizon.flatMap((point) => {
        const count = Math.min(40, Math.round(Number(point[key as keyof typeof point] ?? 0) / 12));
        const base = new Date(point.date).getTime();
        return Array.from({ length: count }, (_, i) => base + (i / Math.max(count, 1)) * 86400000);
      }),
    }));
    return <StripChart lanes={lanes} variant={activeVariant as StripChartVariant} />;
  }
  if (slug === "radial-time-chart") {
    // The demo route exposes Vercel, so request its real hourly buckets when
    // it is credentialed and aggregate repeated weekdays to the 7×24 cells
    // this chart expects.
    if (liveHourlySeries?.length) {
      const buckets = new Map<
        string,
        { day: number; hour: number; total: number; count: number }
      >();
      for (const point of liveHourlySeries) {
        const date = new Date(point.date);
        if (Number.isNaN(date.getTime())) continue;
        const day = (date.getUTCDay() + 6) % 7;
        const hour = date.getUTCHours();
        const key = `${day}-${hour}`;
        const current = buckets.get(key) ?? { day, hour, total: 0, count: 0 };
        current.total += point.values[knobs.metric] ?? 0;
        current.count += 1;
        buckets.set(key, current);
      }
      return (
        <div className="grid gap-2" data-preview-source="provider">
          <RadialTimeChart
            data={[...buckets.values()].map((cell) => ({
              day: cell.day,
              hour: cell.hour,
              value: Math.round(cell.total / cell.count),
            }))}
            variant={activeVariant as RadialTimeVariant}
          />
          <p className="ak-muted">Provider hourly data · latest 96 completed hours</p>
        </div>
      );
    }
    // Without credentials the API route identifies itself as mock:vercel,
    // whose daily-only series cannot honestly become hourly data. Keep the
    // documented synthetic fallback instead of pretending those are buckets.
    const shape = [
      0.2, 0.14, 0.1, 0.08, 0.08, 0.12, 0.3, 0.6, 0.9, 1, 0.95, 0.9, 0.85, 0.9, 0.95, 1, 0.92, 0.8,
      0.7, 0.62, 0.55, 0.45, 0.35, 0.26,
    ];
    const cells: { hour: number; day: number; value: number }[] = [];
    const seen = new Set<string>();
    for (const point of series) {
      const date = new Date(point.date);
      if (Number.isNaN(date.getTime())) continue;
      const day = (date.getUTCDay() + 6) % 7;
      for (let hour = 0; hour < 24; hour += 1) {
        const key = `${day}-${hour}`;
        if (seen.has(key)) continue;
        seen.add(key);
        cells.push({ day, hour, value: Math.round(point.value * shape[hour]) });
      }
    }
    return (
      <div className="grid gap-2" data-preview-source="synthetic">
        <RadialTimeChart data={cells} variant={activeVariant as RadialTimeVariant} />
        <p className="ak-muted">Synthetic hourly fallback</p>
      </div>
    );
  }
  if (slug === "bump-chart") {
    // Ranking the four metrics against each other never changes order, and a
    // bump chart with no bumps demonstrates nothing. These are three real
    // windows of the same dimension, where the ordering genuinely moves.
    const windows = [rank7, rank28, rank90];
    const names = (rank90.data?.breakdown ?? []).map((row) => row.label ?? row.key);
    const rankRows = ["7d", "28d", "90d"].map((label, index) => {
      const row: Record<string, string | number> = { date: label };
      for (const name of names) {
        const match = (windows[index].data?.breakdown ?? []).find(
          (entry) => (entry.label ?? entry.key) === name,
        );
        row[name] = match?.values.visitors ?? 0;
      }
      return row;
    });
    return (
      <BumpChart data={rankRows} dataKeys={names} variant={activeVariant as BumpChartVariant} />
    );
  }
  if (slug === "marimekko-chart") {
    return (
      <MarimekkoChart
        data={breakdownDual}
        dataKeys={["visitors", "pageviews"]}
        variant={activeVariant as MarimekkoVariant}
      />
    );
  }
  if (slug === "spark-table") {
    const bySeries = horizonKeys.map((key) => ({
      label: key,
      value: horizon.reduce((sum, point) => sum + Number(point[key as keyof typeof point] ?? 0), 0),
      trend: horizon.map((point) => Number(point[key as keyof typeof point] ?? 0)),
      delta: Math.round(
        Number(horizon[horizon.length - 1]?.[key as keyof (typeof horizon)[number]] ?? 0) -
          Number(horizon[0]?.[key as keyof (typeof horizon)[number]] ?? 0),
      ),
    }));
    return (
      <SparkTable data={bySeries} label="Metric" variant={activeVariant as SparkTableVariant} />
    );
  }
  if (slug === "timeline-chart") {
    return <TimelineChart items={sampleAnnotations} variant={activeVariant as TimelineVariant} />;
  }
  if (slug === "waterfall-chart") {
    // Real day-over-day deltas from the series, not invented steps.
    const steps = deltas
      .slice(-6)
      .map((row) => ({ label: String(row.date).slice(5), value: row.value }));
    return <WaterfallChart data={steps} variant={activeVariant as WaterfallChartVariant} />;
  }
  if (slug === "share-band") {
    return <ShareBand data={breakdown} variant={activeVariant as ShareBandVariant} />;
  }
  if (slug === "slope-chart") {
    // Current window against the comparable prior month, the same real
    // difference the treemap's diverging variant uses.
    const rows = treemap.slice(0, 6).map((row) => ({
      label: row.label,
      from: Math.max(0, row.value - row.delta),
      to: row.value,
    }));
    return (
      <SlopeChart
        data={rows}
        fromLabel="Prev 30d"
        toLabel="Last 30d"
        variant={activeVariant as SlopeChartVariant}
      />
    );
  }
  if (slug === "quota-bar") {
    const used = Math.round(totals.events ?? 0);
    return (
      <QuotaBar
        used={used}
        limit={Math.max(1, Math.round(used * 1.35))}
        projected={Math.round(used * 1.18)}
        label="Events this cycle"
        resetsIn="12 days"
        variant={activeVariant as QuotaBarVariant}
      />
    );
  }
  if (slug === "treemap-chart") {
    return <TreemapChart data={treemap} variant={activeVariant as TreemapChartVariant} />;
  }
  if (slug === "cohort-grid") {
    return (
      <CohortGrid data={cohorts} periodLabel="Week" variant={activeVariant as CohortGridVariant} />
    );
  }
  if (slug === "horizon-chart") {
    return (
      <HorizonChart
        data={horizon}
        dataKeys={horizonKeys}
        variant={activeVariant as HorizonChartVariant}
      />
    );
  }
  if (slug === "area-chart") {
    // The composition variants need a second series to compose.
    if (activeVariant === "ridge") {
      // Four lanes rather than two: the overlap that makes a ridgeline read
      // needs more than one neighbour.
      return (
        <AreaChart
          data={horizon}
          dataKeys={horizonKeys}
          variant={activeVariant as AreaChartVariant}
          scale={knobs.scale}
        />
      );
    }
    if (activeVariant === "stacked" || activeVariant === "stream") {
      return (
        <AreaChart
          data={composed}
          dataKeys={["visitors", "pageviews"]}
          variant={activeVariant as AreaChartVariant}
          scale={knobs.scale}
        />
      );
    }
    return (
      <AreaChart
        data={holed}
        variant={activeVariant as AreaChartVariant}
        scale={knobs.scale}
        emphasizeLast={knobs.emphasizeLast}
        previous={knobs.compare || activeVariant === "band" ? previousSeries : undefined}
        gaps={knobs.gaps === "off" ? undefined : knobs.gaps}
        annotations={knobs.annotations ? sampleAnnotations : undefined}
        brush={knobs.brush}
      />
    );
  }
  if (slug === "line-chart") {
    if (activeVariant === "anomaly") {
      return (
        <div className="grid gap-2" data-preview-source={anomalyPreview.source}>
          <LineChart
            data={anomalyPreview.data}
            variant={activeVariant as LineChartVariant}
            scale={knobs.scale}
          />
          <p className="ak-muted">
            {anomalyPreview.source === "provider"
              ? "Credentialed provider data"
              : "Synthetic outliers — no qualifying provider spike available"}
          </p>
        </div>
      );
    }
    if (activeVariant === "focus") {
      return (
        <LineChart
          data={horizon}
          dataKeys={horizonKeys}
          variant={activeVariant as LineChartVariant}
          scale={knobs.scale}
        />
      );
    }
    if (activeVariant === "dual") {
      // Two metrics whose units genuinely differ by roughly an order of
      // magnitude, which is the only situation twin axes are the right answer to.
      return (
        <LineChart
          data={composed}
          dataKeys={["visitors", "pageviews"]}
          variant={activeVariant as LineChartVariant}
        />
      );
    }
    if (activeVariant === "forecast") {
      // Fitted to the contiguous series, not to `holed` — projecting a trend
      // through a collection outage measures the outage.
      return (
        <LineChart data={series} variant={activeVariant as LineChartVariant} scale={knobs.scale} />
      );
    }
    return (
      <LineChart
        data={holed}
        variant={activeVariant as LineChartVariant}
        scale={knobs.scale}
        emphasizeLast={knobs.emphasizeLast}
        previous={knobs.compare ? previousSeries : undefined}
        gaps={knobs.gaps === "off" ? undefined : knobs.gaps}
        annotations={knobs.annotations ? sampleAnnotations : undefined}
        brush={knobs.brush}
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
    if (activeVariant === "bullet") {
      // Target is the period's mean, a real derived number rather than an
      // invented goal.
      const mean = breakdown.reduce((sum, row) => sum + row.value, 0) / (breakdown.length || 1);
      return (
        <BarChart
          data={breakdown.map((row) => ({ ...row, target: Math.round(mean) }))}
          variant={activeVariant as BarChartVariant}
        />
      );
    }
    if (activeVariant === "diverging") {
      // Real signed numbers, not abs values dressed up: the treemap deltas are
      // a genuine difference of two queries.
      return (
        <BarChart
          data={treemap.map((row) => ({ label: row.label, value: row.delta }))}
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
  if (slug === "globe-chart") {
    return (
      <GlobeChart
        locations={regions.map((row) => ({
          code: row.code,
          label: row.label,
          value: row.value,
        }))}
        variant={activeVariant as GlobeChartVariant}
        valueLabel={knobs.metric}
      />
    );
  }
  if (slug === "metric-tabs") {
    return <MetricTabsPreview rows={horizon} variant={activeVariant as MetricTabsVariant} />;
  }
  if (slug === "empty-state") {
    return (
      <EmptyState
        title="No events in this range"
        description="Events arrive once the tracking snippet fires. Widen the range, or check that the site is sending them."
        action={
          <button type="button" className="ak-retry">
            Open the docs
          </button>
        }
        variant={activeVariant as EmptyStateVariant}
      />
    );
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
  if (slug === "breakdown-card") {
    return (
      <BreakdownCardPreview
        countries={countriesDual.data?.breakdown ?? []}
        devices={devicesDual.data?.breakdown ?? []}
        browsers={browsersDual.data?.breakdown ?? []}
        metric="visitors"
        variant={activeVariant as BreakdownCardVariant}
      />
    );
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
    scale: knobs?.scale ?? "linear",
    gaps: knobs?.gaps ?? "off",
    annotations: knobs?.annotations ?? false,
    brush: knobs?.brush ?? false,
  };

  return (
    <AnalyticsProvider connector={connector} theme={theme} range="30d" previewQuery={previewQuery}>
      <PreviewInner slug={slug} knobs={resolved} preview={preview} />
    </AnalyticsProvider>
  );
}
