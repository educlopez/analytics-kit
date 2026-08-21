import { useEffect, useMemo, type ReactNode } from "react";
import { createMockConnector } from "@analytics-kit/connector-mock";
import {
  AREA_CHART_VARIANTS,
  AnalyticsProvider,
  BAR_CHART_VARIANTS,
  BAR_LIST_VARIANTS,
  BreakdownWidget,
  AreaChart,
  BarChart,
  Dashboard,
  LINE_CHART_VARIANTS,
  LineChart,
  METRIC_CARD_VARIANTS,
  MetricCard,
  PIE_CHART_VARIANTS,
  PieChart,
  RankedList,
  TimeseriesChart,
  catalogDashboard,
  useQuery,
  type AnalyticsTheme,
} from "@analytics-kit/react";
import { Link } from "react-router-dom";
import { PropsTable, type PropRow } from "../site/PropsTable";
import { useSite } from "../site/SiteShell";

const TOC = [
  { href: "#config", label: "Shared config" },
  { href: "#area", label: "AreaChart" },
  { href: "#line", label: "LineChart" },
  { href: "#bar", label: "BarChart" },
  { href: "#pie", label: "PieChart" },
  { href: "#metric", label: "MetricCard" },
  { href: "#ranked", label: "RankedList" },
  { href: "#wired", label: "Wired widgets" },
  { href: "#dashboard", label: "Dashboard" },
] as const;

const SHARED_CHART_PROPS: PropRow[] = [
  {
    name: "data",
    type: "ChartDatum[]",
    notes: "Rows of string | number fields. Series use date + value; breakdowns use label + value.",
  },
  {
    name: "dataKey",
    type: "string",
    default: '"value"',
    notes: "Numeric field to plot.",
  },
  {
    name: "labelKey",
    type: "string",
    notes: 'Axis / slice label. Defaults to "date" on area/line, "label" on bar/pie.',
  },
  {
    name: "variant",
    type: "string",
    notes: "Visual drawing. Listed on each component below.",
  },
  {
    name: "config",
    type: "ChartConfig",
    notes: "{ [dataKey]: { label?, color? } }. color should be var(--chart-1) or a CSS color.",
  },
  {
    name: "className",
    type: "string",
    notes: "Passed to the chart container (height, width). Spark looks better around h-[88px].",
  },
];

