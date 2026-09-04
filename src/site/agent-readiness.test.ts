import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WidgetFrame } from "@wingtics/react";
import { prefersMarkdown } from "../../middleware";
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

describe("openapi spec", () => {
  // The first draft of the spec typed its enums out by hand and got four value
  // names wrong and ten values missing, advertising fields the API rejects.
  // These pin every enum to the contract it describes.
  it("takes its enums from the contract, not from prose", async () => {
    const { GET } = await import("../../app/openapi.json/route");
    const spec = (await (await GET()).json()) as Record<string, any>;
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
    const { GET } = await import("../../app/openapi.json/route");
    const spec = (await (await GET()).json()) as Record<string, any>;
    const operations = Object.values(spec.paths).flatMap((path: any) =>
      Object.values(path),
    ) as any[];

    expect(operations.length).toBeGreaterThan(2);
    const ids = operations.map((op) => op.operationId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const op of operations) {
      expect(op.operationId, JSON.stringify(op.summary)).toBeTruthy();
      expect(op.description, op.operationId).toBeTruthy();
    }
  });

  it("only advertises registry items that exist", async () => {
    const { GET } = await import("../../app/openapi.json/route");
    const spec = (await (await GET()).json()) as Record<string, any>;
    const advertised: string[] = spec.paths["/r/{item}.json"].get.parameters[0].schema.enum;
    const real = CATALOG.map((item) => item.registry ?? item.slug).sort();
    expect(advertised).toEqual(real);
  });
});
