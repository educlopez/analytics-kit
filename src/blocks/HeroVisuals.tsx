"use client";

/**
 * One visual per hero tab. Each panel argues the claim its tab makes, so the
 * hero stops showing the same dashboard under four different headlines.
 *
 * The connector and capability panels run real providers on mock profiles
 * rather than mocking up the result: the "unsupported" state below is the one
 * the widget actually renders when a connector cannot answer a metric.
 */

import { useMemo, useRef, useState } from "react";
import {
  RiArrowRightLine,
  RiCheckLine,
  RiCodeSSlashLine,
  RiGlobalLine,
  RiKey2Line,
  RiLock2Line,
  RiServerLine,
} from "@remixicon/react";
import {
  createMockConnector,
  PROVIDER_PROFILES,
  type ProviderProfile,
} from "@wingtics/connector-mock";
import {
  AnalyticsProvider,
  AreaChart,
  MetricCard,
  useQuery,
  type AnalyticsTheme,
} from "@wingtics/react";
import * as Badge from "@/components/ui/badge";
import { ProviderMark } from "@/site/ProviderMark";
import { cn } from "@/utils/cn";

// A seed per provider so picking one visibly changes the data: they are
// different sources, not the same numbers relabelled.
const CONNECTORS: { id: ProviderProfile; label: string; ctor: string; seed: number }[] = [
  { id: "vercel", label: "Vercel", ctor: "createVercelConnector", seed: 7 },
  { id: "plausible", label: "Plausible", ctor: "createPlausibleConnector", seed: 23 },
  { id: "ga4", label: "GA4", ctor: "createGa4Connector", seed: 41 },
  { id: "umami", label: "Umami", ctor: "createUmamiConnector", seed: 58 },
  { id: "posthog", label: "PostHog", ctor: "createPostHogConnector", seed: 72 },
];

/** The metric names a provider's profile declares it cannot answer. */
function unsupportedMetrics(profile: ProviderProfile): string[] {
  const metrics = PROVIDER_PROFILES[profile]?.metrics ?? {};
  return Object.entries(metrics)
    .filter(([, supported]) => !supported)
    .map(([name]) => name);
}

function ProviderSeries() {
  const series = useQuery({ metrics: ["visitors"], granularity: "day" });
  const data = (series.data?.series ?? []).map((point) => ({
    date: point.date,
    value: point.values.visitors ?? 0,
  }));
  return <AreaChart data={data} variant="gradient" />;
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-bg-white-0 border-stroke-soft-200 shadow-regular-xs h-full rounded-2xl border p-5 md:rounded-3xl md:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-subheading-2xs text-text-soft-400 mb-4 uppercase">{children}</p>;
}

/* --------------------------------------------------------- five connectors */

