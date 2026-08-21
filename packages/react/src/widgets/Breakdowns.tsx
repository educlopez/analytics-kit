import type { DateRangeInput, DimensionId, MetricId } from "@analytics-kit/core";
import { getDimension } from "@analytics-kit/core";
import { WidgetFrame } from "../primitives/WidgetFrame.js";
import { BreakdownTable, CategoryBars, Donut, RankedList, Tracker } from "../primitives/Charts.js";
import { useQuery } from "../hooks.js";
import { registerWidget } from "../registry.js";

type Variant = "list" | "bars" | "donut" | "table" | "compact";

export function BreakdownWidget({
  dimension,
  metric = "visitors",
  title,
  variant = "list",
  range,
  span,
  limit = 8,
}: {
  dimension: DimensionId;
  metric?: MetricId;
  title?: string;
  variant?: Variant;
  range?: DateRangeInput;
  span?: number;
  limit?: number;
}) {
  const { data, status, missing, error } = useQuery({
    metrics: [metric],
    dimensions: [dimension],
    range,
    limit,
  });
  const rows = data?.breakdown ?? [];
  const heading = title ?? getDimension(dimension)?.label ?? dimension;

  return (
    <WidgetFrame title={heading} status={status} missing={missing} error={error} span={span}>
      {variant === "bars" ? <CategoryBars rows={rows} metric={metric} /> : null}
      {variant === "donut" ? <Donut rows={rows} metric={metric} /> : null}
      {variant === "table" ? <BreakdownTable rows={rows} metric={metric} /> : null}
      {variant === "list" ? <RankedList rows={rows} metric={metric} variant="bar" /> : null}
      {variant === "compact" ? <RankedList rows={rows} metric={metric} variant="compact" /> : null}
    </WidgetFrame>
  );
}

export function TopBrowsers(props: Omit<Parameters<typeof BreakdownWidget>[0], "dimension">) {
  return <BreakdownWidget dimension="browser" title="Browsers" variant="bars" {...props} />;
}

export function TopOs(props: Omit<Parameters<typeof BreakdownWidget>[0], "dimension">) {
  return <BreakdownWidget dimension="os" title="Operating systems" {...props} />;
}

export function TopSources(props: Omit<Parameters<typeof BreakdownWidget>[0], "dimension">) {
  return <BreakdownWidget dimension="source" title="Sources" {...props} />;
}

export function TopCampaigns(props: Omit<Parameters<typeof BreakdownWidget>[0], "dimension">) {
  return <BreakdownWidget dimension="campaign" title="Campaigns" {...props} />;
}

export function TopEvents(
  props: Omit<Parameters<typeof BreakdownWidget>[0], "dimension" | "metric">,
) {
  return (
    <BreakdownWidget
      dimension="eventName"
      metric="events"
      title="Events"
      variant="table"
      {...props}
    />
  );
}

export function PagesTable(
  props: Omit<Parameters<typeof BreakdownWidget>[0], "dimension" | "metric">,
) {
  return (
    <BreakdownWidget
      dimension="path"
      metric="pageviews"
      title="Pages"
      variant="table"
      span={2}
      {...props}
    />
  );
}

export function VisitTracker({ range, span = 4 }: { range?: DateRangeInput; span?: number }) {
  const { data, status, missing, error } = useQuery({
    metrics: ["visitors"],
    granularity: "day",
    range,
  });
  return (
    <WidgetFrame
      title="Daily visitors"
      description="Intensity of traffic across the range."
      status={status}
      missing={missing}
      error={error}
      span={span}
    >
      <Tracker values={(data?.series ?? []).map((point) => point.values.visitors ?? 0)} />
    </WidgetFrame>
  );
}

registerWidget({
  id: "top-browsers",
  title: "Browsers",
  required: { metrics: ["visitors"], dimensions: ["browser"] },
  component: TopBrowsers,
});
registerWidget({
  id: "top-os",
  title: "Operating systems",
  required: { metrics: ["visitors"], dimensions: ["os"] },
  component: TopOs,
});
registerWidget({
  id: "top-sources",
  title: "Sources",
  required: { metrics: ["visitors"], dimensions: ["source"] },
  component: TopSources,
});
registerWidget({
  id: "top-campaigns",
  title: "Campaigns",
  required: { metrics: ["visitors"], dimensions: ["campaign"] },
  component: TopCampaigns,
});
registerWidget({
  id: "top-events",
  title: "Events",
  required: { metrics: ["events"], dimensions: ["eventName"] },
  component: TopEvents,
});
registerWidget({
  id: "pages-table",
  title: "Pages table",
  required: { metrics: ["pageviews"], dimensions: ["path"] },
  component: PagesTable,
});
registerWidget({
  id: "tracker",
  title: "Daily tracker",
  required: { metrics: ["visitors"] },
  component: VisitTracker,
});
