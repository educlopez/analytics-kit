"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { CATALOG, CATALOG_GROUPS, catalogInGroup } from "./items";

export function CatalogShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const jumpValue = CATALOG.some((item) => pathname === `/components/${item.slug}`)
    ? pathname
    : "/components";

  return (
    <div className="catalog">
      <aside className="catalog-nav" aria-label="Components">
        <Link
          href="/components"
          className={pathname === "/components" ? "is-active catalog-index" : "catalog-index"}
        >
          All components
        </Link>
        {CATALOG_GROUPS.map((group) => (
          <div key={group.id} className="catalog-group">
            <p>{group.label}</p>
            {catalogInGroup(group.id).map((item) => {
              const href = `/components/${item.slug}`;
              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={pathname === href ? "is-active" : undefined}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        ))}
      </aside>
      <div className="catalog-main">
        <label className="catalog-jump">
          <span className="sr-only">Jump to component</span>
          <select value={jumpValue} onChange={(event) => router.push(event.target.value)}>
            <option value="/components">All components</option>
            {CATALOG_GROUPS.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {catalogInGroup(group.id).map((item) => (
                  <option key={item.slug} value={`/components/${item.slug}`}>
                    {item.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {children}
      </div>
    </div>
  );
}
