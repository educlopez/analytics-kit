import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WidgetFrame } from "@wingtics/react";
import { config as proxyConfig, prefersMarkdown } from "../../proxy";
import { MARKDOWN_PATHS, markdownFor } from "./markdown";
import { CATALOG } from "../catalog/items";
import {
  BUILTIN_DIMENSIONS,
  BUILTIN_METRICS,
  DATE_RANGE_PRESETS,
  TIME_GRANULARITIES,
} from "@wingtics/core";

describe("Accept negotiation", () => {
  it("serves markdown only when the client actually asked for it", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.5")).toBe(true);
    // A tie goes to markdown: listing it explicitly is the signal.
    expect(prefersMarkdown("text/markdown, text/html")).toBe(true);
    expect(prefersMarkdown("text/plain")).toBe(true);
  });

  it("leaves a browser on HTML", () => {
    // What Chrome actually sends.
    expect(
      prefersMarkdown("text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8"),
    ).toBe(false);
    expect(prefersMarkdown("text/html")).toBe(false);
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
    expect(prefersMarkdown("")).toBe(false);
  });

  it("honours an explicit refusal of markdown", () => {
    expect(prefersMarkdown("text/markdown;q=0, text/html")).toBe(false);
  });

  it("ranks by q value rather than by order", () => {
    expect(prefersMarkdown("text/html;q=0.9, text/markdown;q=0.8")).toBe(false);
    expect(prefersMarkdown("text/html;q=0.8, text/markdown;q=0.9")).toBe(true);
  });
});

describe("markdown representations", () => {
  it("answers every path it advertises, and nothing else", () => {
    for (const path of MARKDOWN_PATHS) {
      const body = markdownFor(path);
      expect(body, path).toBeTruthy();
      // A hollow stub is worse than no markdown at all.
      expect(body!.length, path).toBeGreaterThan(200);
      expect(body!.startsWith("# "), path).toBe(true);
    }
    expect(markdownFor("/docs")).toBeNull();
    expect(markdownFor("/nope")).toBeNull();
    expect(markdownFor("/components/not-a-component")).toBeNull();
  });

  it("covers every catalog component", () => {
    expect(MARKDOWN_PATHS).toHaveLength(CATALOG.length + 2);
    for (const item of CATALOG) {
      expect(markdownFor(`/components/${item.slug}`)).toContain(item.component);
    }
  });

  it("derives the component page from the catalog rather than restating it", () => {
    const item = CATALOG.find((i) => i.variants.length > 1)!;
    const body = markdownFor(`/components/${item.slug}`)!;
    expect(body).toContain(item.blurb);
    for (const variant of item.variants) expect(body).toContain(variant);
    expect(body).toContain("wingtics.com/r/");
  });

  it("never leaks the old brand", () => {
    for (const path of MARKDOWN_PATHS) {
      expect(markdownFor(path)).not.toMatch(/analytics-kit|Analytics Kit/);
    }
  });
});

describe("widget heading level", () => {
  it("defaults to h3 so existing markup does not move", () => {
    const html = renderToStaticMarkup(
      createElement(WidgetFrame, { title: "Visitors", status: "success" }),
    );
    expect(html).toContain('<h3 class="ak-widget-title">');
  });

  it("follows the host when the page needs a different level", () => {
    // The hero drops a metric card straight under the page h1; h3 there is a
    // skipped level, which is the accessibility defect this prop exists for.
    const html = renderToStaticMarkup(
      createElement(WidgetFrame, { title: "Visitors", status: "success", headingLevel: 2 }),
    );
    expect(html).toContain('<h2 class="ak-widget-title">');
    expect(html).not.toContain("<h3");
  });
});

describe("Accept specificity, per RFC 9110", () => {
  // Found in review: taking the highest weight anywhere in the header instead
  // of the most specific matching range hands HTML to a client that explicitly
  // asked for markdown at a lower q.
  it("lets an exact range beat a wildcard with a higher q", () => {
    expect(prefersMarkdown("text/markdown;q=0.8, text/html;q=0.7, text/*;q=1")).toBe(true);
    expect(prefersMarkdown("text/markdown;q=0.4, text/html;q=0.9, text/*;q=1")).toBe(false);
  });

  it("does not turn a bare wildcard into a markdown request", () => {
    // */* tolerates markdown but did not ask for it. Serving markdown to
    // everything that sends */* would break plain HTTP clients.
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown("text/*")).toBe(false);
  });

  it("reads markdown named only through a group wildcard as tolerance, not preference", () => {
    expect(prefersMarkdown("text/*;q=1, application/json;q=0.5")).toBe(false);
  });
});

