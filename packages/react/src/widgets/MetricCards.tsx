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
import type { MetricCardVariant } from "../charts/variants.js";

export interface MetricCardProps {
  metric: MetricId;
  title?: string;
  range?: DateRangeInput;
  span?: number;
  variant?: MetricCardVariant;
}

export function MetricCard({ metric, title, range, span, variant = "default" }: MetricCardProps) {
  const definition = getMetric(metric);
  const { data, status, missing, error, sample, reload } = useQuery({
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
      kind="metric"
      sample={sample}
      onRetry={reload}
      trailing={
        variant === "compact" ? null : (
          <Sparkline fill values={(data?.series ?? []).map((point) => point.values[metric] ?? 0)} />
        )
      }
    >
      <MetricValueBlock
        variant={variant}
        value={formatMetric(metric, value)}
        delta={delta == null ? null : { text: formatDelta(delta), positive: delta >= 0 }}
      />
    </WidgetFrame>
  );
}

function MetricValueBlock({
  value,
  delta,
  variant,
}: {
  value: string;
  delta: { text: string; positive: boolean } | null;
  variant: MetricCardVariant;
}) {
  return (
    <div className={variant === "hero" ? "ak-metric ak-metric-hero" : "ak-metric"}>
      <div className="ak-metric-value">{value}</div>
      {variant === "compact" && !delta ? null : delta ? (
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

export function ViewsPerVisitCard(props: Omit<MetricCardProps, "metric">) {
  return <MetricCard metric="viewsPerVisit" title="Views / visit" {...props} />;
}

export function EventsCard(props: Omit<MetricCardProps, "metric">) {
  return <MetricCard metric="events" {...props} />;
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
registerWidget({
  id: "views-per-visit",
  title: "Views / visit",
  required: { metrics: ["viewsPerVisit"] },
  component: ViewsPerVisitCard,
});
registerWidget({
  id: "events",
  title: "Events",
  required: { metrics: ["events"] },
  component: EventsCard,
});
