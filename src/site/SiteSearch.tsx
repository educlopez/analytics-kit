"use client";

/**
 * Site-wide search over the component catalog and the docs sections, in
 * AlignUI's command menu. Everything it can reach is already a static list, so
 * there is no index to build and no request to make — cmdk filters in memory.
 */

import { useEffect, useMemo, useState } from "react";
import {
  RiBookOpenLine,
  RiCornerDownLeftLine,
  RiDashboardLine,
  RiFileTextLine,
  RiSearchLine,
} from "@remixicon/react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { CATALOG, CATALOG_GROUPS } from "@/catalog/items";
import * as CommandMenu from "@/components/ui/command-menu";
import * as Kbd from "@/components/ui/kbd";
import { DOCS_TOC } from "@/site/docs-toc";
import { cn } from "@/utils/cn";

const PAGES = [
  { href: "/docs", label: "Documentation", icon: RiBookOpenLine },
  { href: "/components", label: "All components", icon: RiDashboardLine },
  { href: "/demo", label: "Demo platform", icon: RiDashboardLine },
];

function groupLabel(id: string) {
  return CATALOG_GROUPS.find((group) => group.id === id)?.label ?? id;
}

export function SiteSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      // The bare "/" shortcut, but not while the caret is in a field.
      if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
        const target = event.target as HTMLElement | null;
        const tag = target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (target?.isContentEditable) return;
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Grouped once: the catalog is ~34 entries and the order is stable.
  const grouped = useMemo(
    () =>
      CATALOG_GROUPS.map((group) => ({
        id: group.id,
        label: group.label,
        items: CATALOG.filter((item) => item.group === group.id),
      })).filter((group) => group.items.length > 0),
    [],
  );

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search components and docs"
        className={cn(
          "border-stroke-soft-200 bg-bg-white-0 text-text-soft-400 hover:border-stroke-sub-300 hover:text-text-sub-600 rounded-10 flex h-8 cursor-pointer items-center gap-2 border pr-1.5 pl-2.5 transition-colors",
          className,
        )}
      >
        <RiSearchLine className="size-4 shrink-0" />
        <span className="text-label-sm hidden lg:block">Search</span>
        <Kbd.Root className="ml-4 hidden lg:flex">⌘K</Kbd.Root>
      </button>

      <CommandMenu.Dialog open={open} onOpenChange={setOpen}>
        <CommandMenu.DialogTitle className="sr-only">
          Search components and docs
        </CommandMenu.DialogTitle>
        <div className="group/cmd-input flex items-center gap-2 px-5 py-3.5">
          <RiSearchLine className="text-text-soft-400 size-5 shrink-0" />
          <CommandMenu.Input placeholder="Search components, docs sections…" autoFocus />
        </div>

        {/* Capped rather than letting ~47 rows stretch the dialog down the
            whole viewport; the list scrolls inside. */}
        <CommandMenu.List className="max-h-[min(60vh,26rem)]">
          <Command.Empty className="text-text-soft-400 text-paragraph-sm px-5 py-8 text-center">
            Nothing matches that.
          </Command.Empty>

          <CommandMenu.Group heading="Pages">
            {PAGES.map((page) => (
              <CommandMenu.Item
                key={page.href}
                value={`page ${page.label}`}
                onSelect={() => go(page.href)}
              >
                <CommandMenu.ItemIcon as={page.icon} />
                {page.label}
              </CommandMenu.Item>
            ))}
          </CommandMenu.Group>

          <CommandMenu.Group heading="Docs">
            {DOCS_TOC.map((section) => (
              <CommandMenu.Item
                key={section.href}
                value={`docs ${section.label}`}
                onSelect={() => go(`/docs${section.href}`)}
              >
                <CommandMenu.ItemIcon as={RiFileTextLine} />
                {section.label}
                <span className="text-text-soft-400 text-label-xs ml-auto">Docs</span>
              </CommandMenu.Item>
            ))}
          </CommandMenu.Group>

          {grouped.map((group) => (
            <CommandMenu.Group key={group.id} heading={group.label}>
              {group.items.map((item) => (
                <CommandMenu.Item
                  key={item.slug}
                  value={`${item.title} ${item.slug} ${item.blurb}`}
                  onSelect={() => go(`/components/${item.slug}`)}
                >
                  <CommandMenu.ItemIcon as={RiDashboardLine} />
                  <span className="truncate">{item.title}</span>
                  <span className="text-text-soft-400 text-label-xs ml-auto shrink-0">
                    {groupLabel(item.group)}
                  </span>
                </CommandMenu.Item>
              ))}
            </CommandMenu.Group>
          ))}
        </CommandMenu.List>

        <CommandMenu.Footer>
          <span className="text-text-soft-400 text-label-xs">
            {CATALOG.length} components · {DOCS_TOC.length} docs sections
          </span>
          <span className="text-text-soft-400 text-label-xs flex items-center gap-1.5">
            <CommandMenu.FooterKeyBox>
              <RiCornerDownLeftLine className="size-3" />
            </CommandMenu.FooterKeyBox>
            to open
          </span>
        </CommandMenu.Footer>
      </CommandMenu.Dialog>
    </>
  );
}
