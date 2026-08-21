import { DATE_RANGE_PRESETS, type DateRangePreset } from "@analytics-kit/core";
import { getWidget } from "./registry.js";
import { useAnalytics } from "./context.js";
import "./widgets/MetricCards.js";
import "./widgets/Charts.js";
import "./widgets/Breakdowns.js";

export interface DashboardItem {
  widget: string;
  span?: number;
  props?: Record<string, unknown>;
}

export const defaultDashboard: DashboardItem[] = [
  { widget: "visitors" },
  { widget: "pageviews" },
  { widget: "visits" },
  { widget: "events" },
  { widget: "timeseries", span: 4, props: { metric: "visitors" } },
  { widget: "top-pages", span: 2 },
  { widget: "top-referrers" },
  { widget: "devices" },
  { widget: "top-browsers" },
  { widget: "top-os" },
  { widget: "top-countries" },
  { widget: "top-sources" },
  { widget: "tracker", span: 4 },
];

/** Every built-in widget. Use with a full-capability connector (mock profile `full`). */
export const catalogDashboard: DashboardItem[] = [
  { widget: "visitors" },
  { widget: "pageviews" },
  { widget: "visits" },
  { widget: "realtime" },
  { widget: "bounce-rate" },
  { widget: "duration" },
  { widget: "views-per-visit" },
  { widget: "events" },
  { widget: "timeseries", span: 4, props: { metric: "visitors" } },
  { widget: "pages-table", span: 2 },
  { widget: "top-referrers" },
  { widget: "devices" },
  { widget: "top-browsers" },
  { widget: "top-os" },
  { widget: "top-countries" },
  { widget: "top-sources" },
  { widget: "top-campaigns" },
  { widget: "top-events", span: 2 },
  { widget: "tracker", span: 4 },
];

export function Dashboard({
  widgets = defaultDashboard,
  columns = 4,
  showRange = true,
}: {
  widgets?: DashboardItem[];
  columns?: number;
  showRange?: boolean;
}) {
  const { range, setRange, connector } = useAnalytics();

  return (
    <div className="ak-dashboard">
      {showRange ? (
        <div className="ak-toolbar">
          <div>
            <p className="ak-eyebrow">Analytics</p>
            <h2 className="ak-heading">{connector.name}</h2>
          </div>
          <div className="ak-range">
            {DATE_RANGE_PRESETS.filter((preset) =>
              ["24h", "7d", "30d", "90d", "12mo"].includes(preset),
            ).map((preset) => (
              <button
                key={preset}
                type="button"
                className={range === preset ? "is-active" : ""}
                onClick={() => setRange(preset as DateRangePreset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div
        className="ak-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {widgets.map((item, index) => {
          const def = getWidget(item.widget);
          if (!def) {
            return (
              <section
                key={`${item.widget}-${index}`}
                className="ak-widget"
                style={{ gridColumn: `span ${item.span ?? 1}` }}
              >
                <p className="ak-muted">Unknown widget: {item.widget}</p>
              </section>
            );
          }
          const Component = def.component;
          return (
            <Component key={`${item.widget}-${index}`} span={item.span} {...(item.props ?? {})} />
          );
        })}
      </div>
    </div>
  );
}
