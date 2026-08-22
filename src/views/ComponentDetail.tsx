"use client";

import { useState } from "react";
import type { CatalogItem } from "../catalog/items";
import { CatalogShell } from "../catalog/CatalogShell";
import { InstallBar } from "../catalog/InstallBar";
import { LivePreview } from "../catalog/LivePreview";
import { PropsTable } from "../site/PropsTable";
import { useSite } from "../site/SiteShell";

const CHART_PROPS = [
  {
    name: "data",
    type: "ChartDatum[]",
    notes: "Series: date + value. Breakdowns: label + value.",
  },
  {
    name: "dataKey",
    type: "string",
    default: '"value"',
    notes: "Numeric field.",
  },
  {
    name: "labelKey",
    type: "string",
    notes: '"date" on area/line, "label" on bar/pie.',
  },
  {
    name: "variant",
    type: "string",
    notes: "Visual drawing listed above.",
  },
  {
    name: "config",
    type: "ChartConfig",
    notes: "{ [dataKey]: { label?, color? } }.",
  },
  {
    name: "className",
    type: "string",
    notes: "Chart container. Spark looks better around h-[88px].",
  },
];

export function ComponentDetail({ item }: { item: CatalogItem }) {
  const { theme } = useSite();
  const [variant, setVariant] = useState(item.defaultVariant || item.variants[0] || "");

  return (
    <CatalogShell>
      <header className="catalog-head">
        <p className="kicker">{item.group}</p>
        <h1>{item.title}</h1>
        <p className="lede compact">{item.blurb}</p>
      </header>

      <InstallBar registry={item.registry} snippet={item.snippet} />

      {item.variants.length ? (
        <div className="variant-switch" role="group" aria-label="Variants">
          {item.variants.map((option) => (
            <button
              key={option}
              type="button"
              className={option === variant ? "is-active" : ""}
              onClick={() => setVariant(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      <div className={`demo-canvas${item.slug === "dashboard" ? " demo-canvas-wide" : ""}`}>
        <LivePreview slug={item.slug} variant={variant} theme={theme} />
      </div>
      {variant ? (
        <code className="demo-caption">
          {item.snippet.replace(/variant="[^"]+"/, `variant="${variant}"`)}
        </code>
      ) : null}

      {item.variants.length > 1 ? (
        <section className="catalog-section">
          <h2>All variants</h2>
          <div className="variant-grid">
            {item.variants.map((option) => (
              <article key={option} className="variant-card">
                <h4>{option}</h4>
                <LivePreview slug={item.slug} variant={option} theme={theme} />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {item.group === "charts" ? (
        <section className="catalog-section">
          <h2>Props</h2>
          <PropsTable rows={CHART_PROPS} />
        </section>
      ) : null}
    </CatalogShell>
  );
}
