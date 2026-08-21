import { useMemo, useState } from "react";
import { createMockConnector } from "@analytics-kit/connector-mock";
import {
  AREA_CHART_VARIANTS,
  AnalyticsProvider,
  BAR_CHART_VARIANTS,
  LINE_CHART_VARIANTS,
  PIE_CHART_VARIANTS,
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  TimeseriesChart,
  BreakdownWidget,
  useQuery,
  type AnalyticsTheme,
  type AreaChartVariant,
  type BarChartVariant,
  type LineChartVariant,
  type PieChartVariant,
} from "@analytics-kit/react";

function VariantSwitch<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="style-switch" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? "is-active" : ""}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function LiveCharts({
  areaVariant,
  lineVariant,
  barVariant,
  pieVariant,
}: {
  areaVariant: AreaChartVariant;
  lineVariant: LineChartVariant;
  barVariant: BarChartVariant;
  pieVariant: PieChartVariant;
}) {
  const series = useQuery({ metrics: ["visitors"], granularity: "day" });
  const browsers = useQuery({
    metrics: ["visitors"],
    dimensions: ["browser"],
    limit: 6,
  });
  const areaData = (series.data?.series ?? []).map((point) => ({
    date: point.date,
    value: point.values.visitors ?? 0,
  }));
  const barData = (browsers.data?.breakdown ?? []).map((row) => ({
    label: row.label ?? row.key,
    value: row.values.visitors ?? 0,
  }));

  return (
    <div className="gallery-grid">
      <article className="gallery-card">
        <header>
          <h3>Area chart</h3>
          <p>Like shadcn / bklit area — filled trend. Colors come from your CSS variables.</p>
        </header>
        <AreaChart data={areaData} variant={areaVariant} />
        <code>{`<AreaChart variant="${areaVariant}" />`}</code>
      </article>
      <article className="gallery-card">
        <header>
          <h3>Line chart</h3>
          <p>Intent UI-style line: monotone, step, dashed, or dots.</p>
        </header>
        <LineChart data={areaData} variant={lineVariant} />
        <code>{`<LineChart variant="${lineVariant}" />`}</code>
      </article>
      <article className="gallery-card">
        <header>
          <h3>Bar chart</h3>
          <p>ReUI / shadcnblocks bars: vertical, horizontal, rounded, hatched.</p>
        </header>
        <BarChart data={barData} variant={barVariant} />
        <code>{`<BarChart variant="${barVariant}" />`}</code>
      </article>
      <article className="gallery-card">
        <header>
          <h3>Pie / donut</h3>
          <p>Share of a dimension. Same data, three shapes.</p>
        </header>
        <PieChart data={barData} variant={pieVariant} />
        <code>{`<PieChart variant="${pieVariant}" />`}</code>
      </article>
      <article className="gallery-card gallery-card-wide">
        <header>
          <h3>Wired to analytics</h3>
          <p>The same charts, fed by useQuery — swap the connector, keep the variant.</p>
        </header>
        <TimeseriesChart metric="visitors" variant={areaVariant} span={1} />
        <BreakdownWidget dimension="browser" variant="bars" />
      </article>
    </div>
  );
}

export function ChartGallery({ theme }: { theme: AnalyticsTheme }) {
  const connector = useMemo(
    () => createMockConnector({ profile: "full", siteName: "Chart gallery", seed: 11 }),
    [],
  );
  const [areaVariant, setAreaVariant] = useState<AreaChartVariant>("gradient");
  const [lineVariant, setLineVariant] = useState<LineChartVariant>("monotone");
  const [barVariant, setBarVariant] = useState<BarChartVariant>("rounded");
  const [pieVariant, setPieVariant] = useState<PieChartVariant>("donut");

  return (
    <div>
      <div className="gallery-switches">
        <VariantSwitch
          label="Area variants"
          value={areaVariant}
          options={AREA_CHART_VARIANTS}
          onChange={setAreaVariant}
        />
        <VariantSwitch
          label="Line variants"
          value={lineVariant}
          options={LINE_CHART_VARIANTS}
          onChange={setLineVariant}
        />
        <VariantSwitch
          label="Bar variants"
          value={barVariant}
          options={BAR_CHART_VARIANTS}
          onChange={setBarVariant}
        />
        <VariantSwitch
          label="Pie variants"
          value={pieVariant}
          options={PIE_CHART_VARIANTS}
          onChange={setPieVariant}
        />
      </div>
      <AnalyticsProvider connector={connector} theme={theme} range="30d">
        <LiveCharts
          areaVariant={areaVariant}
          lineVariant={lineVariant}
          barVariant={barVariant}
          pieVariant={pieVariant}
        />
      </AnalyticsProvider>
    </div>
  );
}
