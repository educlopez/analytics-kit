/**
 * Production smoke check against a real `next start` build.
 *
 * What this catches, none of which the dev server surfaces:
 *   - hydration mismatches (locale-dependent number formatting, elements React
 *     cannot round-trip with multiple text children)
 *   - React key warnings from custom recharts dot renderers
 *   - pages that 404 or 500 once built
 *   - the page body scrolling sideways
 *   - the metadata routes, which only exist in a built app at all, and whether
 *     og:image came out absolute — relative is what silently kills every social
 *     preview
 *
 * What this does NOT catch: marks stuck at their recharts mount-animation
 * first frame. That bug needs a *hidden* tab, where Chrome pauses
 * requestAnimationFrame so the animation never advances. Headless Chromium
 * always reports `visible` and completes the animation immediately, and
 * bringToFront does not change that — verified, not assumed. The guard for that
 * class is the static invariant in charts/animation.test.ts, which is
 * mutation-tested. The stuck-mark probe below is kept as cheap belt and braces,
 * not as the guard.
 *
 * Usage: node scripts/smoke.mjs [baseUrl]
 */
import { chromium } from "playwright";

import { varies } from "../src/site/vary.mjs";

const BASE = process.argv[2] ?? "http://localhost:3100";
/**
 * One pass runs the browser in a non-English locale on purpose. Server-rendered
 * numbers are formatted by Node; if any of them uses the runtime's locale
 * instead of a pinned one, the browser formats them differently and React
 * throws a hydration mismatch. With both sides in en-US the bug is invisible,
 * which is how it shipped.
 */
const PASSES = [
  // 320px is the narrowest viewport worth supporting, and nothing used to run
  // there: a fixed-width sidebar pushed the document 32px sideways on every
  // component page and both other passes were too wide to see it.
  { width: 320, locale: "en-US" },
  { width: 390, locale: "en-US" },
  { width: 1440, locale: "de-DE" },
];

/** Pages worth loading: the index that renders every mark, plus a few details. */
const PATHS = [
  "/",
  "/components",
  "/components/area-chart",
  "/components/line-chart",
  "/components/horizon-chart",
  "/components/cohort-grid",
  "/components/treemap-chart",
  // The widest row layout in the catalog — label plus three numeric columns —
  // so it is the first thing to overflow a 390px viewport.
  "/components/breakdown-card",
  // WebGL on a canvas the page sizes itself, and a tab row that has to collapse
  // from four columns to four rows — both fail in ways only a real load shows.
  "/components/globe-chart",
  "/components/metric-tabs",
  "/docs",
  "/about",
  "/contact",
  "/privacy",
];

const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`  ✗ ${message}`);
}

/** Marks stuck at animation frame zero: a near-zero clip, or a dash stub. */
async function stuckMarks(page) {
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(".ak-rechart")) {
      const card = el.closest("a,article,li,section");
      const heading = card?.querySelector("h1,h2,h3,strong");
      const name = (heading?.textContent ?? "chart").trim().slice(0, 24);

      for (const rect of el.querySelectorAll("clipPath rect")) {
        const width = Number(rect.getAttribute("width"));
        // Zero is included deliberately: it is the most common stuck value, and
        // excluding it is what let this check pass against a reintroduced bug.
        if (Number.isFinite(width) && width < 5) {
          out.push(`${name}: clipPath width ${width.toFixed(2)}`);
        }
      }
      for (const curve of el.querySelectorAll(".recharts-line-curve,.recharts-area-curve")) {
        const dash = getComputedStyle(curve).strokeDasharray;
        if (!dash || dash === "none") continue;
        const parts = dash.split(",").map((value) => parseFloat(value));
        // A mount animation leaves a tiny dash next to a huge gap. A styled
        // dashed variant uses two comparable, small numbers.
        if (parts.length === 2 && parts[0] < 6 && parts[1] > 100) {
          out.push(`${name}: stroke-dasharray ${dash}`);
        }
      }
    }
    return out;
  });
}

