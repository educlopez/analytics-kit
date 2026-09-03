import type { ReactNode } from "react";
import * as Badge from "@/components/ui/badge";
import { cn } from "@/utils/cn";

/**
 * The section header AlignUI's landing blocks share: a lighter badge, a 550
 * weight title, and an optional lede.
 */
export function SectionHead({
  kicker,
  title,
  lede,
  aside,
  center = false,
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10",
        center && "lg:flex-col lg:items-center lg:justify-start",
      )}
    >
      <div className={cn("flex min-w-0 flex-col", center && "lg:items-center")}>
        <Badge.Root
          variant="lighter"
          className="bg-bg-weak-50 text-text-sub-600 text-label-sm mb-3 h-7 w-fit rounded-[9px] px-2.5 normal-case"
        >
          {kicker}
        </Badge.Root>
        <h2
          className={cn(
            "text-title-h5 lg:text-title-h4 xl:text-title-h3 text-text-strong-950 !font-[550]",
            center && "lg:text-center",
          )}
        >
          {title}
        </h2>
        {lede ? (
          <p
            className={cn(
              "text-paragraph-sm lg:text-paragraph-md text-text-sub-600 mt-3 max-w-[60ch]",
              center && "lg:text-center",
            )}
          >
            {lede}
          </p>
        ) : null}
      </div>
      {aside ? <div className="flex shrink-0 items-center gap-3">{aside}</div> : null}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("mx-auto w-full max-w-7xl scroll-mt-24 px-6 py-10 lg:px-7 lg:py-14", className)}
    >
      {children}
    </section>
  );
}
