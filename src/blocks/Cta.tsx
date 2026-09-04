"use client";

/** Adapted from AlignUI Pro "CTA 01". */

import { RiArrowRightUpLongLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";
import { BrandMark } from "@/site/BrandMark";

export function Cta() {
  return (
    <div className="bg-bg-white-0 w-full py-10 lg:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-7">
        <BrandMark className="text-primary-base h-12 w-auto lg:h-16" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="text-title-h4 lg:text-title-h5 xl:text-title-h4 text-text-strong-950 !font-[550]">
            Ship the dashboard. Keep the provider.
          </div>
          <div className="text-text-sub-600 text-paragraph-md xl:text-paragraph-lg">
            Install from npm or add the widgets through the shadcn registry.
          </div>
        </div>
        <Button.Root
          variant="primary"
          mode="filled"
          size="medium"
          asChild
          className="shadow-complex-7 border-static-white/[0.24] w-fit cursor-pointer gap-1.5 rounded-xl border pr-4.5 pl-5 transition-all duration-300 hover:[background:linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0)_100%),var(--color-primary-base)]"
        >
          <a href="https://github.com/educlopez/wingtics">
            Get started on GitHub
            <Button.Icon as={RiArrowRightUpLongLine} className="text-static-white/[0.64] size-5" />
          </a>
        </Button.Root>
      </div>
    </div>
  );
}
