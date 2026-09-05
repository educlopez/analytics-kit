import type { AnalyticsErrorCode } from "@wingtics/core";
import {
  BUILTIN_DIMENSIONS,
  BUILTIN_METRICS,
  DATE_RANGE_PRESETS,
  TIME_GRANULARITIES,
} from "@wingtics/core";
import { CATALOG } from "../../src/catalog/items";
import { RATE_LIMIT } from "../../src/site/rate-limit";
import { version as CORE_VERSION } from "../../packages/core/package.json";
import { SITE_DESCRIPTION, SITE_URL, REPO_URL } from "../../src/site/meta";

/**
 * The HTTP surface this site actually exposes, and nothing else.
 *
 * Two things, both real: the shadcn component registry, and the analytics
 * proxy that `@wingtics/next` mounts. There is no product API beyond them, so
 * the spec does not invent one — a spec describing endpoints that do not exist
 * is worse for an agent than no spec.
 *
 * Every enum is read from the source of truth rather than typed out here. The
 * first draft of this file listed `page`, `utmSource`, `event` and `duration`,
 * none of which exist — the contract calls them `path`, `source`, `eventName`
 * and `avgDuration` — and it omitted four dimensions, two granularities and
 * four range presets. A spec that advertises fields the API rejects is worse
 * than no spec, so the values come from `@wingtics/core` and the catalog, and
 * a test pins them to it.
 */
export const dynamic = "force-static";

const REGISTRY_ITEMS = CATALOG.map((item) => item.registry ?? item.slug).sort();

/**
 * `ConnectorCapabilities` states support per id — `{ visitors: true, events: false }` —
 * not as a list of the supported ones. The first version of this schema said
 * `array of string` for both maps and named a `granularities` field the contract
 * does not have, so an agent generating a call from the spec parsed the real
 * response wrong. The enums here were already read from the source of truth;
 * the shape around them was not.
 */
/**
 * Every `code` a caller can receive: the connector's own, from
 * `AnalyticsErrorCode`, plus the ones the transport raises before a connector
 * is reached. Listing them by hand is how `ENDPOINT_NOT_FOUND` shipped without
 * reaching the spec, so `AssertCoversConnectorCodes` below fails the build if
 * core ever adds a code that is not here.
 */
const ERROR_CODES = [
  "UNSUPPORTED",
  "AUTH",
  "RATE_LIMIT",
  "NETWORK",
  "INVALID_QUERY",
  "PROVIDER",
  // Raised by the route handler, not by a connector.
  "METHOD_NOT_ALLOWED",
  "ENDPOINT_NOT_FOUND",
  "INTERNAL",
] as const;

type AssertCoversConnectorCodes = AnalyticsErrorCode extends (typeof ERROR_CODES)[number]
  ? true
  : [
      "missing error code in ERROR_CODES",
      Exclude<AnalyticsErrorCode, (typeof ERROR_CODES)[number]>,
    ];
const _errorCodesCoverContract: AssertCoversConnectorCodes = true;
void _errorCodesCoverContract;

