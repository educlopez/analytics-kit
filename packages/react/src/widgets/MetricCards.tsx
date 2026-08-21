import {
  formatDelta,
  formatMetric,
  getMetric,
  percentDelta,
  type DateRangeInput,
  type MetricId,
} from "@analytics-kit/core";
import { WidgetFrame } from "../primitives/WidgetFrame.js";
import { Sparkline } from "../primitives/Charts.js";
import { useQuery } from "../hooks.js";
import { registerWidget } from "../registry.js";

export interface MetricCardProps {
  metric: MetricId;
  title?: string;
  range?: DateRangeInput;
  span?: number;
}

export function MetricCard({ metric, title, range, span }: MetricCardProps) {
  const definition = getMetric(metric);
  const { data, status, missing, error } = useQuery({
    metrics: [metric],
    granularity: "day",
    includePrevious: true,
    range,
  });
  const value = data?.totals[metric] ?? 0;
  const previous = data?.previous?.totals[metric];
  const delta = previous == null ? null : percentDelta(value, previous);

  return (
    <WidgetFrame
      title={title ?? definition?.label ?? metric}
      status={status}
      missing={missing}
      error={error}
      span={span}
      trailing={
        <Sparkline values={(data?.series ?? []).map((point) => point.values[metric] ?? 0)} />
      }
    >
      <MetricValueBlock
        value={formatMetric(metric, value)}
        delta={delta == null ? null : { text: formatDelta(delta), positive: delta >= 0 }}
      />
    </WidgetFrame>
  );
}

function MetricValueBlock({
  value,
  delta,
}: {
  value: string;
  delta: { text: string; positive: boolean } | null;
}) {
  return (
    <div className="ak-metric">
      <div className="ak-metric-value">{value}</div>
      {delta ? (
        <span className={delta.positive ? "ak-delta-up" : "ak-delta-down"}>{delta.text}</span>
      ) : null}
    </div>
  );
}

export function VisitorsCard(props: Omit<MetricCardProps, "metric">) {
  return <MetricCard metric="visitors" {...props} />;
}
export function PageviewsCard(props: Omit<MetricCardProps, "metric">) {
  return <MetricCard metric="pageviews" {...props} />;
}
export function VisitsCard(props: Omit<MetricCardProps, "metric">) {
  return <MetricCard metric="visits" {...props} />;
}
export function BounceRateCard(props: Omit<MetricCardProps, "metric">) {
  return <MetricCard metric="bounceRate" title="Bounce rate" {...props} />;
}
export function DurationCard(props: Omit<MetricCardProps, "metric">) {
  return <MetricCard metric="avgDuration" title="Avg. duration" {...props} />;
}

registerWidget({
  id: "visitors",
  title: "Visitors",
  required: { metrics: ["visitors"] },
  component: VisitorsCard,
});
registerWidget({
  id: "pageviews",
  title: "Pageviews",
  required: { metrics: ["pageviews"] },
  component: PageviewsCard,
});
registerWidget({
  id: "visits",
  title: "Visits",
  required: { metrics: ["visits"] },
  component: VisitsCard,
});
registerWidget({
  id: "bounce-rate",
  title: "Bounce rate",
  required: { metrics: ["bounceRate"] },
  component: BounceRateCard,
});
registerWidget({
  id: "duration",
  title: "Avg. duration",
  required: { metrics: ["avgDuration"] },
  component: DurationCard,
});
