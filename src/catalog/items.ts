export type CatalogGroupId = "charts" | "metrics" | "lists" | "layout";

export interface CatalogItem {
  slug: string;
  title: string;
  group: CatalogGroupId;
  blurb: string;
  registry?: string;
  snippet: string;
  variants: readonly string[];
  defaultVariant: string;
}

export const CATALOG_GROUPS: { id: CatalogGroupId; label: string }[] = [
  { id: "charts", label: "Charts" },
  { id: "metrics", label: "Metrics" },
  { id: "lists", label: "Lists" },
  { id: "layout", label: "Layout" },
];

export const CATALOG: CatalogItem[] = [
  {
    slug: "area-chart",
    title: "Area chart",
    group: "charts",
    blurb: "Filled trend. Gradient, step, dither, glow — the drawing, not a palette.",
    registry: "area-chart",
    snippet: `<AreaChart data={points} variant="gradient" />`,
    variants: ["gradient", "linear", "natural", "step", "dots", "spark", "dither", "glow"],
    defaultVariant: "gradient",
  },
  {
    slug: "line-chart",
    title: "Line chart",
    group: "charts",
    blurb: "Stroke only. Monotone, dashed, dithered dots, or a soft glow.",
    registry: "line-chart",
    snippet: `<LineChart data={points} variant="monotone" />`,
    variants: ["monotone", "linear", "step", "dashed", "dots", "dither", "glow"],
    defaultVariant: "monotone",
  },
  {
    slug: "bar-chart",
    title: "Bar chart",
    group: "charts",
    blurb: "Category comparison. Vertical, horizontal, hatched, or stippled.",
    registry: "bar-chart",
    snippet: `<BarChart data={rows} variant="rounded" />`,
    variants: ["vertical", "horizontal", "rounded", "hatched", "dither"],
    defaultVariant: "rounded",
  },
  {
    slug: "pie-chart",
    title: "Pie chart",
    group: "charts",
    blurb: "Share of a dimension. Donut, pie, legend, or dithered slices.",
    registry: "pie-chart",
    snippet: `<PieChart data={rows} variant="donut" />`,
    variants: ["donut", "pie", "legend", "dither"],
    defaultVariant: "donut",
  },
  {
    slug: "metric-card",
    title: "Metric card",
    group: "metrics",
    blurb: "One number, a delta, an optional spark. Wired through useQuery.",
    registry: "metric-card",
    snippet: `<MetricCard metric="visitors" variant="hero" />`,
    variants: ["default", "spark", "compact", "hero"],
    defaultVariant: "default",
  },
  {
    slug: "ranked-list",
    title: "Ranked list",
    group: "lists",
    blurb: "Breakdown rows as bars, a compact list, or a table.",
    snippet: `<RankedList rows={rows} metric="visitors" variant="bar" />`,
    variants: ["bar", "compact", "table"],
    defaultVariant: "bar",
  },
  {
    slug: "dashboard",
    title: "Dashboard",
    group: "layout",
    blurb: "Registered widgets on a grid. Same catalog, any connector.",
    registry: "dashboard",
    snippet: `<Dashboard widgets={defaultDashboard} columns={4} />`,
    variants: [],
    defaultVariant: "",
  },
];

export function catalogBySlug(slug: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.slug === slug);
}

export function catalogInGroup(group: CatalogGroupId): CatalogItem[] {
  return CATALOG.filter((item) => item.group === group);
}
