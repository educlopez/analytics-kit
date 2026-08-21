import { useMemo, useState } from "react";
import { createMockConnector, type ProviderProfile } from "@analytics-kit/connector-mock";
import {
  AnalyticsProvider,
  Dashboard,
  defineWidget,
  RankedList,
  WidgetFrame,
  useQuery,
} from "@analytics-kit/react";

const PROFILES: Array<{ id: ProviderProfile; label: string; blurb: string }> = [
  { id: "plausible", label: "Plausible", blurb: "Privacy-first stats API" },
  { id: "vercel", label: "Vercel", blurb: "Pageviews, visitors, events" },
  { id: "ga4", label: "GA4", blurb: "Google Analytics Data API" },
  { id: "umami", label: "Umami", blurb: "Self-host or cloud" },
  { id: "posthog", label: "PostHog", blurb: "HogQL product analytics" },
];

const ViewsPerVisitCard = defineWidget({
  id: "views-per-visit",
  title: "Views per visit",
  required: { metrics: ["viewsPerVisit"] },
  component: function ViewsPerVisitCard({ span }: { span?: number }) {
    const { data, status, missing, error } = useQuery({
      metrics: ["viewsPerVisit"],
      includePrevious: true,
    });
    return (
      <WidgetFrame title="Views / visit" status={status} missing={missing} error={error} span={span}>
        <div className="ak-metric-value">{(data?.totals.viewsPerVisit ?? 0).toFixed(2)}</div>
      </WidgetFrame>
    );
  },
});

const EventsList = defineWidget({
  id: "events",
  title: "Events",
  required: { metrics: ["events"], dimensions: ["eventName"] },
  component: function EventsList({ span }: { span?: number }) {
    const { data, status, missing, error } = useQuery({
      metrics: ["events"],
      dimensions: ["eventName"],
      limit: 5,
    });
    return (
      <WidgetFrame title="Custom events" status={status} missing={missing} error={error} span={span}>
        <RankedList rows={data?.breakdown ?? []} metric="events" />
      </WidgetFrame>
    );
  },
});

export function App() {
  const [profile, setProfile] = useState<ProviderProfile>("plausible");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const connector = useMemo(() => createMockConnector({ profile, seed: 11 }), [profile]);

  return (
    <div className={`page ${theme}`}>
      <header className="hero">
        <div>
          <p className="kicker">Analytics Kit</p>
          <h1>One dashboard. Any analytics provider.</h1>
          <p className="lede">
            Swap Plausible, Vercel, GA4, Umami, or PostHog without rewriting widgets. This demo uses
            a mock connector with each provider&apos;s real capability profile.
          </p>
        </div>
        <div className="hero-actions">
          <label>
            Provider profile
            <select value={profile} onChange={(event) => setProfile(event.target.value as ProviderProfile)}>
              {PROFILES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Light" : "Dark"} theme
          </button>
        </div>
      </header>

      <p className="profile-note">
        {PROFILES.find((item) => item.id === profile)?.blurb}. Widgets that the provider cannot
        answer (for example bounce rate on Vercel) show an unsupported state instead of failing.
      </p>

      <AnalyticsProvider connector={connector} theme={theme} range="7d">
        <Dashboard
          widgets={[
            { widget: "visitors" },
            { widget: "pageviews" },
            { widget: "bounce-rate" },
            { widget: "realtime" },
            { widget: "timeseries", span: 3 },
            { widget: "top-pages", span: 2 },
            { widget: "devices" },
            { widget: "top-referrers" },
            { widget: "top-countries" },
            { widget: "views-per-visit" },
            { widget: "events", span: 2 },
          ]}
        />
      </AnalyticsProvider>

      <section className="docs">
        <article>
          <h2>Add a provider</h2>
          <pre>{`import { defineConnector } from "@analytics-kit/core";

export function createAcmeConnector(options) {
  return defineConnector({
    id: "acme",
    name: "Acme Analytics",
    capabilities: { metrics: { visitors: true, pageviews: true }, ... },
    async query(query) {
      const payload = await fetchAcme(options, query);
      return { totals: payload.totals, series: payload.series, breakdown: payload.breakdown };
    },
  });
}`}</pre>
        </article>
        <article>
          <h2>Add a widget</h2>
          <pre>{`import { defineWidget, WidgetFrame, useQuery } from "@analytics-kit/react";

export const ViewsPerVisit = defineWidget({
  id: "views-per-visit",
  title: "Views / visit",
  required: { metrics: ["viewsPerVisit"] },
  component: () => {
    const { data, status, missing } = useQuery({ metrics: ["viewsPerVisit"] });
    return (
      <WidgetFrame title="Views / visit" status={status} missing={missing}>
        {data?.totals.viewsPerVisit.toFixed(2)}
      </WidgetFrame>
    );
  },
});`}</pre>
        </article>
      </section>
    </div>
  );
}

void ViewsPerVisitCard;
void EventsList;
