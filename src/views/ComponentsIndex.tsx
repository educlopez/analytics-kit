"use client";

import Link from "next/link";
import { CATALOG, CATALOG_GROUPS, catalogInGroup } from "@/catalog/items";
import { CatalogShell } from "@/catalog/CatalogShell";
import { LivePreview } from "@/catalog/LivePreview";
import * as Badge from "@/components/ui/badge";
import { useSite } from "@/site/theme";

export function ComponentsIndex() {
  const { theme } = useSite();

  return (
    <CatalogShell>
      <header className="pt-10 lg:pt-14">
        <Badge.Root
          variant="lighter"
          className="bg-bg-weak-50 text-text-sub-600 text-label-sm mb-3 h-7 w-fit rounded-[9px] px-2.5 normal-case"
        >
          Components
        </Badge.Root>
        <h1 className="text-title-h4 lg:text-title-h3 text-text-strong-950 max-w-[20ch] !font-[550]">
          Charts by type. Install one.
        </h1>
        <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 mt-3 max-w-[70ch] [&_code]:font-mono [&_code]:text-[0.86em]">
          {CATALOG.length} pieces — area through sunburst, metrics, lists, dashboard. Each page has
          a live Preview, Customize knobs, a Code tab, and the full props table. Colors come from{" "}
          <code>--chart-1</code>…<code>--chart-5</code>.
        </p>
      </header>

      {CATALOG_GROUPS.map((group) => (
        <section key={group.id} className="pt-10">
          <h2 className="text-subheading-xs text-text-soft-400 mb-4 uppercase">{group.label}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalogInGroup(group.id).map((item) => (
              <Link
                key={item.slug}
                href={`/components/${item.slug}`}
                className="border-stroke-soft-200 hover:border-stroke-sub-300 bg-bg-white-0 grid min-w-0 overflow-hidden rounded-2xl border transition-colors"
              >
                <div className="bg-bg-weak-25 min-h-[188px] min-w-0 overflow-hidden px-3 pt-3 pb-1">
                  <LivePreview
                    slug={item.slug}
                    variant={item.defaultVariant}
                    theme={theme}
                    preview
                  />
                </div>
                <div className="border-stroke-soft-200 border-t p-4">
                  <h3 className="text-label-md text-text-strong-950">{item.title}</h3>
                  <p className="text-label-sm text-text-soft-400 mt-1">{item.blurb}</p>
                  <span className="text-text-soft-400 mt-3 inline-block font-mono text-xs">
                    {item.variants.length ? `${item.variants.length} variants` : "Layout"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </CatalogShell>
  );
}
