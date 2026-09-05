"use client";

/** Adapted from AlignUI Pro "Stats & Metrics 01". */

import { RiPlugFill, RiRefreshLine, RiShapesFill } from "@remixicon/react";
import * as StatusBadge from "@/components/ui/status-badge";

export function Stats({ componentCount }: { componentCount: number }) {
  const statsData = [
    {
      id: "stat1",
      badgeText: "Leave a vendor without a rewrite",
      badgeIcon: RiRefreshLine,
      badgeBgClass: "bg-feature-lighter",
      badgeTextClass: "text-feature-dark",
      badgeIconClass: "text-feature-dark",
      value: "1",
      valueLabel: "Constructor change",
      description: "The provider swaps and the",
      descriptionSpan: "dashboard stays untouched",
      beforeBgClass: "before:bg-feature-base",
    },
    {
      id: "stat2",
      badgeText: "Shipped in the same release",
      badgeIcon: RiPlugFill,
      badgeBgClass: "bg-success-lighter",
      badgeTextClass: "text-success-dark",
      badgeIconClass: "text-success-dark",
      value: "5",
      valueLabel: "Connectors",
      description: "Vercel, Plausible, GA4, Umami",
      descriptionSpan: "and PostHog, plus a mock",
      beforeBgClass: "before:bg-success-base",
    },
    {
      id: "stat3",
      badgeText: "Every one with a live preview",
      badgeIcon: RiShapesFill,
      badgeBgClass: "bg-highlighted-lighter",
      badgeTextClass: "text-highlighted-dark",
      badgeIconClass: "text-highlighted-dark",
      value: String(componentCount),
      valueLabel: "Components",
      description: "Knobs, a code tab and the full",
      descriptionSpan: "props table on every page",
      beforeBgClass: "before:bg-highlighted-base",
    },
  ];

  return (
    <div className="bg-bg-weak-25 w-full py-10 lg:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 lg:gap-10 lg:px-7 xl:gap-12">
        <div className="flex flex-col">
          <StatusBadge.Root
            variant="light"
            className="text-label-sm text-text-sub-600 shadow-custom-input-2 bg-bg-white-0 mb-3 h-7 w-fit rounded-[9px] pr-2.5 pl-1.75 capitalize has-[>.dot]:gap-1 lg:mx-auto"
          >
            <StatusBadge.Dot className="text-primary-base mx-0 size-4 before:size-1.5" />
            Stats &amp; Metric
          </StatusBadge.Root>
          <h2 className="text-title-h4 lg:text-title-h3 xl:text-title-h2 text-text-strong-950 mb-4 !font-[550] lg:text-center">
            Built to outlive your analytics vendor
          </h2>
          <p className="text-paragraph-md text-text-sub-600 lg:text-center">
            The query model is the contract, so the widgets keep rendering{" "}
            <span className="text-label-md text-text-sub-600 lg:flex lg:justify-center">
              whichever provider is behind them.
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {statsData.map((stat) => (
            <div
              key={stat.id}
              className="border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs flex flex-1 flex-col rounded-[28px] border p-8 lg:rounded-[36px] lg:p-6 xl:p-8 2xl:p-10"
            >
              <StatusBadge.Root
                variant="light"
                // The badge is `whitespace-nowrap` at a fixed height by
                // default, and this copy is ~267px wide inside a 208px card at
                // a 320px viewport — enough to push the whole page sideways,
                // and by a margin small enough that it only showed up under
                // CI's font metrics. Below `sm` it may wrap and grow; from
                // `sm` up it is exactly what it was.
                className={`${stat.badgeBgClass} ${stat.badgeTextClass} text-label-sm lg:text-paragraph-sm xl:text-label-sm mb-6 h-auto min-h-7 max-w-full w-fit gap-1.5 rounded-[9px] px-2 py-0.5 whitespace-normal sm:h-7 sm:py-0 sm:whitespace-nowrap`}
              >
                <StatusBadge.Icon
                  as={stat.badgeIcon}
                  className={`size-4 ${stat.badgeIconClass} mx-0 before:size-4`}
                />
                {stat.badgeText}
              </StatusBadge.Root>
              <div className="mb-8 flex flex-col gap-1 lg:mb-12 lg:gap-2 2xl:mb-20">
                <div
                  className={`text-title-h3 lg:text-title-h1 text-text-strong-950 relative z-2 before:absolute before:top-0 before:-left-8.25 before:h-full before:w-0.5 before:content-[''] lg:before:-left-6.25 xl:before:-left-8.25 2xl:before:-left-10.25 ${stat.beforeBgClass}`}
                >
                  {stat.value}
                </div>
                <div className="text-label-md text-text-sub-600">{stat.valueLabel}</div>
              </div>
              <div className="text-paragraph-md text-text-soft-400">
                {stat.description}{" "}
                <span className="text-label-md text-text-sub-600 2xl:flex">
                  {stat.descriptionSpan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
