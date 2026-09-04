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
 * `Vary` goes on every negotiated path, including the ones that answered in
 * HTML, because that is where the wrong cache entry would be created.
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (prefersMarkdown(request.headers.get("accept"))) {
    const url = request.nextUrl.clone();
    url.pathname = `/md${pathname === "/" ? "" : pathname}`;
    const rewritten = NextResponse.rewrite(url);
    rewritten.headers.set("Vary", "Accept, Accept-Encoding");
    return rewritten;
  }

  const response = NextResponse.next();
  response.headers.set("Vary", "Accept, Accept-Encoding");
  return response;
}

export const config = {
  // Only the paths with a real markdown variant. Advertising negotiation on a
  // page that would answer with a stub is worse than not advertising it.
  matcher: ["/", "/components", "/components/:slug"],
};
