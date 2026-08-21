import { useMemo } from "react";
import { createMockConnector } from "@analytics-kit/connector-mock";
import {
  AnalyticsProvider,
  AreaChart,
  PieChart,
  useQuery,
  type AnalyticsTheme,
} from "@analytics-kit/react";
import { Link } from "react-router-dom";

function TeaserCharts() {
  const series = useQuery({ metrics: ["visitors"], granularity: "day" });
  const browsers = useQuery({
    metrics: ["visitors"],
    dimensions: ["browser"],
    limit: 5,
  });
  const areaData = (series.data?.series ?? []).map((point) => ({
    date: point.date,
    value: point.values.visitors ?? 0,
  }));
  const pieData = (browsers.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    value: row.values.visitors ?? 0,
  }));

  return (
    <div className="gallery-grid">
      <article className="gallery-card">
        <header>
          <h3>Area · gradient</h3>
          <p>
            The default trend. Color comes from <code>--chart-1</code> on this page.
          </p>
        </header>
        <AreaChart data={areaData} variant="gradient" />
        <code>{`<AreaChart variant="gradient" />`}</code>
      </article>
      <article className="gallery-card">
        <header>
          <h3>Pie · donut</h3>
          <p>Share of a dimension. Same query, a different drawing.</p>
        </header>
        <PieChart data={pieData} variant="donut" />
        <code>{`<PieChart variant="donut" />`}</code>
      </article>
    </div>
  );
}

export function ChartTeaser({ theme }: { theme: AnalyticsTheme }) {
  const connector = useMemo(
    () => createMockConnector({ profile: "full", siteName: "Chart teaser", seed: 11 }),
    [],
  );

  return (
    <div>
      <AnalyticsProvider connector={connector} theme={theme} range="30d">
        <TeaserCharts />
      </AnalyticsProvider>
      <div className="teaser-actions">
        <Link className="btn btn-ink" to="/components">
          All components &amp; config
        </Link>
        <Link className="ghost" to="/docs">
          Read the docs
        </Link>
      </div>
    </div>
  );
}