async function run() {
  const browser = await chromium.launch();
  try {
    for (const { width, locale } of PASSES) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale });
      const page = await context.newPage();

      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (/Hydration failed|did not match|unique "key"/i.test(text)) {
          consoleErrors.push(text.split("\n")[0].slice(0, 160));
        }
      });
      page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

      for (const path of PATHS) {
        consoleErrors.length = 0;
        const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
        console.log(`[${width} ${locale}] ${path}`);

        if (!response || !response.ok()) {
          fail(`[${width} ${locale}] ${path} responded ${response?.status() ?? "no response"}`);
          continue;
        }

        // Charts mount lazily in some cards; give them a beat to paint.
        await page.waitForTimeout(1200);

        for (const mark of await stuckMarks(page)) {
          fail(`[${width} ${locale}] ${path} — blank mark — ${mark}`);
        }

        // Naming the element matters more than the number: text metrics differ
        // between this machine and CI, so an overflow can reproduce only there,
        // and "4px" alone gives the next person nothing to look at.
        const overflow = await page.evaluate(() => {
          const px = document.body.scrollWidth - document.body.clientWidth;
          if (px <= 2) return { px, culprits: [] };
          const doc = document.documentElement;
          const limit = doc.clientWidth;
          // An element wider than the viewport only pushes the page when no
          // ancestor clips or scrolls it — otherwise every code block inside
          // an overflow-x:auto wrapper would be reported.
          const contained = (el) => {
            for (let p = el.parentElement; p && p !== doc; p = p.parentElement) {
              const ox = getComputedStyle(p).overflowX;
              if (ox === "auto" || ox === "scroll" || ox === "hidden") return true;
            }
            return false;
          };
          const culprits = [];
          for (const el of document.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.right <= limit + 0.5) continue;
            if (contained(el)) continue;
            if (culprits.some((c) => c.el.contains(el))) continue; // outermost only
            culprits.push({ el, right: Math.round(r.right), width: Math.round(r.width) });
          }
          return {
            px,
            culprits: culprits.slice(0, 3).map((c) => {
              const cls = (c.el.className?.baseVal ?? c.el.className ?? "").toString();
              return (
                `<${c.el.tagName.toLowerCase()}> right=${c.right} w=${c.width}` +
                ` "${(c.el.textContent ?? "").trim().slice(0, 30)}"` +
                (cls ? ` .${cls.slice(0, 70)}` : "")
              );
            }),
          };
        });
        if (overflow.px > 2) {
          const who = overflow.culprits.length
            ? ` — ${overflow.culprits.join(" | ")}`
            : " — no uncontained element found; likely an intrinsic min-width";
          fail(
            `[${width} ${locale}] ${path} — body scrolls horizontally by ${overflow.px}px${who}`,
          );
        }

        for (const error of consoleErrors) {
          fail(`[${width} ${locale}] ${path} — ${error}`);
        }
      }

      await context.close();
    }

    // Metadata routes: these only exist in a built app, so this is the only
    // place they get exercised.
    //
    // Checked by content rather than by byte count. A flat "at least 100 bytes"
    // floor looks like a size check but is really a check on how long the
    // canonical domain is: moving to a shorter one dropped robots.txt from 127
    // to 93 bytes with nothing wrong with it. What each route actually owes is
    // the one line that makes it useful.
    const META = {
      "/icon.svg": (text) => (text.includes("<svg") ? null : "no <svg> element"),
      "/apple-icon": (text) => (text.length > 500 ? null : "suspiciously small for an image"),
      "/opengraph-image": (text) => (text.length > 500 ? null : "suspiciously small for an image"),
      "/sitemap.xml": (text) =>
        text.includes("<urlset") && text.includes("<loc>") ? null : "no urlset or no <loc>",
      "/manifest.webmanifest": (text) => {
        try {
          return JSON.parse(text).name ? null : "manifest has no name";
        } catch {
          return "manifest is not valid JSON";
        }
      },
      // Absolute, because a relative Sitemap line is ignored by every crawler.
      "/robots.txt": (text) =>
        /^Sitemap:\s*https?:\/\/\S+\/sitemap\.xml$/m.test(text) ? null : "no absolute Sitemap line",
    };

    // Agent-facing surfaces. Every one of these is something a machine reads
    // and a person never sees, which is exactly why nothing else catches them.
    const AGENT = {
      "/openapi.json": (text) => {
        try {
          const spec = JSON.parse(text);
          if (!spec.openapi?.startsWith("3.")) return "not an OpenAPI 3 document";
          const ops = Object.values(spec.paths ?? {}).flatMap((p) => Object.values(p));
          if (!ops.length) return "no operations";
          const ids = ops.map((o) => o.operationId);
          if (ids.some((id) => !id)) return "an operation has no operationId";
          if (new Set(ids).size !== ids.length) return "duplicate operationId";
          if (ops.some((o) => !o.description)) return "an operation has no description";
          return null;
        } catch {
          return "not valid JSON";
        }
      },
      "/llms.txt": (text) =>
        text.includes("## When to use this") && text.includes("## Machine-readable")
          ? null
          : "missing when-to-use or machine-readable guidance",
    };

    for (const [path, check] of Object.entries({ ...META, ...AGENT })) {
      const response = await fetch(`${BASE}${path}`);
      if (!response.ok) {
        fail(`${path} responded ${response.status}`);
        continue;
      }
      const text = await response.text();
      const problem = check(text);
      if (problem) fail(`${path}: ${problem}`);
      console.log(`[meta] ${path} ${response.status} ${Buffer.byteLength(text)}B`);
    }

    // A 200 on an unknown path makes an agent believe every path exists.
    {
      const response = await fetch(`${BASE}/definitely-not-a-real-path-9f3a`);
      if (response.status !== 404) fail(`unknown path answered ${response.status}, not 404`);
      const body = await response.text();
      for (const pointer of ["/llms.txt", "/sitemap.xml", "/docs"]) {
        if (!body.includes(pointer)) fail(`404 body does not point at ${pointer}`);
      }
      console.log(`[meta] 404 ${response.status} ${Buffer.byteLength(body)}B`);
    }

    // Markdown negotiation, and the Vary that keeps a cache from mixing the
    // two variants.
    //
    // `Accept` has to be matched as a whole list member. The obvious
    // `/\baccept\b/i` also matches `Accept-Encoding` — `-` is a non-word
    // character, so the trailing `\b` closes — which made this assertion pass
    // on a response whose Vary never mentioned Accept at all. It sat here green
    // and vacuous.
    //
    // Only the markdown half is checked here: Next 16 replaces `vary` on page
    // responses, so the HTML half cannot carry Accept at all. See proxy.ts.
    // Whether negotiation survives on a real deployment is a different
    // question, and `next start` cannot answer it — scripts/edge-vary.mjs does.
    for (const path of ["/", "/components", "/components/globe-chart"]) {
      const md = await fetch(`${BASE}${path}`, { headers: { accept: "text/markdown" } });
      const type = md.headers.get("content-type") ?? "";
      const vary = md.headers.get("vary") ?? "";
      const body = await md.text();
      if (!type.includes("text/markdown")) fail(`${path} with Accept: text/markdown gave ${type}`);
      if (!varies(vary, "accept")) fail(`${path} markdown response has Vary: ${vary || "(none)"}`);
      if (!body.startsWith("# ")) fail(`${path} markdown does not start with a heading`);

      const html = await fetch(`${BASE}${path}`, { headers: { accept: "text/html" } });
      const htmlType = html.headers.get("content-type") ?? "";
      if (!htmlType.includes("text/html")) fail(`${path} with Accept: text/html gave ${htmlType}`);
      console.log(`[agent] ${path} md ${Buffer.byteLength(body)}B · html ok · Vary ok`);
    }

    // A path under /api that no route handles must still answer JSON. Falling
    // through to the HTML 404 hands a client that asked for JSON a 60KB page
    // shell, which reads as "there is no API here" rather than "wrong path".
    {
      for (const [path, method] of [
        ["/api/does-not-exist", "GET"],
        ["/api/nope/deeper", "POST"],
      ]) {
        const response = await fetch(`${BASE}${path}`, {
          method,
          headers: { accept: "application/json" },
        });
        const type = response.headers.get("content-type") ?? "";
        if (response.status !== 404) fail(`${method} ${path} answered ${response.status}, not 404`);
        if (!type.includes("application/json")) fail(`${method} ${path} answered ${type}`);
        const body = await response.json().catch(() => null);
        if (!body?.code) fail(`${method} ${path} has no error code`);
        if (!body?.hint) fail(`${method} ${path} has no hint`);
        console.log(`[agent] ${method} ${path} ${response.status} ${body?.code}`);
      }
    }

    // An agent asking for markdown on a missing path gets a short markdown
    // body it can act on, not the HTML shell. The HTML 404 is unchanged for
    // everyone else — both halves, because either one can regress alone.
    {
      const path = "/definitely-not-a-real-path-md";
      const md = await fetch(`${BASE}${path}`, { headers: { accept: "text/markdown" } });
      const type = md.headers.get("content-type") ?? "";
      const body = await md.text();
      if (md.status !== 404) fail(`${path} with Accept: text/markdown answered ${md.status}`);
      if (!type.includes("text/markdown")) fail(`${path} markdown 404 answered ${type}`);
      if (!varies(md.headers.get("vary") ?? "", "accept"))
        fail(`${path} markdown 404 has Vary: ${md.headers.get("vary") || "(none)"}`);
      if (!body.startsWith("# ")) fail(`${path} markdown 404 does not start with a heading`);
      for (const pointer of ["/llms.txt", "/sitemap.xml", "/docs"]) {
        if (!body.includes(pointer)) fail(`${path} markdown 404 does not point at ${pointer}`);
      }
      if (body.length > 1000) fail(`${path} markdown 404 is ${body.length}B, not a short body`);

      const html = await fetch(`${BASE}${path}`, { headers: { accept: "text/html" } });
      if (html.status !== 404) fail(`${path} with Accept: text/html answered ${html.status}`);
      if (!(html.headers.get("content-type") ?? "").includes("text/html"))
        fail(`${path} html 404 stopped being HTML`);
      console.log(`[agent] 404 md ${Buffer.byteLength(body)}B · html ok`);
    }

    // A page that exists must not answer a markdown request with the stub.
    for (const path of ["/about", "/contact", "/privacy", "/docs"]) {
      const response = await fetch(`${BASE}${path}`, { headers: { accept: "text/markdown" } });
      if (response.status !== 200 || !(response.headers.get("content-type") ?? "").includes("html"))
        fail(`${path} answered ${response.status} ${response.headers.get("content-type")}`);
    }

    // Every API failure has to be JSON an agent can branch on.
    {
      const response = await fetch(`${BASE}/api/analytics`, { method: "DELETE" });
      const type = response.headers.get("content-type") ?? "";
      if (response.status !== 405) fail(`DELETE /api/analytics answered ${response.status}`);
      if (!type.includes("application/json")) fail(`405 answered ${type}, not JSON`);
      const body = await response.json().catch(() => null);
      if (!body?.code || !body?.hint) fail("405 JSON has no code or hint");
      console.log(`[agent] /api/analytics DELETE ${response.status} ${body?.code}`);
    }

    // The one thing that silently breaks every social preview.
    const html = await (await fetch(`${BASE}/`)).text();
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    if (!ogImage) fail("no og:image meta tag");
    else if (!ogImage.startsWith("http")) fail(`og:image is not absolute: ${ogImage}`);
    else console.log(`[meta] og:image ${ogImage}`);
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error(`\nSmoke check failed with ${failures.length} problem(s).`);
    process.exit(1);
  }
  console.log("\nSmoke check passed.");
}

await run();
