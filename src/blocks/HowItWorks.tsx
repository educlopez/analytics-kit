"use client";

/** Adapted from AlignUI Pro "How It Works 01". */

import {
  RiArrowDownDoubleLine,
  RiArrowRightDoubleLine,
  RiArrowRightUpLongLine,
} from "@remixicon/react";
import Link from "next/link";
import * as Badge from "@/components/ui/badge";
import * as LinkButton from "@/components/ui/link-button";

const stepsData = [
  {
    id: "step1",
    number: "01",
    subtitle: "Pick a connector",
    description: "Vercel, Plausible, GA4, Umami, PostHog — or write one with defineConnector.",
    colorClass: "text-information-base",
    zIndex: "z-3",
    roundedClass: "rounded-t-20 rounded-b-xl lg:rounded-l-3xl lg:rounded-r-xl",
    hasArrow: true,
  },
  {
    id: "step2",
    number: "02",
    subtitle: "Drop the dashboard",
    description: "AnalyticsProvider + Dashboard. Same widgets, same query model.",
    colorClass: "text-success-base",
    zIndex: "z-2",
    roundedClass: "lg:rounded-xl",
    hasArrow: true,
  },
  {
    id: "step3",
    number: "03",
    subtitle: "Swap the vendor",
    description: "Change the constructor. The UI does not care which tool you used last quarter.",
    colorClass: "text-feature-base",
    zIndex: "z-1",
    roundedClass: "rounded-b-20 rounded-t-xl lg:rounded-r-3xl lg:rounded-l-xl",
    hasArrow: false,
  },
];

export function HowItWorks() {
  return (
    <div className="bg-bg-white-0 flex w-full flex-col py-10 lg:items-center lg:py-20" id="how">
      <div className="mx-auto mb-6 flex w-full flex-col gap-4 px-6 lg:mb-12 lg:max-w-[808px] lg:flex-row lg:items-end lg:gap-6 lg:px-0">
        <div className="flex flex-col gap-2 lg:gap-3">
          <Badge.Root
            variant="lighter"
            className="text-label-sm text-text-sub-600 bg-bg-weak-50 h-7 w-fit rounded-[9px] px-2.5 normal-case"
          >
            How it works
          </Badge.Root>
          <h2 className="text-title-h4 lg:text-title-h3 text-text-strong-950 !font-[550]">
            Three steps. Then you stop thinking about it
          </h2>
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <p className="text-label-sm lg:text-label-md text-text-sub-600">
            Connectors declare capabilities, so the widgets keep working when you move.
          </p>
          <LinkButton.Root
            className="text-label-sm lg:text-label-md text-text-strong-950 hover:text-text-strong-950 group h-auto cursor-pointer justify-start gap-1 whitespace-break-spaces transition-all duration-300"
            asChild
          >
            <Link href="/docs">
              Read the docs
              <LinkButton.Icon
                as={RiArrowRightUpLongLine}
                className="text-text-soft-400 group-hover:text-text-strong-950 size-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </LinkButton.Root>
        </div>
      </div>
      <div className="mx-auto mb-6 flex w-full flex-col gap-2 px-6 lg:max-w-7xl lg:flex-row lg:gap-3 lg:px-7">
        {stepsData.map((step) => (
          <div
            key={step.id}
            className={`bg-bg-weak-25 relative ${step.roundedClass} flex w-full p-5 lg:p-7 ${step.zIndex}`}
          >
            {step.hasArrow && (
              <div className="bg-bg-white-0 shadow-custom-input absolute -bottom-4 left-11.75 flex size-6 items-center justify-center rounded-full lg:top-1/2 lg:-right-5 lg:bottom-auto lg:left-auto lg:size-7 lg:-translate-y-1/2">
                <RiArrowRightDoubleLine className="text-text-soft-400 hidden size-5 lg:block" />
                <RiArrowDownDoubleLine className="text-text-soft-400 block size-5 lg:hidden" />
              </div>
            )}
            <div
              className={`text-label-lg lg:text-title-h6 ${step.colorClass} border-stroke-soft-200 flex h-auto border-r pr-5 xl:pr-7`}
            >
              {step.number}
            </div>
            <div className="flex flex-col gap-2 pl-5 lg:gap-4 xl:pl-7">
              <div className="text-label-sm lg:text-label-md text-text-soft-400">
                {step.subtitle}
              </div>
              <div className="text-label-md lg:text-label-lg xl:text-title-h6 text-text-strong-950">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-label-sm text-text-soft-400 px-6 lg:px-0 lg:text-center">
        One constructor change to leave a vendor.
      </div>
    </div>
  );
}
