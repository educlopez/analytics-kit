"use client";

import { useState, type CSSProperties } from "react";
import { CatalogShell } from "@/catalog/CatalogShell";
import { CodePanel } from "@/catalog/CodePanel";
import { ControlPanel } from "@/catalog/ControlPanel";
import { LivePreview } from "@/catalog/LivePreview";
import { CATALOG_GROUPS, type CatalogItem } from "@/catalog/items";
import { buildUsage, chartSlots, itemControls, themeVars } from "@/catalog/knobs";
import { useKnobDials } from "@/catalog/useKnobDials";
import { useThemeDials } from "@/catalog/useThemeDials";
import { PROP_DOCS } from "@/catalog/propDocs";
import * as Badge from "@/components/ui/badge";
import * as TabMenuHorizontal from "@/components/ui/tab-menu-horizontal";
import { PropsTable } from "@/site/PropsTable";
import { useSite } from "@/site/theme";

type DetailTab = "preview" | "code";

export function ComponentDetail({ item }: { item: CatalogItem }) {
  const { theme } = useSite();
  const [tab, setTab] = useState<DetailTab>("preview");
  const [panelOpen, setPanelOpen] = useState(true);
  const { knobs, dirty, reset } = useKnobDials(item);
  // Its own panel, and always present — every component reads these tokens, so
  // there is no component without controls any more.
  // Recomputed per variant: a dual-axis line paints two slots where a plain one
  // paints one, so the panel follows the drawing rather than the component.
  const slots = chartSlots(item.slug, knobs.variant);
  const { theme: colors, dirty: colorsDirty, reset: resetColors } = useThemeDials(slots);
  const usage = buildUsage(item, knobs, colors);
  const chart = itemControls(item.slug).height;
  const propRows = PROP_DOCS[item.slug] ?? [];
  const groupLabel = CATALOG_GROUPS.find((group) => group.id === item.group)?.label ?? item.group;

  return (
    <CatalogShell
      // The knobs are a column of the page, not of the Preview tab: they also
      // drive the usage snippet the Code tab prints.
      aside={
        <ControlPanel
          open={panelOpen}
          onOpenChange={setPanelOpen}
          onReset={() => {
            reset();
            resetColors();
          }}
          dirty={dirty || colorsDirty}
          theme={theme}
        />
      }
    >
      <header className="pt-10 lg:pt-14">
        <Badge.Root
          variant="lighter"
          className="bg-bg-weak-50 text-text-sub-600 text-label-sm mb-3 h-7 w-fit rounded-[9px] px-2.5 normal-case"
        >
          {groupLabel}
        </Badge.Root>
        <h1 className="text-title-h4 lg:text-title-h3 text-text-strong-950 !font-[550]">
          {item.title}
        </h1>
        <p className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 mt-3 max-w-[70ch]">
          {item.blurb}
        </p>
      </header>

      <TabMenuHorizontal.Root
        value={tab}
        onValueChange={(value) => setTab(value as DetailTab)}
        className="mt-8"
      >
        <TabMenuHorizontal.List className="border-stroke-soft-200 border-b">
          <TabMenuHorizontal.Trigger value="preview">Preview</TabMenuHorizontal.Trigger>
          <TabMenuHorizontal.Trigger value="code">Code</TabMenuHorizontal.Trigger>
        </TabMenuHorizontal.List>
      </TabMenuHorizontal.Root>

      {tab === "preview" ? (
        // Wide previews (the cohort grid, the dashboard) scroll inside the
        // frame. Without it they push the page body sideways on a phone.
        <div
          className={`bg-bg-weak-25 border-stroke-soft-200 mt-5 grid min-w-0 content-center overflow-x-auto rounded-2xl border px-4 py-5 md:rounded-3xl md:px-6 md:py-7 ${
            item.slug === "dashboard" ? "min-h-[420px]" : "min-h-[360px] xl:min-h-[460px]"
          }`}
          // Outside `.demo-chart-frame` on purpose: the height rules there are
          // written as child selectors, so an extra element inside would break
          // them. This wraps both preview branches and inherits down into
          // `.ak-root`.
          style={themeVars(colors, slots)}
        >
          {/* The knob sizes the plot, not the frame: charts that stack a legend
              under the plot (pie/donut) grow instead of squeezing it to nothing. */}
          {chart ? (
            <div
              className="demo-chart-frame w-full"
              style={{ "--demo-chart-height": `${knobs.height}px` } as CSSProperties}
            >
              <LivePreview slug={item.slug} theme={theme} knobs={knobs} />
            </div>
          ) : (
            <LivePreview slug={item.slug} theme={theme} knobs={knobs} />
          )}
        </div>
      ) : (
        <CodePanel item={item} usage={usage} dirty={dirty || colorsDirty} />
      )}

      {propRows.length ? (
        <section className="pt-10">
          <h2 className="text-subheading-xs text-text-soft-400 mb-4 uppercase">Props</h2>
          <PropsTable rows={propRows} columns={["Property", "Type", "Default", "Description"]} />
        </section>
      ) : null}
    </CatalogShell>
  );
}
