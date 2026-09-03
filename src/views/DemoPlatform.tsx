"use client";

/**
 * What a product built on the kit looks like: its own shell, its own
 * navigation, and a connector switcher on top. The switcher is the point —
 * every section below is the same widget list, and changing the provider
 * changes which widgets can answer, not the layout.
 */

import { useMemo, useState } from "react";
import {
  RiBarChartBoxLine,
  RiCompass3Line,
  RiExternalLinkLine,
  RiGroupLine,
  RiPulseLine,
  RiShareForwardLine,
} from "@remixicon/react";
import Link from "next/link";
import {
  ANALYTICS_KIT_DATASET,
  createMockConnector,
  type ProviderProfile,
} from "@analytics-kit/connector-mock";
import {
  createHttpConnector,
  DATE_RANGE_PRESETS,
  withSampleFallback,
  type DateRangePreset,
} from "@analytics-kit/core";
import {
  AnalyticsProvider,
  Dashboard,
  useCapabilities,
  type DashboardItem,
} from "@analytics-kit/react";
import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";
import * as StatusBadge from "@/components/ui/status-badge";
import { ProviderMark } from "@/site/ProviderMark";
import { useSite } from "@/site/theme";
import { cn } from "@/utils/cn";

type SectionId = "overview" | "traffic" | "sources" | "audience" | "realtime";

const SECTIONS: {
  id: SectionId;
  label: string;
  icon: typeof RiCompass3Line;
  title: string;
  blurb: string;
  widgets: DashboardItem[];
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: RiCompass3Line,
    title: "Overview",
    blurb: "The numbers a stakeholder asks for first.",
    widgets: [
      { widget: "visitors" },
      { widget: "pageviews" },
      { widget: "visits" },
      { widget: "bounce-rate" },
      { widget: "timeseries", span: 4, props: { metric: "visitors" } },
      { widget: "top-pages", span: 2 },
      { widget: "devices" },
      { widget: "top-countries" },
    ],
  },
  {
    id: "traffic",
    label: "Traffic",
    icon: RiBarChartBoxLine,
    title: "Traffic",
    blurb: "Volume over time and the pages behind it.",
    widgets: [
      { widget: "pageviews" },
      { widget: "visits" },
      { widget: "views-per-visit" },
      { widget: "duration" },
      { widget: "timeseries", span: 4, props: { metric: "pageviews" } },
      { widget: "pages-table", span: 4 },
      { widget: "tracker", span: 4 },
    ],
  },
  {
    id: "sources",
    label: "Sources",
    icon: RiShareForwardLine,
    title: "Sources",
    blurb: "Where the visits come from — and where a provider runs out of answers.",
    widgets: [
      { widget: "visitors", span: 2 },
      { widget: "visits", span: 2 },
      { widget: "top-referrers", span: 2 },
      { widget: "top-sources", span: 2 },
      { widget: "top-campaigns", span: 2 },
      { widget: "top-events", span: 2 },
    ],
  },
  {
    id: "audience",
    label: "Audience",
    icon: RiGroupLine,
    title: "Audience",
    blurb: "Who is reading, by device and geography.",
    widgets: [
      { widget: "top-countries", span: 2 },
      { widget: "devices", span: 2 },
      { widget: "top-browsers", span: 2 },
      { widget: "top-os", span: 2 },
    ],
  },
  {
    id: "realtime",
    label: "Realtime",
    icon: RiPulseLine,
    title: "Realtime",
    blurb: "Live visitors, when the provider streams them.",
    widgets: [
      { widget: "realtime", span: 2 },
      { widget: "visitors", span: 2 },
      { widget: "top-pages", span: 4 },
    ],
  },
];

const PROVIDERS: { id: "live" | ProviderProfile; label: string; note: string }[] = [
  {
    id: "live",
    label: "Live · Vercel",
    note: "This site's own Web Analytics, through /api/analytics",
  },
  { id: "vercel", label: "Vercel", note: "No bounce rate, duration, events, UTM or realtime" },
  { id: "plausible", label: "Plausible", note: "Full metric and dimension coverage" },
  { id: "ga4", label: "GA4", note: "Full metric and dimension coverage" },
  { id: "umami", label: "Umami", note: "No campaign or medium breakdowns" },
  { id: "posthog", label: "PostHog", note: "Bounce rate and duration via HogQL" },
];

