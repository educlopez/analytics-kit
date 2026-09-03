"use client";

/** Adapted from AlignUI Pro "Features 01". */

import {
  RiKey2Line,
  RiPaletteLine,
  RiPlugLine,
  RiPulseLine,
  RiShieldCheckLine,
} from "@remixicon/react";
import * as Badge from "@/components/ui/badge";

const featuresData = [
  [
    {
      id: "canonical",
      icon: RiPulseLine,
      iconColor: "text-information-base",
      title: "Widgets stay canonical",
      description:
        "Visitors, pages, referrers, devices. The dashboard asks for metrics — not vendor field names.",
    },
    {
      id: "capabilities",
      icon: RiShieldCheckLine,
      iconColor: "text-success-base",
      title: "Capabilities, not crashes",
      description:
        "Vercel has no bounce rate. The widget knows, and sits out, instead of lying or throwing.",
    },
  ],
  [
    {
      id: "connectors",
      icon: RiPlugLine,
      iconColor: "text-feature-base",
      title: "Swap the vendor, keep the dashboard",
      description:
        "Connectors map Vercel, Plausible, GA4, Umami and PostHog onto the same metrics and dimensions. One constructor changes; the UI does not.",
    },
  ],
  [
    {
      id: "keys",
      icon: RiKey2Line,
      iconColor: "text-warning-base",
      title: "Keys stay on the server",
      description:
        "The Next handler (or any Fetch route) holds the token. The browser talks to your endpoint.",
    },
    {
      id: "colors",
      icon: RiPaletteLine,
      iconColor: "text-highlighted-base",
      title: "Colors follow the host",
      description: "Charts read --chart-1…--chart-5 from your CSS, so they inherit your palette.",
    },
  ],
];

export function Features() {
  return (
    <div className="bg-bg-white-0 w-full py-10 lg:py-20">
      <div className="mx-auto flex max-w-7xl flex-col px-6 lg:px-7">
        <div className="mb-6 flex flex-col lg:mb-12 lg:items-center">
          <Badge.Root
            variant="lighter"
            className="bg-bg-weak-50 text-text-sub-600 text-label-sm mb-4 h-7 w-fit rounded-[9px] px-2.5 normal-case"
          >
            The kit
          </Badge.Root>
          <h2 className="text-title-h5 lg:text-title-h4 xl:text-title-h3 text-text-strong-950 !font-[550] lg:text-center">
            The dashboard does not <br /> learn a vendor
          </h2>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row">
          {featuresData.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={group.length > 1 ? "flex flex-col gap-2 md:flex-row lg:flex-col" : "flex"}
            >
              {group.map((feature) => (
                <div
                  key={feature.id}
                  className="rounded-20 bg-bg-weak-25 flex w-full flex-col justify-between gap-6 p-6 lg:gap-8 lg:rounded-3xl lg:p-8 xl:gap-10 xl:p-10"
                >
                  <div className="bg-bg-white-0 rounded-10 shadow-custom-input-4 flex size-10 items-center justify-center lg:size-12 lg:rounded-xl">
                    <feature.icon className={`size-6 lg:size-7 ${feature.iconColor}`} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-label-md lg:text-label-lg text-text-strong-950">
                      {feature.title}
                    </h3>
                    <p className="text-label-sm lg:text-label-md text-text-soft-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
