"use client";

/**
 * Adapted from AlignUI Pro "Hero 02". The upstream block cross-fades a static
 * screenshot per tab; here each tab makes a claim about the kit and gets a
 * visual that argues it (see HeroVisuals).
 */

import { useState } from "react";
import {
  RiArrowRightUpLongLine,
  RiKey2Line,
  RiPlugLine,
  RiShapesLine,
  RiStackLine,
} from "@remixicon/react";
import Link from "next/link";
import type { AnalyticsTheme } from "@wingtics/react";
import { HeroVisual } from "@/blocks/HeroVisuals";
import { ProviderMark } from "@/site/ProviderMark";
import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";
import { cn } from "@/utils/cn";

const tabs = [
  {
    id: "connectors",
    icon: RiPlugLine,
    title: "Five connectors",
    description: "Vercel, Plausible, GA4, Umami, PostHog",
  },
  {
    id: "query",
    icon: RiStackLine,
    title: "One query model",
    description: "Metrics and dimensions, not vendor fields",
  },
  {
    id: "capabilities",
    icon: RiShapesLine,
    title: "Capability-aware",
    description: "Widgets sit out what a vendor cannot answer",
  },
  {
    id: "keys",
    icon: RiKey2Line,
    title: "Server-side keys",
    description: "The browser only talks to your endpoint",
  },
];

// "Mock" has no vendor mark — it is ours — so it keeps its name in the row.
const CONNECTORS = [
  { id: "vercel", label: "Vercel" },
  { id: "plausible", label: "Plausible" },
  { id: "ga4", label: "GA4" },
  { id: "umami", label: "Umami" },
  { id: "posthog", label: "PostHog" },
  { id: "mock", label: "Mock" },
];

export function Hero({ theme }: { theme: AnalyticsTheme }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div className="bg-bg-white-0 w-full">
      <div className="mx-auto mt-8 flex max-w-7xl flex-col px-4 lg:mt-14 lg:px-7">
        <div className="flex flex-col px-2 md:items-center lg:px-0">
          <div className="rounded-10 bg-bg-weak-50 mb-3 flex w-fit items-center gap-2 py-1 pr-[9px] pl-1.5">
            <Badge.Root
              variant="lighter"
              color="gray"
              className="bg-bg-white-0 text-text-sub-600 shadow-complex-10 rounded-[5px] px-1.25 font-semibold"
            >
              MIT
            </Badge.Root>
            <span className="text-label-sm text-text-sub-600">
              Analytics, without the vendor lock-in
            </span>
          </div>

          <h1 className="text-title-h4 lg:text-title-h4 xl:text-title-h3 2xl:text-title-h1 text-text-strong-950 mb-4 max-w-[780px] !font-[550] md:text-center">
            One dashboard. Any analytics tool.
          </h1>
          <p className="text-paragraph-md text-text-sub-600 max-w-[560px] md:text-center">
            One query model. Five connectors. Widgets that render Vercel today and{" "}
            <span className="text-label-md">Plausible</span> tomorrow — without rewriting the page.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row md:mt-7">
            <Button.Root asChild className="w-full cursor-pointer gap-2 rounded-[12px] sm:w-auto">
              <Link href="/demo">
                See the demo platform
                <Button.Icon
                  as={RiArrowRightUpLongLine}
                  className="text-static-white/[0.64] size-5"
                />
              </Link>
            </Button.Root>

            <Button.Root
              variant="neutral"
              mode="stroke"
              size="medium"
              asChild
              className="w-full cursor-pointer rounded-[12px] sm:w-auto"
            >
              <Link href="/docs">Read the docs</Link>
            </Button.Root>
          </div>
        </div>

        <div className="mt-8 flex flex-col lg:mt-14">
          <div
            className="border-stroke-soft-200 relative flex flex-col border-t px-2 lg:flex-row lg:px-0"
            role="tablist"
            aria-label="What the kit does"
          >
            <div
              className="bg-primary-base absolute -top-0.25 left-0 hidden h-0.25 transition-all duration-300 ease-out lg:block"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />

            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const isFirst = index === 0;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group border-stroke-soft-200 relative flex flex-1 cursor-pointer items-center border-b py-5 text-left transition-all duration-300 lg:border-b-0 lg:py-8",
                    index === tabs.length - 1 && "border-b-0",
                  )}
                >
                  <div
                    className={cn(
                      "bg-primary-base absolute -top-0.25 -left-6 h-0.25 w-[calc(100%+48px)] transition-all duration-300 lg:hidden",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div
                    className={cn(
                      "border-l-stroke-soft-200 flex w-full items-center gap-3.5 transition-all duration-300 lg:gap-2 xl:gap-3.5",
                      !isFirst && "lg:border-l lg:pl-3 xl:pl-7",
                    )}
                  >
                    <div
                      className={cn(
                        "bg-bg-white-0 flex items-center justify-center rounded-xl p-2 transition-all duration-300 lg:p-1.5 xl:p-2",
                        isActive
                          ? "border-primary-base border"
                          : "border-stroke-soft-200 group-hover:border-text-soft-400 border",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5 transition-colors duration-300 lg:size-4 xl:size-5",
                          isActive
                            ? "text-primary-base"
                            : "text-text-soft-400 group-hover:text-text-sub-600",
                        )}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span
                        className={cn(
                          "text-label-sm flex transition-colors duration-300",
                          isActive
                            ? "text-text-strong-950"
                            : "text-text-sub-600 group-hover:text-text-strong-950",
                        )}
                      >
                        {tab.title}
                      </span>
                      <span className="text-label-xs text-text-soft-400">{tab.description}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Like the upstream block, the visual belongs to the tab: each panel
              argues that tab's claim rather than repeating one dashboard. The
              min-height keeps the cross-fade from jumping the page. */}
          <div className="bg-bg-weak-25 relative mt-6 overflow-hidden rounded-[32px] p-4 md:rounded-[40px] md:p-8 lg:p-10">
            <div className="relative min-h-[360px] md:min-h-[300px]">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  aria-hidden={activeTab !== tab.id}
                  className={cn(
                    "top-0 w-full transition-opacity duration-500",
                    activeTab === tab.id
                      ? "relative opacity-100"
                      : "pointer-events-none absolute opacity-0",
                  )}
                >
                  <HeroVisual tab={tab.id} theme={theme} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="no-scrollbar -ml-4 flex w-[calc(100%+32px)] items-center overflow-x-auto lg:mx-0 lg:w-full lg:overflow-visible">
          {CONNECTORS.map((item) => (
            <div
              key={item.id}
              className="text-text-soft-400 flex shrink-0 items-center justify-center gap-2 px-5 py-5 lg:w-full lg:shrink lg:px-0 lg:py-7"
              title={item.label}
            >
              <ProviderMark id={item.id} className="size-5 shrink-0" />
              <span className="text-label-md">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
