"use client";

import Link from "next/link";
import { CATALOG, CATALOG_GROUPS, catalogInGroup } from "../catalog/items";
import { CatalogShell } from "../catalog/CatalogShell";
import { LivePreview } from "../catalog/LivePreview";
import { useSite } from "../site/SiteShell";

export function ComponentsIndex() {
  const { theme } = useSite();

  return (
    <CatalogShell>
      <header className="catalog-head">
        <p className="kicker">Components</p>
        <h1>
          Charts by type.
          <em> Install one.</em>
        </h1>
        <p className="lede compact">
          {CATALOG.length} pieces — area, line, bar, pie, metrics, lists, dashboard. Each page has a
          live Preview, Customize knobs, a Code tab, and the full props table. Colors come from{" "}
          <code>--chart-1</code>…<code>--chart-5</code>.
        </p>
      </header>

      {CATALOG_GROUPS.map((group) => (
        <section key={group.id} className="catalog-section">
          <h2>{group.label}</h2>
          <div className="catalog-grid">
            {catalogInGroup(group.id).map((item) => (
              <Link key={item.slug} href={`/components/${item.slug}`} className="catalog-card">
                <div className="demo-canvas demo-canvas-mini">
                  <LivePreview
                    slug={item.slug}
                    variant={item.defaultVariant}
                    theme={theme}
                    preview
                  />
                </div>
                <div className="catalog-card-copy">
                  <h3>{item.title}</h3>
                  <p>{item.blurb}</p>
                  {item.variants.length ? (
                    <span className="catalog-meta">{item.variants.length} variants</span>
                  ) : (
                    <span className="catalog-meta">Layout</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </CatalogShell>
  );
}
