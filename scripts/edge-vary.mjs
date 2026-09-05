/**
 * Is the Accept negotiation actually alive on a deployment?
 *
 * `pnpm smoke` runs against `next start`, where proxy.ts always runs. On
 * Vercel it is a separate build artifact that can silently fail to deploy —
 * and when it does, every page still answers 200 with HTML, so nothing else
 * here notices. This check is what catches that, which is why it is worth its
 * own script: it is the only thing standing between "renamed a file" and
 * "shipped a site that stopped serving markdown to agents".
 *
 * It also reports the HTML half's `Vary`, which does NOT carry `Accept` and
 * cannot be made to. Next 16 computes `vary` for page responses and replaces
 * everything else. Measured, all five: `NextResponse.next()`, a self-rewrite,
 * `headers()` in next.config, `headers` in vercel.json, and — not attempted,
 * because it would disable the framework's own routing for one header — a
 * `routes` transform. The markdown half keeps its `Vary` only because a Route
 * Handler response is not a page response.
 *
 * The residual risk is a shared cache storing the HTML variant under a key
 * that ignores Accept and later handing it to an agent asking for markdown.
 * Vercel's own edge is not exposed: proxy runs in front of the cache, verified
 * in production against an `x-vercel-cache: STALE` HTML entry that still
 * negotiated correctly. The exposure is caches between Vercel and the client.
 *
 * Usage: node scripts/edge-vary.mjs https://wingtics.com
 */
import { varies } from "../src/site/vary.mjs";

const BASE = process.argv[2];
if (!BASE) {
  console.error("usage: node scripts/edge-vary.mjs <base-url>");
  process.exit(2);
}

const PATHS = ["/", "/components", "/components/globe-chart"];
const failures = [];

for (const path of PATHS) {
  for (const [half, accept, wanted] of [
    ["markdown", "text/markdown", "text/markdown"],
    ["html", "text/html", "text/html"],
  ]) {
    const response = await fetch(`${BASE}${path}`, { headers: { accept }, redirect: "manual" });

    // A protected preview answers 302 to vercel.com/sso-api. Following that
    // silently measures Vercel's login page and reports every path as broken,
    // which is a far more confusing answer than "I could not reach it".
    if (response.status !== 200) {
      const where = response.headers.get("location") ?? "";
      const protection = /vercel\.com\/sso-api|_vercel_sso/.test(
        where + (response.headers.get("set-cookie") ?? ""),
      );
      console.error(
        `\ncannot read ${BASE}${path}: ${response.status}` +
          (protection
            ? " — deployment protection. Use a bypass URL or disable it for this deployment."
            : ` -> ${where}`),
      );
      process.exit(2);
    }

    const type = response.headers.get("content-type") ?? "";
    const vary = response.headers.get("vary") ?? "";

    if (!type.includes(wanted)) {
      failures.push(
        `${path} [${half}] served ${type || "(no type)"}` +
          (half === "markdown" ? " — proxy.ts is not running on this deployment" : ""),
      );
    }
    // Only the markdown half can carry it; see the header comment.
    if (half === "markdown" && !varies(vary, "accept")) {
      failures.push(`${path} [markdown] Vary: ${vary || "(none)"} — no Accept`);
    }
    const mark = half === "markdown" ? (varies(vary, "accept") ? "ok  " : "FAIL") : "note";
    console.log(`${mark} ${path} [${half}] ${type.split(";")[0]} vary="${vary}"`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const problem of failures) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(
  `\nNegotiation live on ${PATHS.length} paths; Vary: Accept present on the markdown half of each.`,
);
