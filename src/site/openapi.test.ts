import { describe, expect, it } from "vitest";
import { createWingticsMockConnector } from "@wingtics/connector-mock";
import { GET } from "../../app/openapi.json/route";

/**
 * The spec has to describe the response the API actually sends.
 *
 * It did not. `capabilities.metrics` and `capabilities.dimensions` were typed
 * `array of string` while the contract states support per id — a map of
 * `{ visitors: true, events: false }` — and the spec named a `granularities`
 * field that does not exist, while omitting `filters` and `previousPeriod`
 * which do. An agent generating a call from that spec parses the real body
 * wrong, which is worse than having no spec at all.
 *
 * Comparing against a real connector is the only check that catches this
 * class: the enums were already read from the source of truth, and the shape
 * around them still drifted.
 */
const spec = JSON.parse(await (await GET()).text());

const resolve = (node: unknown): Record<string, unknown> => {
  const ref = (node as { $ref?: string })?.$ref;
  if (!ref) return node as Record<string, unknown>;
  const target = ref
    .replace(/^#\//, "")
    .split("/")
    .reduce<Record<string, unknown>>((acc, key) => acc[key] as Record<string, unknown>, spec);
  return resolve(target);
};

describe("openapi describes the real response", () => {
  const connector = createWingticsMockConnector({ profile: "vercel" });
  const capabilities = connector.capabilities as unknown as Record<string, unknown>;
  const schema = resolve(spec.components.schemas.Connector).properties as Record<string, never>;
  const caps = (schema.capabilities as { properties: Record<string, { type: string }> }).properties;

  it("names every capability the connector reports, and no phantom ones", () => {
    const sent = Object.entries(capabilities)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key)
      .sort();
    expect(Object.keys(caps).sort()).toEqual(expect.arrayContaining(sent));
    // The reverse: a field in the spec that the connector never sends is a
    // promise the API does not keep. `presets` is optional in the contract.
    for (const declared of Object.keys(caps)) {
      if (declared === "presets") continue;
      expect(capabilities, `spec declares capabilities.${declared}`).toHaveProperty(declared);
    }
  });

  it("gives each capability the JSON type the connector actually sends", () => {
    for (const [key, value] of Object.entries(capabilities)) {
      // An optional field the connector leaves undefined never reaches the
      // wire — JSON drops it — so the spec cannot be wrong about its type.
      if (value === undefined) continue;
      const declared = caps[key]?.type;
      const actual = Array.isArray(value) ? "array" : typeof value;
      expect(declared, `capabilities.${key}`).toBe(actual);
    }
  });

  it("lists the metric and dimension ids the connector answers for", () => {
    for (const which of ["metrics", "dimensions"] as const) {
      const declared = Object.keys(
        (caps[which] as unknown as { properties: Record<string, unknown> }).properties,
      ).sort();
      expect(Object.keys(capabilities[which] as object).sort(), which).toEqual(declared);
    }
  });
});

describe("openapi types every failure", () => {
  it("gives every non-2xx response the Error schema", () => {
    const untyped: string[] = [];
    for (const [path, operations] of Object.entries(spec.paths as Record<string, object>)) {
      for (const [method, operation] of Object.entries(operations)) {
        for (const [code, response] of Object.entries(
          (operation as { responses: Record<string, unknown> }).responses,
        )) {
          if (code.startsWith("2")) continue;
          const schema = (resolve(response) as { content?: Record<string, { schema?: unknown }> })
            .content?.["application/json"]?.schema;
          if (!schema || resolve(schema) !== resolve(spec.components.schemas.Error)) {
            untyped.push(`${method.toUpperCase()} ${path} ${code}`);
          }
        }
      }
    }
    expect(untyped).toEqual([]);
  });
});
