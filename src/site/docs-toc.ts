/**
 * The docs page's sections, shared so the page's TOC rail and the command menu
 * cannot drift apart.
 */
export interface TocItem {
  href: string;
  label: string;
}

export const DOCS_TOC: readonly TocItem[] = [
  { href: "#install", label: "Install" },
  { href: "#provider", label: "Provider" },
  { href: "#connectors", label: "Connectors" },
  { href: "#query", label: "Query model" },
  { href: "#charts", label: "Charts" },
  { href: "#widgets", label: "Widgets" },
  { href: "#colors", label: "Colors" },
  { href: "#keys", label: "Server keys" },
  { href: "#registry", label: "shadcn registry" },
  { href: "#extend", label: "Extend" },
] as const;
