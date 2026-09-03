"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ThreeColumn, ThreeColumnNav } from "@/site/ThreeColumn";
import { cn } from "@/utils/cn";
import { CATALOG, CATALOG_GROUPS, catalogInGroup } from "./items";

export function CatalogShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const jumpValue = CATALOG.some((item) => pathname === `/components/${item.slug}`)
    ? pathname
    : "/components";

  return (
    <ThreeColumn
      aside={aside}
      nav={
        <ThreeColumnNav label="Components">
          <Link
            href="/components"
            className={cn(
              "text-label-sm hover:bg-bg-weak-50 rounded-10 mb-2 px-2.5 py-1.5 transition-colors",
              pathname === "/components"
                ? "bg-bg-weak-50 text-text-strong-950"
                : "text-text-sub-600 hover:text-text-strong-950",
            )}
          >
            All components
          </Link>
          {CATALOG_GROUPS.map((group) => (
            <div key={group.id} className="mt-4 grid gap-px">
              <p className="text-subheading-2xs text-text-soft-400 mb-1 px-2.5 uppercase">
                {group.label}
              </p>
              {catalogInGroup(group.id).map((item) => {
                const href = `/components/${item.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={item.slug}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-label-sm hover:bg-bg-weak-50 rounded-10 px-2.5 py-1.5 transition-colors",
                      active
                        ? "bg-bg-weak-50 text-text-strong-950"
                        : "text-text-sub-600 hover:text-text-strong-950",
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </ThreeColumnNav>
      }
      mobileNav={
        <label className="border-stroke-soft-200 bg-bg-white-0 sticky top-16 z-12 -mx-6 block border-b px-6 py-2.5 lg:hidden">
          <span className="sr-only">Jump to component</span>
          <select
            value={jumpValue}
            onChange={(event) => router.push(event.target.value)}
            className="border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 text-label-sm rounded-10 h-11 w-full appearance-none border px-3.5"
          >
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
      }
    >
      {children}
    </ThreeColumn>
  );
}
