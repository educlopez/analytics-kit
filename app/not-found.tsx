import type { Metadata } from "next";
import Link from "next/link";
import { CATALOG, CATALOG_GROUPS } from "../src/catalog/items";

export const metadata: Metadata = {
  title: "Not found",
  description: "That page does not exist. Here is where everything else is.",
  robots: { index: false, follow: true },
};

/**
 * Next already answers 404 for an unknown path. What it does not do is help
 * whoever arrived — a person or an agent — find the thing they were reaching
 * for. So this page is a map: the machine-readable indexes first, because an
 * agent that hit a dead URL wants the sitemap rather than a nicer 404.
 */
export default function NotFound() {
  const groups = CATALOG_GROUPS.map((group) => ({
    ...group,
    items: CATALOG.filter((item) => item.group === group.id),
  })).filter((group) => group.items.length);

  return (
    <div className="mx-auto w-full max-w-[68ch] px-5 pb-24 md:px-8">
      <header className="pt-10 lg:pt-14">
        <p className="text-text-soft-400 font-mono text-xs">404</p>
        <h1 className="text-title-h4 lg:text-title-h3 text-text-strong-950 mt-2 !font-[550]">
          That page does not exist
        </h1>
        <p className="text-paragraph-md text-text-sub-600 mt-3">
          Nothing is served at this URL. Everything Wingtics publishes is listed below.
        </p>
      </header>

      <div className="text-paragraph-sm text-text-sub-600 mt-10 grid gap-8 [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.9em]">
        <section>
          <h2 className="text-title-h6 text-text-strong-950 !font-[550]">Machine-readable index</h2>
          <ul className="mt-2 grid gap-1">
            <li>
              <a href="/llms.txt">
                <code>/llms.txt</code>
              </a>{" "}
              — what this project is, when to use it, and every entry point
            </li>
            <li>
              <a href="/sitemap.xml">
                <code>/sitemap.xml</code>
              </a>{" "}
              — every page
            </li>
            <li>
              <a href="/openapi.json">
                <code>/openapi.json</code>
              </a>{" "}
              — the HTTP surface
            </li>
            <li>
              <a href="/r/registry.json">
                <code>/r/registry.json</code>
              </a>{" "}
              — the component registry
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-title-h6 text-text-strong-950 !font-[550]">Pages</h2>
          <ul className="mt-2 grid gap-1">
            <li>
              <Link href="/docs">Docs</Link> — install, connectors, the query model
            </li>
            <li>
              <Link href="/components">Components</Link> — all {CATALOG.length}, with live previews
            </li>
            <li>
              <Link href="/demo">Demo</Link> — a working dashboard built from the kit
            </li>
            <li>
              <Link href="/about">About</Link> · <Link href="/contact">Contact</Link> ·{" "}
              <Link href="/privacy">Privacy</Link>
            </li>
          </ul>
        </section>

        {groups.map((group) => (
          <section key={group.id}>
            <h2 className="text-title-h6 text-text-strong-950 !font-[550]">{group.label}</h2>
            <p className="mt-2">
              {group.items.map((item, index) => (
                <span key={item.slug}>
                  {index ? " · " : null}
                  <Link href={`/components/${item.slug}`}>{item.title}</Link>
                </span>
              ))}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
