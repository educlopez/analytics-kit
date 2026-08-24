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

const BASE = process.argv[2] ?? "http://localhost:3100";
/**
 * One pass runs the browser in a non-English locale on purpose. Server-rendered
 * numbers are formatted by Node; if any of them uses the runtime's locale
 * instead of a pinned one, the browser formats them differently and React
 * throws a hydration mismatch. With both sides in en-US the bug is invisible,
 * which is how it shipped.
 */
const PASSES = [
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
  "/docs",
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

        const overflow = await page.evaluate(
          () => document.body.scrollWidth - document.body.clientWidth,
        );
        if (overflow > 2) {
          fail(`[${width} ${locale}] ${path} — body scrolls horizontally by ${overflow}px`);
        }

        for (const error of consoleErrors) {
          fail(`[${width} ${locale}] ${path} — ${error}`);
        }
      }

      await context.close();
    }

    // Metadata routes: these only exist in a built app, so this is the only
    // place they get exercised.
    for (const path of [
      "/icon.svg",
      "/apple-icon",
      "/opengraph-image",
      "/sitemap.xml",
      "/manifest.webmanifest",
      "/robots.txt",
    ]) {
      const response = await fetch(`${BASE}${path}`);
      if (!response.ok) {
        fail(`${path} responded ${response.status}`);
        continue;
      }
      const bytes = (await response.arrayBuffer()).byteLength;
      if (bytes < 100) fail(`${path} returned only ${bytes} bytes`);
      console.log(`[meta] ${path} ${response.status} ${bytes}B`);
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