function ConnectorsVisual({ theme }: { theme: AnalyticsTheme }) {
  const [active, setActive] = useState<ProviderProfile>("vercel");
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = CONNECTORS.find((item) => item.id === active) ?? CONNECTORS[0]!;
  const connector = useMemo(
    () =>
      createMockConnector({
        profile: current.id,
        seed: current.seed,
        siteName: current.label,
      }),
    [current.id, current.seed, current.label],
  );
  const missing = unsupportedMetrics(current.id);

  // A radiogroup owes arrow keys; Tab reaches the group, arrows move inside it.
  function onKeyDown(event: React.KeyboardEvent) {
    const index = CONNECTORS.findIndex((item) => item.id === active);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = index + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = CONNECTORS.length - 1;
    else return;
    event.preventDefault();
    const clamped = (next + CONNECTORS.length) % CONNECTORS.length;
    setActive(CONNECTORS[clamped]!.id);
    buttons.current[clamped]?.focus();
  }

  return (
    <Panel className="p-3 md:p-4">
      {/* Two separate cards rather than two columns of one: the constructor
          names used to run straight into the plot area with no gutter. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="border-stroke-soft-200 bg-bg-weak-25 rounded-xl border p-4 md:rounded-2xl">
          <PanelLabel>Pick a connector</PanelLabel>
          <div
            role="radiogroup"
            aria-label="Connector"
            onKeyDown={onKeyDown}
            className="grid gap-1"
          >
            {CONNECTORS.map((item, index) => {
              const selected = item.id === active;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    buttons.current[index] = node;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs"
                      : "text-text-sub-600 hover:bg-bg-white-0/60 hover:text-text-strong-950",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                      selected ? "border-primary-base bg-primary-base" : "border-stroke-sub-300",
                    )}
                  >
                    {selected ? <RiCheckLine className="text-static-white size-3" /> : null}
                  </span>
                  <ProviderMark id={item.id} className="size-4 shrink-0" />
                  <span className="text-label-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-stroke-soft-200 bg-bg-white-0 flex min-w-0 flex-col rounded-xl border p-4 md:rounded-2xl">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <PanelLabel>Visitors · same widget</PanelLabel>
            <code className="text-text-sub-600 font-mono text-[11px]">{current.ctor}()</code>
          </div>
          <AnalyticsProvider
            // Remount per provider so the chart shows that connector's answer
            // rather than the previous one's cached series.
            key={current.id}
            connector={connector}
            theme={theme}
            range="30d"
          >
            <ProviderSeries />
          </AnalyticsProvider>
          {/* Always two clauses: a caption that grows and shrinks between
              providers would nudge the whole hero on every click. */}
          <p className="text-label-sm text-text-soft-400 mt-4">
            One constructor changes. The widget, the query and the markup do not.{" "}
            {missing.length ? (
              <>
                {current.label} cannot answer{" "}
                <span className="text-text-sub-600 font-mono text-[12px]">
                  {missing.join(", ")}
                </span>
                , so those widgets sit out.
              </>
            ) : (
              <>{current.label} answers every metric in the model, so nothing sits out.</>
            )}
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------- one query model */

const METRICS = ["visitors", "pageviews", "visits", "bounceRate", "avgDuration", "events"];
const DIMENSIONS = ["path", "referrer", "country", "device", "browser", "os", "source"];

function QueryVisual() {
  return (
    <Panel>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col">
          <PanelLabel>What the widget sends</PanelLabel>
          <pre className="border-stroke-soft-200 bg-bg-weak-25 no-scrollbar min-w-0 overflow-x-auto rounded-xl border p-4 font-mono text-[12px] leading-relaxed">
            <code className="text-text-sub-600">
              {`connector.query({
  `}
              <span className="text-text-strong-950">range</span>
              {`: "7d",
  `}
              <span className="text-text-strong-950">metrics</span>
              {`: ["visitors"],
  `}
              <span className="text-text-strong-950">dimensions</span>
              {`: ["path"],
  `}
              <span className="text-text-strong-950">granularity</span>
              {`: "day",
})`}
            </code>
          </pre>
          <p className="text-label-sm text-text-soft-400 mt-4">
            Canonical names, never vendor field names. The connector maps them.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <PanelLabel>Metrics</PanelLabel>
            <div className="flex flex-wrap gap-1.5">
              {METRICS.map((metric) => (
                <Badge.Root
                  key={metric}
                  variant="lighter"
                  className="bg-bg-weak-50 text-text-sub-600 rounded-lg px-2 font-mono text-[11px] normal-case"
                >
                  {metric}
                </Badge.Root>
              ))}
            </div>
          </div>
          <div>
            <PanelLabel>Dimensions</PanelLabel>
            <div className="flex flex-wrap gap-1.5">
              {DIMENSIONS.map((dimension) => (
                <Badge.Root
                  key={dimension}
                  variant="lighter"
                  className="bg-bg-weak-50 text-text-sub-600 rounded-lg px-2 font-mono text-[11px] normal-case"
                >
                  {dimension}
                </Badge.Root>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ----------------------------------------------------------- capabilities */

function CapabilitiesVisual({ theme }: { theme: AnalyticsTheme }) {
  // The Vercel profile mirrors the real connector's limits: no bounce rate, no
  // average duration. The second card below is the widget's own reaction.
  const connector = useMemo(
    () => createMockConnector({ profile: "vercel", seed: 21, siteName: "Vercel" }),
    [],
  );

  return (
    <Panel>
      <PanelLabel>Connector: Vercel Web Analytics</PanelLabel>
      <AnalyticsProvider connector={connector} theme={theme} range="7d">
        <div className="ak-dashboard">
          <div className="ak-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            {/* Straight under the page h1, so h3 would skip a level. The
                cards are illustration here, but the outline is still real. */}
            <MetricCard metric="visitors" headingLevel={2} />
            <MetricCard metric="bounceRate" headingLevel={2} />
          </div>
        </div>
      </AnalyticsProvider>
      <p className="text-label-sm text-text-soft-400 mt-5">
        Vercel has no bounce rate. The widget declares it missing and sits out — the page keeps
        rendering instead of throwing.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------ server keys */

function KeysVisual() {
  const nodes = [
    {
      id: "browser",
      icon: RiGlobalLine,
      title: "Browser",
      body: "createHttpConnector",
      note: "No token in the bundle",
      tone: "text-text-soft-400",
    },
    {
      id: "route",
      icon: RiServerLine,
      title: "Your route",
      body: "/api/analytics",
      note: "Holds the token",
      tone: "text-primary-base",
    },
    {
      id: "vendor",
      icon: RiCodeSSlashLine,
      title: "Vendor API",
      body: "Vercel · Plausible · GA4",
      note: "Authenticated server-side",
      tone: "text-text-soft-400",
    },
  ];

  return (
    <Panel>
      <PanelLabel>Where the key lives</PanelLabel>
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {nodes.map((node, index) => (
          <div key={node.id} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="border-stroke-soft-200 bg-bg-weak-25 min-w-0 flex-1 rounded-2xl border p-4">
              <div className="mb-3 flex items-center gap-2">
                <node.icon className={cn("size-5", node.tone)} />
                <span className="text-label-sm text-text-strong-950">{node.title}</span>
                {node.id === "route" ? (
                  <RiKey2Line className="text-primary-base ml-auto size-4" />
                ) : (
                  <RiLock2Line className="text-text-soft-400 ml-auto size-4 opacity-40" />
                )}
              </div>
              <code className="text-text-sub-600 block font-mono text-[11px] break-all">
                {node.body}
              </code>
              <p className="text-label-xs text-text-soft-400 mt-2">{node.note}</p>
            </div>
            {index < nodes.length - 1 ? (
              <RiArrowRightLine className="text-text-soft-400 hidden size-5 shrink-0 lg:block" />
            ) : null}
          </div>
        ))}
      </div>
      <p className="text-label-sm text-text-soft-400 mt-5">
        The browser only ever talks to your endpoint. Swap{" "}
        <code className="font-mono text-[12px]">@wingtics/next</code> in and the handler is three
        lines.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ export */

export function HeroVisual({ tab, theme }: { tab: string; theme: AnalyticsTheme }) {
  if (tab === "query") return <QueryVisual />;
  if (tab === "capabilities") return <CapabilitiesVisual theme={theme} />;
  if (tab === "keys") return <KeysVisual />;
  return <ConnectorsVisual theme={theme} />;
}