function CatalogData({
  children,
}: {
  children: (data: {
    series: { date: string; value: number }[];
    breakdown: { label: string; value: number }[];
    rows: { key: string; label?: string; values: Record<string, number> }[];
  }) => ReactNode;
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
  return <>{children({ series, breakdown, rows })}</>;
}

function VariantCard({
  title,
  snippet,
  children,
}: {
  title: string;
  snippet: string;
  children: ReactNode;
}) {
  return (
    <article className="variant-card">
      <h4>{title}</h4>
      {children}
      <code>{snippet}</code>
    </article>
  );
}

function LiveCatalog({ theme }: { theme: AnalyticsTheme }) {
  const connector = useMemo(
    () => createMockConnector({ profile: "full", siteName: "Component catalog", seed: 11 }),
    [],
  );

  return (
    <AnalyticsProvider connector={connector} theme={theme} range="30d">
      <CatalogData>
        {({ series, breakdown, rows }) => (
          <>
            <section className="docs-section" id="area">
              <p className="kicker">AreaChart</p>
              <h2>Filled trend</h2>
              <p className="lede compact">
                Like shadcn / bklit area charts. <code>gradient</code> is the default fill.{" "}
                <code>spark</code> is the same drawing at sparkline height.
              </p>
              <div className="variant-grid">
                {AREA_CHART_VARIANTS.map((variant) => (
                  <VariantCard
                    key={variant}
                    title={variant}
                    snippet={`<AreaChart variant="${variant}" />`}
                  >
                    <AreaChart
                      data={series}
                      variant={variant}
                      className={variant === "spark" ? "h-[88px]" : undefined}
                    />
                  </VariantCard>
                ))}
              </div>
              <PropsTable
                rows={[
                  ...SHARED_CHART_PROPS.filter((row) => row.name !== "variant"),
                  {
                    name: "variant",
                    type: '"gradient" | "linear" | "natural" | "step" | "dots" | "spark"',
                    default: '"gradient"',
                    notes: "Curve + fill. spark also implies a compact sparkline treatment.",
                  },
                  {
                    name: "labelKey",
                    type: "string",
                    default: '"date"',
                    notes: "X-axis field.",
                  },
                ]}
              />
            </section>

            <section className="docs-section" id="line">
              <p className="kicker">LineChart</p>
              <h2>Stroke only</h2>
              <p className="lede compact">
                Intent UI-style line: monotone, linear, step, dashed, or dots.
              </p>
              <div className="variant-grid">
                {LINE_CHART_VARIANTS.map((variant) => (
                  <VariantCard
                    key={variant}
                    title={variant}
                    snippet={`<LineChart variant="${variant}" />`}
                  >
                    <LineChart data={series} variant={variant} />
                  </VariantCard>
                ))}
              </div>
              <PropsTable
                rows={[
                  ...SHARED_CHART_PROPS.filter((row) => row.name !== "variant"),
                  {
                    name: "variant",
                    type: '"monotone" | "linear" | "step" | "dashed" | "dots"',
                    default: '"monotone"',
                    notes: "Interpolation and stroke style.",
                  },
                  {
                    name: "labelKey",
                    type: "string",
                    default: '"date"',
                    notes: "X-axis field.",
                  },
                ]}
              />
            </section>

            <section className="docs-section" id="bar">
              <p className="kicker">BarChart</p>
              <h2>Breakdown bars</h2>
              <p className="lede compact">
                ReUI / shadcnblocks bars. Horizontal flips the layout. Hatched uses a stripe fill.
              </p>
              <div className="variant-grid">
                {BAR_CHART_VARIANTS.map((variant) => (
                  <VariantCard
                    key={variant}
                    title={variant}
                    snippet={`<BarChart variant="${variant}" />`}
                  >
                    <BarChart data={breakdown} variant={variant} />
                  </VariantCard>
                ))}
              </div>
              <PropsTable
                rows={[
                  ...SHARED_CHART_PROPS.filter((row) => row.name !== "variant"),
                  {
                    name: "variant",
                    type: '"vertical" | "horizontal" | "rounded" | "hatched"',
                    default: '"vertical"',
                    notes: "Orientation and bar treatment.",
                  },
                  {
                    name: "labelKey",
                    type: "string",
                    default: '"label"',
                    notes: "Category field.",
                  },
                ]}
              />
            </section>

            <section className="docs-section" id="pie">
              <p className="kicker">PieChart</p>
              <h2>Share of a dimension</h2>
              <p className="lede compact">
                Slices take <code>--chart-1</code>…<code>--chart-5</code> in order.{" "}
                <code>legend</code> adds labels beside the donut. PieChart does not take{" "}
                <code>config</code> — colors come from the palette.
              </p>
              <div className="variant-grid">
                {PIE_CHART_VARIANTS.map((variant) => (
                  <VariantCard
                    key={variant}
                    title={variant}
                    snippet={`<PieChart variant="${variant}" />`}
                  >
                    <PieChart data={breakdown} variant={variant} />
                  </VariantCard>
                ))}
              </div>
              <PropsTable
                rows={[
                  {
                    name: "data",
                    type: "ChartDatum[]",
                    notes: "One row per slice.",
                  },
                  {
                    name: "dataKey",
                    type: "string",
                    default: '"value"',
                    notes: "Numeric field.",
                  },
                  {
                    name: "labelKey",
                    type: "string",
                    default: '"label"',
                    notes: "Slice name.",
                  },
                  {
                    name: "variant",
                    type: '"donut" | "pie" | "legend"',
                    default: '"donut"',
                    notes: "Inner radius and whether a legend is shown.",
                  },
                  {
                    name: "className",
                    type: "string",
                    notes: "Chart container class.",
                  },
                ]}
              />
            </section>

            <section className="docs-section" id="metric">
              <p className="kicker">MetricCard</p>
              <h2>A number, a delta, a spark</h2>
              <p className="lede compact">
                Asks the connector for one metric plus the previous period. Aliases: VisitorsCard,
                PageviewsCard, VisitsCard, EventsCard, BounceRateCard, DurationCard,
                ViewsPerVisitCard.
              </p>
              <div className="variant-grid">
                {METRIC_CARD_VARIANTS.map((variant) => (
                  <VariantCard
                    key={variant}
                    title={variant}
                    snippet={`<MetricCard metric="visitors" variant="${variant}" />`}
                  >
                    <MetricCard metric="visitors" variant={variant} />
                  </VariantCard>
                ))}
              </div>
              <PropsTable
                rows={[
                  {
                    name: "metric",
                    type: "MetricId",
                    notes:
                      "visitors, pageviews, visits, bounceRate, avgDuration, viewsPerVisit, events.",
                  },
                  {
                    name: "title",
                    type: "string",
                    notes: "Overrides the catalog label.",
                  },
                  {
                    name: "variant",
                    type: '"default" | "spark" | "compact" | "hero"',
                    default: '"default"',
                    notes: "Layout of the value, delta, and trailing sparkline.",
                  },
                  {
                    name: "range",
                    type: "DateRangeInput",
                    notes: "Overrides the provider range for this card.",
                  },
                  {
                    name: "span",
                    type: "number",
                    notes: "Dashboard grid span.",
                  },
                ]}
              />
            </section>

            <section className="docs-section" id="ranked">
              <p className="kicker">RankedList</p>
              <h2>Breakdown rows</h2>
              <p className="lede compact">
                Bar tracks, a compact list, or a table. Used inside TopPages, TopReferrers, and
                BreakdownWidget.
              </p>
              <div className="variant-grid">
                {BAR_LIST_VARIANTS.map((variant) => (
                  <VariantCard
                    key={variant}
                    title={variant}
                    snippet={`<RankedList variant="${variant}" />`}
                  >
                    <RankedList rows={rows} metric="visitors" variant={variant} />
                  </VariantCard>
                ))}
              </div>
              <PropsTable
                rows={[
                  {
                    name: "rows",
                    type: "BreakdownRow[]",
                    notes: "From AnalyticsResult.breakdown — key, label?, values.",
                  },
                  {
                    name: "metric",
                    type: "string",
                    notes: "Which values[metric] to rank on.",
                  },
                  {
                    name: "variant",
                    type: '"bar" | "compact" | "table"',
                    default: '"bar"',
                    notes: "Tracks, text-only, or tabular.",
                  },
                ]}
              />
            </section>

            <section className="docs-section" id="wired">
              <p className="kicker">Wired widgets</p>
              <h2>Charts that query for you</h2>
              <p className="lede compact">
                Same drawings, fed by <code>useQuery</code>. Swap the connector; keep the variant.
              </p>
              <div className="variant-grid">
                <VariantCard
                  title="TimeseriesChart"
                  snippet={`<TimeseriesChart metric="visitors" variant="gradient" />`}
                >
                  <TimeseriesChart metric="visitors" variant="gradient" span={1} />
                </VariantCard>
                <VariantCard
                  title='BreakdownWidget variant="bars"'
                  snippet={`<BreakdownWidget dimension="browser" variant="bars" />`}
                >
                  <BreakdownWidget dimension="browser" variant="bars" />
                </VariantCard>
                <VariantCard
                  title='BreakdownWidget variant="donut"'
                  snippet={`<BreakdownWidget dimension="device" variant="donut" />`}
                >
                  <BreakdownWidget dimension="device" variant="donut" />
                </VariantCard>
                <VariantCard
                  title='BreakdownWidget variant="table"'
                  snippet={`<BreakdownWidget dimension="os" variant="table" />`}
                >
                  <BreakdownWidget dimension="os" variant="table" />
                </VariantCard>
              </div>
              <h3 className="docs-subhead">TimeseriesChart</h3>
              <PropsTable
                rows={[
                  {
                    name: "metric",
                    type: "MetricId",
                    default: '"visitors"',
                    notes: "Series to plot.",
                  },
                  {
                    name: "variant",
                    type: "AreaChartVariant",
                    default: '"gradient"',
                    notes: "Passed through to AreaChart.",
                  },
                  {
                    name: "title",
                    type: "string",
                    notes: "Widget heading.",
                  },
                  {
                    name: "range",
                    type: "DateRangeInput",
                    notes: "Overrides provider range.",
                  },
                  {
                    name: "span",
                    type: "number",
                    default: "3",
                    notes: "Dashboard grid span.",
                  },
                ]}
              />
              <h3 className="docs-subhead">BreakdownWidget</h3>
              <PropsTable
                rows={[
                  {
                    name: "dimension",
                    type: "DimensionId",
                    notes: "Required. path, browser, device, …",
                  },
                  {
                    name: "metric",
                    type: "MetricId",
                    default: '"visitors"',
                    notes: "Value on each row.",
                  },
                  {
                    name: "variant",
                    type: '"list" | "bars" | "donut" | "table" | "compact"',
                    default: '"list"',
                    notes: "RankedList, BarChart, PieChart, or table.",
                  },
                  {
                    name: "title",
                    type: "string",
                    notes: "Overrides the dimension label.",
                  },
                  {
                    name: "limit",
                    type: "number",
                    default: "8",
                    notes: "Breakdown row cap.",
                  },
                  {
                    name: "range",
                    type: "DateRangeInput",
                    notes: "Overrides provider range.",
                  },
                  {
                    name: "span",
                    type: "number",
                    notes: "Dashboard grid span.",
                  },
                ]}
              />
            </section>

            <section className="docs-section" id="dashboard">
              <p className="kicker">Dashboard</p>
              <h2>The catalog, laid out</h2>
              <p className="lede compact">
                <code>catalogDashboard</code> is every built-in widget. This preview uses the mock
                connector with the <code>full</code> capability profile.
              </p>
              <div className="dashboard-frame">
                <Dashboard widgets={catalogDashboard} showRange columns={4} />
              </div>
              <PropsTable
                rows={[
                  {
                    name: "widgets",
                    type: "DashboardItem[]",
                    default: "defaultDashboard",
                    notes: "{ widget: string, span?: number, props?: Record<string, unknown> }.",
                  },
                  {
                    name: "columns",
                    type: "number",
                    default: "4",
                    notes: "CSS grid columns.",
                  },
                  {
                    name: "showRange",
                    type: "boolean",
                    default: "true",
                    notes: "Range preset toolbar.",
                  },
                ]}
              />
            </section>
          </>
        )}
      </CatalogData>
    </AnalyticsProvider>
  );
}

export function ComponentsPage() {
  const { theme } = useSite();

  useEffect(() => {
    document.title = "Components — Analytics Kit";
  }, []);

  return (
    <>
      <header className="page-head">
        <p className="kicker">Components</p>
        <h1>
          Every chart.
          <em> Every variant.</em>
        </h1>
        <p className="lede compact">
          Visual <code>variant</code>s change the drawing. Colors inherit from{" "}
          <code>--chart-1</code>…<code>--chart-5</code> on this page. Setup and the query model live
          in the <Link to="/docs">docs</Link>.
        </p>
      </header>

      <div className="docs-layout">
        <aside className="docs-toc" aria-label="On this page">
          {TOC.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </aside>

        <div className="docs-body">
          <section className="docs-section" id="config">
            <p className="kicker">Config</p>
            <h2>Shared chart options</h2>
            <p className="lede compact">
              Area, line, and bar take the same data shape and an optional <code>config</code> map
              for labels and colors.
            </p>
            <pre className="snippet">
              <code>{`<AreaChart
  data={[{ date: "Mon", value: 420 }]}
  dataKey="value"
  labelKey="date"
  variant="gradient"
  config={{ value: { label: "Visitors", color: "var(--chart-1)" } }}
  className="h-[220px]"
/>`}</code>
            </pre>
            <PropsTable rows={SHARED_CHART_PROPS} />
            <h3 className="docs-subhead">CSS variables</h3>
            <p className="lede compact">
              Set these on <code>:root</code> (or any parent). The kit maps them onto{" "}
              <code>--ak-chart-*</code>, <code>--ak-surface</code>, and <code>--ak-text</code>.
            </p>
            <PropsTable
              columns={["Variable", "Maps to", "Default", "Notes"]}
              rows={[
                {
                  name: "--chart-1 … --chart-5",
                  type: "--ak-chart-*",
                  notes: "Series and slice colors. This landing sets stone-paper blues and greens.",
                },
                {
                  name: "--card",
                  type: "--ak-surface",
                  notes: "Widget background.",
                },
                {
                  name: "--foreground",
                  type: "--ak-text",
                  notes: "Primary text.",
                },
                {
                  name: "--muted-foreground",
                  type: "--ak-muted",
                  notes: "Secondary text.",
                },
                {
                  name: "--border",
                  type: "--ak-border",
                  notes: "Hairlines on cards and tooltips.",
                },
                {
                  name: "--primary",
                  type: "--ak-accent",
                  notes: "Accent, used if --chart-1 is missing.",
                },
              ]}
            />
          </section>

          <LiveCatalog theme={theme} />
        </div>
      </div>
    </>
  );
}
