export const BUILTIN_DIMENSIONS = [
  "path",
  "referrer",
  "country",
  "device",
  "browser",
  "os",
  "source",
  "medium",
  "campaign",
  "eventName",
  "host",
] as const;

export const TIME_GRANULARITIES = ["hour", "day", "week", "month"] as const;

export type BuiltinDimension = (typeof BUILTIN_DIMENSIONS)[number];
export type TimeGranularity = (typeof TIME_GRANULARITIES)[number];

export interface DimensionDefinition {
  label: string;
  kind: "category" | "time";
  description?: string;
}

/**
 * Augment to add custom dimensions:
 *
 * declare module "@wingtics/core" {
 *   interface DimensionCatalog {
 *     plan: DimensionDefinition;
 *   }
 * }
 */
export interface DimensionCatalog {
  path: DimensionDefinition;
  referrer: DimensionDefinition;
  country: DimensionDefinition;
  device: DimensionDefinition;
  browser: DimensionDefinition;
  os: DimensionDefinition;
  source: DimensionDefinition;
  medium: DimensionDefinition;
  campaign: DimensionDefinition;
  eventName: DimensionDefinition;
  host: DimensionDefinition;
}

export type DimensionId = keyof DimensionCatalog | (string & {});

export const defaultDimensionCatalog: {
  [K in BuiltinDimension]: DimensionDefinition;
} = {
  path: { label: "Page", kind: "category" },
  referrer: { label: "Referrer", kind: "category" },
  country: { label: "Country", kind: "category" },
  device: { label: "Device", kind: "category" },
  browser: { label: "Browser", kind: "category" },
  os: { label: "OS", kind: "category" },
  source: { label: "Source", kind: "category" },
  medium: { label: "Medium", kind: "category" },
  campaign: { label: "Campaign", kind: "category" },
  eventName: { label: "Event", kind: "category" },
  host: { label: "Host", kind: "category" },
};

const dimensionRegistry = new Map<string, DimensionDefinition>(
  Object.entries(defaultDimensionCatalog),
);

export function registerDimension(id: string, definition: DimensionDefinition): void {
  dimensionRegistry.set(id, definition);
}

export function getDimension(id: string): DimensionDefinition | undefined {
  return dimensionRegistry.get(id);
}

export function listDimensions(): Array<{
  id: string;
  definition: DimensionDefinition;
}> {
  return [...dimensionRegistry.entries()].map(([id, definition]) => ({
    id,
    definition,
  }));
}
