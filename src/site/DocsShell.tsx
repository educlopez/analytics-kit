"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThreeColumn, ThreeColumnNav } from "@/site/ThreeColumn";
import type { TocItem } from "@/site/docs-toc";
import { cn } from "@/utils/cn";

const NAV: { label: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  { label: "Documentation", links: [{ href: "/docs", label: "Overview" }] },
  { label: "Reference", links: [{ href: "/components", label: "Components" }] },
  {
    label: "Project",
    links: [
      { href: "https://github.com/educlopez/wingtics", label: "GitHub", external: true },
      { href: "/llms.txt", label: "llms.txt", external: true },
    ],
  },
];

/**
 * Marks the section whose heading last crossed the top of the viewport. Reading
 * the entry that is *leaving* the top rather than the one most visible keeps the
 * highlight on the section you are reading when a long one fills the screen.
 */
function useActiveSection(idsKey: string) {
  const [active, setActive] = useState<string | null>(idsKey.split(",")[0] ?? null);

  useEffect(() => {
    const sections = idsKey
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const onScroll = () => {
      // The sticky header plus a little breathing room.
      const line = 140;
      let current = sections[0]?.id ?? null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      // At the very bottom the last section may never reach the line.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 8) {
        current = sections[sections.length - 1]?.id ?? current;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [idsKey]);

  return active;
}

function TocLink({
  item,
  active,
  variant,
}: {
  item: TocItem;
  active: boolean;
  variant: "rail" | "bar";
}) {
  return (
    <a
      href={item.href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "text-label-sm transition-colors",
        variant === "rail"
          ? "-ml-px border-l py-1.5 pl-3"
          : "rounded-10 shrink-0 px-3 py-1.5 whitespace-nowrap",
        active
          ? variant === "rail"
            ? "border-primary-base text-text-strong-950"
            : "bg-bg-weak-50 text-text-strong-950"
          : cn(
              "text-text-sub-600 hover:text-text-strong-950",
              variant === "rail" ? "border-transparent hover:border-stroke-sub-300" : "",
            ),
      )}
    >
      {item.label}
    </a>
  );
}

export function DocsShell({ toc, children }: { toc: readonly TocItem[]; children: ReactNode }) {
  const pathname = usePathname();
  const active = useActiveSection(toc.map((item) => item.href.replace(/^#/, "")).join(","));

  return (
    <ThreeColumn
      nav={
        <ThreeColumnNav label="Documentation">
          {NAV.map((group) => (
            <div key={group.label} className="mt-4 grid gap-px first:mt-0">
              <p className="text-subheading-2xs text-text-soft-400 mb-1 px-2.5 uppercase">
                {group.label}
              </p>
              {group.links.map((link) => {
                const current = !link.external && pathname === link.href;
                const className = cn(
                  "text-label-sm hover:bg-bg-weak-50 rounded-10 px-2.5 py-1.5 transition-colors",
                  current
                    ? "bg-bg-weak-50 text-text-strong-950"
                    : "text-text-sub-600 hover:text-text-strong-950",
                );
                return link.external ? (
                  <a key={link.href} href={link.href} className={className}>
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={className}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </ThreeColumnNav>
      }
      // Below `xl` the right column would land at the very bottom of the page,
      // where an "on this page" list is useless — so the narrow layout gets the
      // same list as a sticky strip above the content instead.
      mobileNav={
        <nav
          className="border-stroke-soft-200 bg-bg-white-0 no-scrollbar sticky top-16 z-12 -mx-6 flex gap-1 overflow-x-auto border-b px-6 py-2 xl:hidden"
          aria-label="On this page"
        >
          {toc.map((item) => (
            <TocLink
              key={item.href}
              item={item}
              active={active === item.href.slice(1)}
              variant="bar"
            />
          ))}
        </nav>
      }
      aside={
        <aside
          className="hidden w-[220px] shrink-0 self-start xl:block xl:pt-14"
          aria-label="On this page"
        >
          <div className="sticky top-24 flex flex-col gap-3">
            <span className="text-subheading-xs text-text-soft-400 uppercase">On this page</span>
            <div className="border-stroke-soft-200 grid border-l">
              {toc.map((item) => (
                <TocLink
                  key={item.href}
                  item={item}
                  active={active === item.href.slice(1)}
                  variant="rail"
                />
              ))}
            </div>
          </div>
        </aside>
      }
    >
      {children}
    </ThreeColumn>
  );
}