/** Only the parts of the document these tests assert on. */
interface SpecOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: { schema: { enum: string[] } }[];
}

interface Spec {
  paths: Record<string, Record<string, SpecOperation>>;
  components: {
    schemas: {
      AnalyticsQuery: {
        properties: {
          metrics: { items: { enum: string[] } };
          dimensions: { items: { enum: string[] } };
          granularity: { enum: string[] };
          range: { oneOf: { enum?: string[] }[] };
        };
      };
    };
  };
}

async function loadSpec(): Promise<Spec> {
  const { GET } = await import("../../app/openapi.json/route");
  return (await (await GET()).json()) as Spec;
}

describe("openapi spec", () => {
  // The first draft of the spec typed its enums out by hand and got four value
  // names wrong and ten values missing, advertising fields the API rejects.
  // These pin every enum to the contract it describes.
  it("takes its enums from the contract, not from prose", async () => {
    const spec = await loadSpec();
    const query = spec.components.schemas.AnalyticsQuery.properties;

    expect(query.metrics.items.enum).toEqual([...BUILTIN_METRICS]);
    expect(query.dimensions.items.enum).toEqual([...BUILTIN_DIMENSIONS]);
    expect(query.granularity.enum).toEqual([...TIME_GRANULARITIES]);
    expect(query.range.oneOf[0].enum).toEqual([...DATE_RANGE_PRESETS]);

    // The names that were wrong, named explicitly so a regression is obvious.
    expect(query.dimensions.items.enum).toContain("path");
    expect(query.dimensions.items.enum).not.toContain("page");
    expect(query.metrics.items.enum).toContain("avgDuration");
    expect(query.metrics.items.enum).not.toContain("duration");
  });

  it("describes every operation uniquely, which is what function calling needs", async () => {
    const spec = await loadSpec();
    const operations = Object.values(spec.paths).flatMap((path) => Object.values(path));

    expect(operations.length).toBeGreaterThan(2);
    const ids = operations.map((op) => op.operationId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const op of operations) {
      expect(op.operationId, JSON.stringify(op.summary)).toBeTruthy();
      expect(op.description, op.operationId).toBeTruthy();
    }
  });

  it("only advertises registry items that exist", async () => {
    const spec = await loadSpec();
    const advertised = spec.paths["/r/{item}.json"].get.parameters![0].schema.enum;
    const real = CATALOG.map((item) => item.registry ?? item.slug).sort();
    expect(advertised).toEqual(real);
  });
});

/**
 * The matcher decides which paths can negotiate markdown at all. Getting it
 * wrong is silent in both directions: too narrow and an agent asking for
 * markdown on a missing path gets a 63KB HTML shell it cannot recover from;
 * too wide and a real page like /about answers a markdown request with a
 * "not found" stub, which is worse than never offering negotiation.
 */
describe("proxy matcher", () => {
  /** Next matches a matcher string against the pathname; `:param` is one segment. */
  const matches = (pathname: string) =>
    proxyConfig.matcher.some((pattern) => {
      const source = pattern.replace(/:[a-zA-Z]+\*/g, ".*").replace(/:[a-zA-Z]+/g, "[^/]+");
      return new RegExp(`^${source}$`).test(pathname);
    });

  it("covers the paths that have a markdown variant", () => {
    for (const path of ["/", "/components", "/components/globe-chart"]) {
      expect(matches(path), path).toBe(true);
    }
  });

  it("covers unknown paths, so they can answer with the markdown 404", () => {
    for (const path of ["/no-such-page", "/deeply/nested/nothing", "/Components"]) {
      expect(matches(path), path).toBe(true);
    }
  });

  // Each of these renders real HTML. Rewriting them to /md would answer a
  // markdown request with a "not found" stub for a page that exists.
  it("leaves the prose pages alone", () => {
    for (const path of ["/about", "/contact", "/privacy", "/docs", "/demo"]) {
      expect(matches(path), path).toBe(false);
    }
  });

  it("leaves the API, the markdown route and Next internals alone", () => {
    for (const path of [
      "/api/analytics",
      "/api/does-not-exist",
      "/md/components",
      "/_next/static/chunk.js",
    ]) {
      expect(matches(path), path).toBe(false);
    }
  });

  // Anything with a dot: the machine-readable files and every static asset.
  it("leaves the machine-readable files alone", () => {
    for (const path of ["/openapi.json", "/llms.txt", "/sitemap.xml", "/robots.txt", "/og.png"]) {
      expect(matches(path), path).toBe(false);
    }
  });
});
