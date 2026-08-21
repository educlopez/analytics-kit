export const BUILTIN_METRICS = [
  "visitors",
  "pageviews",
  "visits",
  "bounceRate",
  "avgDuration",
  "viewsPerVisit",
  "events",
] as const;

export type BuiltinMetric = (typeof BUILTIN_METRICS)[number];

/**
 * Augment this interface in your app to add first-class metric IDs:
 *
 * declare module "@analytics-kit/core" {
 *   interface MetricCatalog {
 *     revenue: MetricDefinition;
 *   }
 * }
 */
export interface MetricDefinition {
  label: string;
  kind: "count" | "ratio" | "duration" | "currency" | "custom";
  unit?: "number" | "percent" | "seconds" | "ms" | "usd";
  description?: string;
}

export interface MetricCatalog {
  visitors: MetricDefinition;
  pageviews: MetricDefinition;
  visits: MetricDefinition;
  bounceRate: MetricDefinition;
  avgDuration: MetricDefinition;
  viewsPerVisit: MetricDefinition;
  events: MetricDefinition;
}

export type MetricId = keyof MetricCatalog | (string & {});

export const defaultMetricCatalog: { [K in BuiltinMetric]: MetricDefinition } = {
  visitors: {
    label: "Visitors",
    kind: "count",
    unit: "number",
    description: "Unique visitors in the selected range.",
  },
  pageviews: {
    label: "Pageviews",
    kind: "count",
    unit: "number",
    description: "Total page view events.",
  },
  visits: {
    label: "Visits",
    kind: "count",
    unit: "number",
    description: "Sessions / visits.",
  },
  bounceRate: {
    label: "Bounce rate",
    kind: "ratio",
    unit: "percent",
    description: "Percentage of single-page visits.",
  },
  avgDuration: {
    label: "Avg. duration",
    kind: "duration",
    unit: "seconds",
    description: "Average visit duration.",
  },
  viewsPerVisit: {
    label: "Views / visit",
    kind: "ratio",
    unit: "number",
    description: "Pageviews divided by visits.",
  },
  events: {
    label: "Events",
    kind: "count",
    unit: "number",
    description: "Custom + pageview events.",
  },
};

const metricRegistry = new Map<string, MetricDefinition>(
  Object.entries(defaultMetricCatalog),
);

export function registerMetric(id: string, definition: MetricDefinition): void {
  metricRegistry.set(id, definition);
}

export function getMetric(id: string): MetricDefinition | undefined {
  return metricRegistry.get(id);
}

export function listMetrics(): Array<{ id: string; definition: MetricDefinition }> {
  return [...metricRegistry.entries()].map(([id, definition]) => ({ id, definition }));
}
