import type { DateRangeInput, MetricId } from "@wingtics/core";
import { getMetric } from "@wingtics/core";
import { WidgetFrame } from "../primitives/WidgetFrame.js";
import { Donut, RankedList, Timeseries } from "../primitives/Charts.js";
import { useQuery, useRealtime } from "../hooks.js";
import { registerWidget } from "../registry.js";
import type { AreaChartVariant } from "../charts/area-chart.js";

export function TimeseriesChart({
  metric = "visitors",
  title,
  range,
  span = 3,
  variant = "gradient",
}: {
  metric?: MetricId;
  title?: string;
  range?: DateRangeInput;
  span?: number;
  variant?: AreaChartVariant;
}) {
  const { data, status, missing, error, sample, reload } = useQuery({
    metrics: [metric],
    granularity: "day",
    range,
  });
  return (
    <WidgetFrame
      title={title ?? `${getMetric(metric)?.label ?? metric} over time`}
      status={status}
      missing={missing}
      error={error}
      span={span}
      kind="chart"
      sample={sample}
      onRetry={reload}
    >
      <Timeseries series={data?.series ?? []} metric={metric} variant={variant} />
    </WidgetFrame>
  );
}

export function TopPages({ range, span }: { range?: DateRangeInput; span?: number }) {
  const { data, status, missing, error, sample, reload } = useQuery({
    metrics: ["pageviews"],
    dimensions: ["path"],
    range,
    limit: 8,
  });
  return (
    <WidgetFrame
      title="Top pages"
      status={status}
      missing={missing}
      error={error}
      span={span}
      kind="list"
      sample={sample}
      onRetry={reload}
    >
      <RankedList rows={data?.breakdown ?? []} metric="pageviews" />
    </WidgetFrame>
  );
}

export function TopReferrers({ range, span }: { range?: DateRangeInput; span?: number }) {
  const { data, status, missing, error, sample, reload } = useQuery({
    metrics: ["visitors"],
    dimensions: ["referrer"],
    range,
    limit: 8,
  });
  return (
    <WidgetFrame
      title="Top referrers"
      status={status}
      missing={missing}
      error={error}
      span={span}
      kind="list"
      sample={sample}
      onRetry={reload}
    >
      <RankedList rows={data?.breakdown ?? []} metric="visitors" />
    </WidgetFrame>
  );
}

export function TopCountries({ range, span }: { range?: DateRangeInput; span?: number }) {
  const { data, status, missing, error, sample, reload } = useQuery({
    metrics: ["visitors"],
    dimensions: ["country"],
    range,
    limit: 8,
  });
  return (
    <WidgetFrame
      title="Countries"
      status={status}
      missing={missing}
      error={error}
      span={span}
      kind="list"
      sample={sample}
      onRetry={reload}
    >
      <RankedList rows={data?.breakdown ?? []} metric="visitors" />
    </WidgetFrame>
  );
}

export function Devices({ range, span }: { range?: DateRangeInput; span?: number }) {
  const { data, status, missing, error, sample, reload } = useQuery({
    metrics: ["visitors"],
    dimensions: ["device"],
    range,
    limit: 6,
  });
  return (
    <WidgetFrame
      title="Devices"
      status={status}
      missing={missing}
      error={error}
      span={span}
      kind="donut"
      sample={sample}
      onRetry={reload}
    >
      <Donut rows={data?.breakdown ?? []} metric="visitors" />
    </WidgetFrame>
  );
}

export function RealtimeCard({ span }: { span?: number }) {
  const { data, status, missing } = useRealtime();
  return (
    <WidgetFrame title="Right now" status={status} missing={missing} span={span} kind="metric">
      <div className="ak-metric">
        <div className="ak-metric-value">{data?.visitors ?? 0}</div>
        <span className="ak-live">live visitors</span>
      </div>
      {data?.currentPages?.length ? (
        <ul className="ak-rank ak-rank-compact">
          {data.currentPages.map((page) => (
            <li key={page.path} className="ak-rank-row">
              <div className="ak-rank-top">
                <span className="ak-rank-label">{page.path}</span>
                <span className="ak-rank-value">{page.visitors}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </WidgetFrame>
  );
}

registerWidget({
  id: "timeseries",
  title: "Timeseries",
  required: { metrics: ["visitors"] },
  component: TimeseriesChart,
});
registerWidget({
  id: "top-pages",
  title: "Top pages",
  required: { metrics: ["pageviews"], dimensions: ["path"] },
  component: TopPages,
});
registerWidget({
  id: "top-referrers",
  title: "Top referrers",
  required: { metrics: ["visitors"], dimensions: ["referrer"] },
  component: TopReferrers,
});
registerWidget({
  id: "top-countries",
  title: "Countries",
  required: { metrics: ["visitors"], dimensions: ["country"] },
  component: TopCountries,
});
registerWidget({
  id: "devices",
  title: "Devices",
  required: { metrics: ["visitors"], dimensions: ["device"] },
  component: Devices,
});
registerWidget({
  id: "realtime",
  title: "Realtime",
  required: { realtime: true },
  component: RealtimeCard,
});
