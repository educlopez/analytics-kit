import { NextResponse, type NextRequest } from "next/server";

/**
 * Accept negotiation for markdown, per acceptmarkdown.com.
 *
 * Two halves, and the second is the one that is easy to forget: serve
 * `text/markdown` when a client asks for it, and say `Vary: Accept` on those
 * responses. Without the Vary a CDN happily hands the cached HTML variant to
 * an agent asking for markdown, or the reverse, depending on which one landed
 * in the cache first — so the negotiation works locally and silently fails in
 * production.
 *
 * Only the markdown half can carry that `Vary`, and not for want of trying.
 * Next 16 computes its own `vary` for page responses (rsc, next-router-*) and
 * replaces everything else — measured four ways, on a real deployment as well
 * as locally: `NextResponse.next()`, a self-`rewrite`, `headers()` in
 * next.config, and `headers` in vercel.json all lose it. The markdown rewrite
 * keeps it only because a Route Handler response is not a page response.
 *
 * So the HTML half ships without `Vary: Accept`. Vercel is not exposed —
 * proxy runs in front of its cache, verified in production against a STALE
 * HTML cache entry that still negotiated correctly — but a cache between
 * Vercel and the client could hand that HTML to an agent asking for markdown.
 * Known and unfixable at this Next version; do not spend another afternoon on
 * it. scripts/edge-vary.mjs reports the current state on any deployment.
 */
const MARKDOWN_TYPES = ["text/markdown", "text/x-markdown", "text/plain"];

/**
 * How this Accept header rates one concrete media type.
 *
 * RFC 9110 resolves by *specificity*, not by the highest weight anywhere in
 * the header: `text/markdown;q=0.8, text/*;q=1` rates markdown 0.8, because
 * the exact range beats the wildcard. Taking a maximum across every matching
 * range instead — the obvious wrong implementation — makes an explicit low-q
 * preference lose to an incidental wildcard, so a client that carefully asked
 * for markdown is handed HTML.
 *
 * `specificity` comes back too, because "did the client name this type, or
 * merely tolerate everything?" is what separates a real request for markdown
 * from a bare catch-all range.
 */
/** Specificity of an exact `type/subtype` range, the only one that counts as naming a type. */
const EXACT = 2;

function rate(accept: string, type: string): { weight: number; specificity: number } {
  const [group] = type.split("/");
  let best = { weight: 0, specificity: -1 };

  for (const part of accept.split(",")) {
    const [rawRange, ...params] = part.trim().split(";");
    const range = rawRange.trim().toLowerCase();
    const specificity =
      range === type ? EXACT : range === `${group}/*` ? 1 : range === "*/*" ? 0 : -1;
    if (specificity < 0 || specificity < best.specificity) continue;

    const q = params.map((param) => /^\s*q=([0-9.]+)\s*$/i.exec(param)).find(Boolean) as
      RegExpExecArray | undefined;
    const weight = q ? Number(q[1]) : 1;
    if (Number.isNaN(weight)) continue;

    // A more specific range always wins; among equals, the most generous does.
    if (specificity > best.specificity || weight > best.weight) best = { weight, specificity };
  }

  return best;
}

/** Does this Accept header ask for markdown in preference to HTML? */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  // Best markdown candidate by the same rule used inside a type: specificity
  // first, weight second. Comparing on weight alone let a `text/*` wildcard
  // reach markdown through `text/plain` and outrank an explicit
  // `text/markdown;q=0.4`, which inverted the client's stated preference.
  const markdown = MARKDOWN_TYPES.map((type) => rate(accept, type)).reduce((a, b) =>
    b.specificity > a.specificity || (b.specificity === a.specificity && b.weight > a.weight)
      ? b
      : a,
  );
  const html = rate(accept, "text/html");

  if (markdown.weight <= 0) return false;
  if (markdown.weight > html.weight) return true;
  // A tie goes to markdown only when the client named the exact type. A group
  // wildcard tolerates markdown, it does not ask for it — so `text/*` and a
  // bare catch-all both stay on HTML, which is what a browser or a plain HTTP
  // client expects.
  return markdown.weight === html.weight && markdown.specificity === EXACT;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (prefersMarkdown(request.headers.get("accept"))) {
    const url = request.nextUrl.clone();
    url.pathname = `/md${pathname === "/" ? "" : pathname}`;
    const rewritten = NextResponse.rewrite(url);
    rewritten.headers.set("Vary", "Accept, Accept-Encoding");
    return rewritten;
  }

  // No Vary here: Next replaces it on page responses. See the note above.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // The paths with a real markdown variant.
    "/",
    "/components",
    "/components/:slug",
    // …and everything that has no page of its own, so a request for markdown
    // gets the markdown 404 in app/md — a short body naming /llms.txt and
    // /sitemap.xml — instead of a 63KB HTML shell an agent cannot recover
    // from. An HTML request to the same path is untouched and still renders
    // the normal 404 page.
    //
    // The exclusions are the routes that DO exist: every HTML page, the API,
    // the markdown route itself, Next's internals, and anything with a dot,
    // which covers /openapi.json, /sitemap.xml, /robots.txt, /llms.txt and
    // every static asset. Advertising negotiation on a real page that would
    // answer with a stub is still worse than not advertising it.
    "/((?!_next/|api/|md/|about$|contact$|demo$|docs$|privacy$|.*\\.).*)",
  ],
};