function supportMap(ids: readonly string[], what: string) {
  return {
    type: "object",
    description: `Whether this provider can answer each ${what}. An absent key means no.`,
    properties: Object.fromEntries(ids.map((id) => [id, { type: "boolean" }])),
    additionalProperties: false,
  };
}

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Wingtics",
    // Read from the package, not typed out: this said 0.6.1 while the
    // packages were on 0.7.0 — the same drift this file has been bitten by
    // twice before, once for enums and once for the response shape.
    version: CORE_VERSION,
    summary: "Component registry and analytics proxy for the Wingtics kit.",
    description: [
      SITE_DESCRIPTION,
      "",
      "Two surfaces are exposed over HTTP: the shadcn-compatible component registry served from this site, and the analytics proxy that `@wingtics/next` mounts inside a consumer's own application. The proxy is documented here because its contract is part of the packages — this site runs one instance of it against its own analytics.",
      "",
      "## Versioning",
      "",
      "Pin `/api/v1/`. A change that breaks a caller becomes `/api/v2/`; the previous major keeps answering for at least 6 months from the day its successor ships, and every response on it carries `Deprecation: true` and a `Sunset` date in HTTP-date form from that day. Additive changes — a new field, a new optional parameter, a new enum member — happen in place and do not move the version, so parse defensively.",
      "",
      "`/api/analytics`, without a version, is an alias that always tracks the newest major. It is not deprecated and is not going away; it is the wrong thing to build against precisely because it moves. Pin the versioned path if you want a contract that does not.",
      "",
      "## Rate limits",
      `Every response carries \`RateLimit-Limit\`, \`RateLimit-Remaining\`, \`RateLimit-Reset\` and \`RateLimit-Policy\`, so a caller can pace itself before it is refused rather than after. Over budget answers 429 with \`Retry-After\`, in the same JSON error shape as every other failure.`,
      "",
      `The limit is ${RATE_LIMIT.limit} requests per ${RATE_LIMIT.window} seconds per client address. Counters are held per serving instance, so the effective ceiling across a deployment is that figure times the number of warm instances: treat the advertised number as a floor you can rely on, not a quota being metered exactly.`,
    ].join("\n"),
    license: { name: "MIT", identifier: "MIT" },
    contact: { name: "Issues", url: `${REPO_URL}/issues` },
  },
  servers: [{ url: SITE_URL, description: "This site" }],
  tags: [
    { name: "registry", description: "shadcn-compatible component registry." },
    { name: "analytics", description: "Provider-agnostic analytics proxy." },
  ],
  paths: {
    "/r/registry.json": {
      get: {
        operationId: "getRegistryIndex",
        tags: ["registry"],
        summary: "List every registry item",
        description:
          "The shadcn registry index. Each entry names an item that can be installed as source with `pnpm dlx shadcn@latest add <url>`.",
        responses: {
          "200": {
            description: "The registry index.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RegistryIndex" } },
            },
          },
          "500": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/r/{item}.json": {
      get: {
        operationId: "getRegistryItem",
        tags: ["registry"],
        summary: "Fetch one registry item",
        description:
          "A single shadcn registry item: its files, its npm dependencies, and any other registry items it depends on.",
        parameters: [
          {
            name: "item",
            in: "path",
            required: true,
            description: "Registry item name.",
            schema: { type: "string", enum: REGISTRY_ITEMS },
          },
        ],
        responses: {
          "200": {
            description: "The item.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RegistryItem" } },
            },
          },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/api/v1/analytics": {
      get: {
        operationId: "getConnectorCapabilities",
        tags: ["analytics"],
        summary: "Describe the connector behind this endpoint",
        description:
          "Returns the connector's id, display name and capabilities. Read this before querying: capabilities say which metrics and dimensions the provider can answer, and a query asking for more comes back as UNSUPPORTED rather than as zeros.",
        responses: {
          "200": {
            description: "Connector description.",
            headers: {
              "RateLimit-Limit": { $ref: "#/components/headers/RateLimit-Limit" },
              "RateLimit-Remaining": { $ref: "#/components/headers/RateLimit-Remaining" },
              "RateLimit-Reset": { $ref: "#/components/headers/RateLimit-Reset" },
              "RateLimit-Policy": { $ref: "#/components/headers/RateLimit-Policy" },
            },
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Connector" } },
            },
          },
          "405": { $ref: "#/components/responses/Error" },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/Error" },
        },
      },
      post: {
        operationId: "runAnalyticsQuery",
        tags: ["analytics"],
        summary: "Run a provider-agnostic analytics query",
        description:
          "Posts an AnalyticsQuery and returns totals, an optional time series and optional breakdowns. The same body works against every connector; what changes is which fields the provider can fill in.",
        parameters: [
          {
            name: "realtime",
            in: "query",
            required: false,
            description:
              "Set to `1` to read the realtime visitor count instead of running a query.",
            schema: { type: "string", enum: ["1"] },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AnalyticsQuery" } },
          },
        },
        responses: {
          "200": {
            description: "Query result.",
            headers: {
              "RateLimit-Limit": { $ref: "#/components/headers/RateLimit-Limit" },
              "RateLimit-Remaining": { $ref: "#/components/headers/RateLimit-Remaining" },
              "RateLimit-Reset": { $ref: "#/components/headers/RateLimit-Reset" },
              "RateLimit-Policy": { $ref: "#/components/headers/RateLimit-Policy" },
            },
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AnalyticsResult" } },
            },
          },
          "400": { $ref: "#/components/responses/Error" },
          "401": { $ref: "#/components/responses/Error" },
          "405": { $ref: "#/components/responses/Error" },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/Error" },
          "502": { $ref: "#/components/responses/Error" },
        },
      },
    },
  },
  components: {
    headers: {
      "RateLimit-Limit": {
        description: "Requests allowed per window.",
        schema: { type: "integer", example: RATE_LIMIT.limit },
      },
      "RateLimit-Remaining": {
        description: "Requests left in the current window. Pace yourself on this.",
        schema: { type: "integer", example: RATE_LIMIT.limit - 1 },
      },
      "RateLimit-Reset": {
        description: "Seconds until the window resets.",
        schema: { type: "integer", example: RATE_LIMIT.window },
      },
      "RateLimit-Policy": {
        description: "The policy in force, as quota and window.",
        schema: {
          type: "string",
          example: `"${RATE_LIMIT.policy}";q=${RATE_LIMIT.limit};w=${RATE_LIMIT.window}`,
        },
      },
    },
    responses: {
      RateLimited: {
        description:
          "Over budget. The body is the usual error shape with code RATE_LIMIT; `Retry-After` says how long to wait.",
        headers: {
          "Retry-After": {
            description: "Seconds to wait before retrying.",
            schema: { type: "integer", example: RATE_LIMIT.window },
          },
          "RateLimit-Limit": { $ref: "#/components/headers/RateLimit-Limit" },
          "RateLimit-Remaining": { $ref: "#/components/headers/RateLimit-Remaining" },
          "RateLimit-Reset": { $ref: "#/components/headers/RateLimit-Reset" },
          "RateLimit-Policy": { $ref: "#/components/headers/RateLimit-Policy" },
        },
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Error: {
        description:
          "Every failure answers in this shape: a message, a code to branch on, and a hint describing what to do about it.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string", description: "Human-readable message." },
          code: {
            type: "string",
            description: "Stable code to branch on.",
            enum: [...ERROR_CODES],
          },
          hint: { type: "string", description: "What a caller can do about it." },
        },
      },
      Connector: {
        type: "object",
        required: ["id", "name", "capabilities"],
        properties: {
          id: { type: "string", example: "vercel" },
          name: { type: "string", example: "Vercel Analytics" },
          capabilities: {
            type: "object",
            description:
              "What this provider can answer. `metrics` and `dimensions` are maps, " +
              "not lists: a provider states a verdict for each one, and an absent key " +
              "means the same as false.",
            required: [
              "metrics",
              "dimensions",
              "granularity",
              "filters",
              "realtime",
              "previousPeriod",
            ],
            properties: {
              metrics: supportMap(BUILTIN_METRICS, "metric"),
              dimensions: supportMap(BUILTIN_DIMENSIONS, "dimension"),
              granularity: {
                type: "array",
                description: "Buckets this provider can group a time series into.",
                items: { type: "string", enum: [...TIME_GRANULARITIES] },
              },
              filters: { type: "boolean" },
              realtime: { type: "boolean" },
              previousPeriod: { type: "boolean" },
              presets: {
                type: "array",
                description: "Named ranges, when the provider restricts them.",
                items: { type: "string", enum: [...DATE_RANGE_PRESETS] },
              },
            },
          },
        },
      },
      AnalyticsQuery: {
        type: "object",
        required: ["metrics"],
        properties: {
          metrics: {
            type: "array",
            minItems: 1,
            items: { type: "string", enum: [...BUILTIN_METRICS] },
            description:
              "Metrics to total, and to plot when a granularity is given. Custom metrics registered with `registerMetric` are also accepted.",
          },
          dimensions: {
            type: "array",
            items: { type: "string", enum: [...BUILTIN_DIMENSIONS] },
            description:
              "Group by these. One breakdown is returned per dimension. Custom dimensions registered with `registerDimension` are also accepted.",
          },
          range: {
            description: "A preset window or an explicit pair of ISO dates.",
            oneOf: [
              { type: "string", enum: [...DATE_RANGE_PRESETS] },
              {
                type: "object",
                required: ["from", "to"],
                properties: {
                  from: { type: "string", format: "date" },
                  to: { type: "string", format: "date" },
                },
              },
            ],
          },
          granularity: {
            type: "string",
            enum: [...TIME_GRANULARITIES],
            description: "Omit for totals only; set to also get a series.",
          },
          limit: { type: "integer", minimum: 1, description: "Rows per breakdown." },
          includePrevious: {
            type: "boolean",
            description: "Also return the preceding window, for deltas.",
          },
        },
      },
      AnalyticsResult: {
        type: "object",
        required: ["totals", "meta"],
        properties: {
          totals: { type: "object", additionalProperties: { type: "number" } },
          series: {
            type: "array",
            items: {
              type: "object",
              required: ["date", "values"],
              properties: {
                date: { type: "string" },
                values: { type: "object", additionalProperties: { type: "number" } },
              },
            },
          },
          breakdown: {
            type: "array",
            items: {
              type: "object",
              required: ["key", "values"],
              properties: {
                key: { type: "string" },
                label: { type: "string" },
                values: { type: "object", additionalProperties: { type: "number" } },
              },
            },
          },
          previous: {
            type: "object",
            description: "The preceding window, when includePrevious was set.",
          },
          meta: {
            type: "object",
            required: ["connectorId"],
            properties: {
              connectorId: { type: "string" },
              sample: {
                type: "boolean",
                description: "True when the numbers are sample data, not the real site's.",
              },
            },
          },
        },
      },
      RegistryIndex: {
        type: "object",
        properties: {
          name: { type: "string" },
          homepage: { type: "string", format: "uri" },
          items: { type: "array", items: { $ref: "#/components/schemas/RegistryItem" } },
        },
      },
      RegistryItem: {
        type: "object",
        properties: {
          name: { type: "string", enum: REGISTRY_ITEMS },
          type: { type: "string", example: "registry:ui" },
          description: { type: "string" },
          dependencies: { type: "array", items: { type: "string" } },
          registryDependencies: { type: "array", items: { type: "string", format: "uri" } },
          files: { type: "array", items: { type: "object" } },
        },
      },
    },
  },
  externalDocs: { url: `${SITE_URL}/docs`, description: "Docs" },
} as const;

export async function GET() {
  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
