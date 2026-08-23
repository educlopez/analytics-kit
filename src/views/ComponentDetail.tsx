"use client";

import { useState, type CSSProperties } from "react";
import { CatalogShell } from "../catalog/CatalogShell";
import { CodePanel } from "../catalog/CodePanel";
import { Customize } from "../catalog/Customize";
import { LivePreview } from "../catalog/LivePreview";
import { CATALOG_GROUPS, type CatalogItem } from "../catalog/items";
import {
  buildUsage,
  defaultKnobs,
  itemControls,
  knobsEqual,
  type PreviewKnobs,
} from "../catalog/knobs";
import { PROP_DOCS } from "../catalog/propDocs";
import { PropsTable } from "../site/PropsTable";
import { useSite } from "../site/SiteShell";

type DetailTab = "preview" | "code";

export function ComponentDetail({ item }: { item: CatalogItem }) {
  const { theme } = useSite();
  const defaults = defaultKnobs(item);
  const [tab, setTab] = useState<DetailTab>("preview");
  const [knobs, setKnobs] = useState<PreviewKnobs>(defaults);
  const dirty = !knobsEqual(knobs, defaults);
  const usage = buildUsage(item, knobs);
  const chart = itemControls(item.slug).height;
  const propRows = PROP_DOCS[item.slug] ?? [];
  const groupLabel = CATALOG_GROUPS.find((group) => group.id === item.group)?.label ?? item.group;

  function update<K extends keyof PreviewKnobs>(key: K, value: PreviewKnobs[K]) {
    setKnobs((current) => {
      const next = { ...current, [key]: value };
      if (key === "variant") {
        if (value === "spark" && current.height === defaults.height) next.height = 88;
        if (current.variant === "spark" && value !== "spark" && current.height === 88) {
          next.height = defaults.height;
        }
      }
      return next;
    });
  }

  return (
    <CatalogShell>
      <header className="catalog-head">
        <p className="kicker">{groupLabel}</p>
        <h1>{item.title}</h1>
        <p className="lede compact">{item.blurb}</p>
      </header>

      <div className="detail-tabs" role="tablist" aria-label="Component view">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "preview"}
          className={tab === "preview" ? "is-active" : ""}
          onClick={() => setTab("preview")}
        >
          Preview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "code"}
          className={tab === "code" ? "is-active" : ""}
          onClick={() => setTab("code")}
        >
          Code
        </button>
      </div>

      {tab === "preview" ? (
        <>
          <div
            className={`demo-canvas demo-canvas-hero${item.slug === "dashboard" ? " demo-canvas-wide" : ""}`}
          >
            {/* The knob sizes the plot, not the frame: charts that stack a legend
                under the plot (pie/donut) grow instead of squeezing it to nothing. */}
            {chart ? (
              <div
                className="demo-chart-frame"
                style={{ "--demo-chart-height": `${knobs.height}px` } as CSSProperties}
              >
                <LivePreview slug={item.slug} theme={theme} knobs={knobs} />
              </div>
            ) : (
              <LivePreview slug={item.slug} theme={theme} knobs={knobs} />
            )}
          </div>
          <Customize
            item={item}
            knobs={knobs}
            dirty={dirty}
            onChange={update}
            onReset={() => setKnobs(defaults)}
          />
        </>
      ) : (
        <CodePanel item={item} usage={usage} dirty={dirty} />
      )}

      {propRows.length ? (
        <section className="catalog-section props-section">
          <h2>Props</h2>
          <PropsTable rows={propRows} columns={["Property", "Type", "Default", "Description"]} />
        </section>
      ) : null}
    </CatalogShell>
  );
}