const RANGES: DateRangePreset[] = DATE_RANGE_PRESETS.filter((preset) =>
  ["24h", "7d", "30d", "90d"].includes(preset),
) as DateRangePreset[];

/** Reads the active connector's own declaration rather than a hardcoded table. */
function CapabilityStrip() {
  const capabilities = useCapabilities();
  const metrics = Object.entries(capabilities.metrics ?? {});
  const dimensions = Object.entries(capabilities.dimensions ?? {});

  return (
    <div className="border-stroke-soft-200 bg-bg-weak-25 mt-5 rounded-2xl border p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-subheading-2xs text-text-soft-400 uppercase">
          What this connector declares
        </p>
        <StatusBadge.Root
          variant="light"
          className="text-label-xs bg-bg-white-0 h-6 rounded-[7px] px-2 capitalize has-[>.dot]:gap-1"
        >
          <StatusBadge.Dot
            className={cn(
              "mx-0 size-3.5 before:size-1.5",
              capabilities.realtime ? "text-success-base" : "text-text-soft-400",
            )}
          />
          {capabilities.realtime ? "realtime" : "no realtime"}
        </StatusBadge.Root>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Metrics", entries: metrics },
          { label: "Dimensions", entries: dimensions },
        ].map((group) => (
          <div key={group.label}>
            <p className="text-label-xs text-text-soft-400 mb-2">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.entries.map(([name, supported]) => (
                <Badge.Root
                  key={name}
                  variant="lighter"
                  className={cn(
                    "rounded-lg px-2 font-mono text-[11px] normal-case",
                    supported
                      ? "bg-bg-white-0 text-text-sub-600"
                      : "bg-bg-weak-50 text-text-disabled-300 line-through",
                  )}
                >
                  {name}
                </Badge.Root>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-label-xs text-text-soft-400 mt-4">
        Struck-through names are the ones this provider cannot answer. The widgets above read the
        same declaration.
      </p>
    </div>
  );
}

export function DemoPlatform() {
  const { theme } = useSite();
  const [section, setSection] = useState<SectionId>("overview");
  const [provider, setProvider] = useState<"live" | ProviderProfile>("live");
  const [range, setRange] = useState<DateRangePreset>("7d");

  const connector = useMemo(() => {
    if (provider === "live") {
      // Same arrangement the landing used: real data when the server has a
      // token, a labelled sample profile when it does not, so the demo is never
      // broken and never pretends.
      const live = createHttpConnector({ endpoint: "/api/analytics" });
      const sample = createMockConnector({
        profile: "full",
        seed: 21,
        scale: 2.4,
        dataset: ANALYTICS_KIT_DATASET,
        siteName: "analytics-kit-demo.vercel.app",
      });
      return withSampleFallback({ connector: live, sample });
    }
    return createMockConnector({
      profile: provider,
      seed: 21,
      scale: 2.4,
      dataset: ANALYTICS_KIT_DATASET,
      siteName: PROVIDERS.find((item) => item.id === provider)?.label ?? provider,
    });
  }, [provider]);

  const active = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];
  const activeProvider = PROVIDERS.find((item) => item.id === provider);

  return (
    <div className="mx-auto w-full max-w-[1720px] px-6 pb-16 lg:px-8 lg:pb-24">
      <header className="pt-10 lg:pt-14">
        <Badge.Root
          variant="lighter"
          className="bg-bg-weak-50 text-text-sub-600 text-label-sm mb-3 h-7 w-fit rounded-[9px] px-2.5 normal-case"
        >
          Demo
        </Badge.Root>
        <h1 className="text-title-h4 lg:text-title-h3 text-text-strong-950 max-w-[24ch] !font-[550]">
          An analytics platform, built with the kit
        </h1>
        <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 mt-3 max-w-[72ch]">
          Every panel below is a widget from <code className="font-mono">@analytics-kit/react</code>
          , wired through one <code className="font-mono">AnalyticsProvider</code>. Switch the
          provider in the top right: the layout never changes, but the widgets a provider cannot
          answer step aside on their own.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button.Root
            variant="neutral"
            mode="stroke"
            asChild
            className="rounded-10 cursor-pointer"
          >
            <Link href="/docs#provider">
              How the provider is wired
              <Button.Icon as={RiExternalLinkLine} />
            </Link>
          </Button.Root>
          <Button.Root variant="neutral" mode="ghost" asChild className="rounded-10 cursor-pointer">
            <Link href="/components">Browse the components</Link>
          </Button.Root>
        </div>
      </header>

      {/* The framed shell reads as a product rather than as more of this site. */}
      <div className="border-stroke-soft-200 bg-bg-white-0 shadow-regular-md mt-8 overflow-hidden rounded-3xl border">
        <div className="flex flex-col lg:flex-row">
          <aside className="border-stroke-soft-200 bg-bg-weak-25 shrink-0 border-b p-4 lg:w-[220px] lg:border-r lg:border-b-0 lg:p-5">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="bg-primary-base text-static-white text-label-xs flex size-8 shrink-0 items-center justify-center rounded-xl">
                AK
              </span>
              <div className="min-w-0">
                <p className="text-label-sm text-text-strong-950 truncate">Acme Analytics</p>
                <p className="text-label-xs text-text-soft-400 truncate">acme.com</p>
              </div>
            </div>
            <nav
              className="no-scrollbar flex gap-1 overflow-x-auto lg:grid lg:gap-px"
              aria-label="Demo sections"
            >
              {SECTIONS.map((item) => {
                const current = item.id === section;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={current ? "page" : undefined}
                    onClick={() => setSection(item.id)}
                    className={cn(
                      "text-label-sm rounded-10 flex shrink-0 cursor-pointer items-center gap-2 px-2.5 py-2 text-left transition-colors",
                      current
                        ? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs"
                        : "text-text-sub-600 hover:text-text-strong-950",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4.5",
                        current ? "text-primary-base" : "text-text-soft-400",
                      )}
                    />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <p className="text-label-xs text-text-soft-400 mt-6 hidden lg:block">
              Sections are the same widget registry, arranged differently.
            </p>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="border-stroke-soft-200 flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
              <div className="min-w-0">
                <p className="text-label-md text-text-strong-950">{active?.title}</p>
                <p className="text-label-xs text-text-soft-400 mt-0.5">{active?.blurb}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="border-stroke-soft-200 bg-bg-weak-25 flex rounded-xl border p-0.5">
                  {RANGES.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRange(preset)}
                      className={cn(
                        "text-label-xs rounded-10 cursor-pointer px-2.5 py-1.5 transition-colors",
                        range === preset
                          ? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs"
                          : "text-text-sub-600 hover:text-text-strong-950",
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <label className="min-w-0">
                  <span className="sr-only">Connector</span>
                  <select
                    value={provider}
                    onChange={(event) =>
                      setProvider(event.target.value as "live" | ProviderProfile)
                    }
                    className="border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 text-label-sm rounded-xl border px-3 py-2"
                  >
                    {PROVIDERS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="min-w-0 overflow-x-auto p-4 lg:p-5">
              {activeProvider ? (
                <p className="text-text-soft-400 mb-4 flex items-center gap-2">
                  <ProviderMark
                    id={provider === "live" ? "vercel" : provider}
                    className="size-4 shrink-0"
                  />
                  <span className="text-label-xs">{activeProvider.note}</span>
                </p>
              ) : null}
              <AnalyticsProvider
                // Remounting on provider change drops the previous connector's
                // cache, so a switch shows that provider's answer rather than
                // the last one's.
                key={provider}
                connector={connector}
                theme={theme}
                range={range}
              >
                <Dashboard widgets={active?.widgets ?? []} columns={4} showRange={false} />
                <CapabilityStrip />
              </AnalyticsProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
