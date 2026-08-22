"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CATALOG_GROUPS, catalogInGroup } from "./items";

export function CatalogShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
      <div className="catalog-main">{children}</div>
    </div>
  );
}
