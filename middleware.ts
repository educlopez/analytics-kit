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

/** Does this Accept header ask for markdown in preference to HTML? */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  let markdown = -1;
  let html = -1;
  for (const part of accept.split(",")) {
    const [rawType, ...params] = part.trim().split(";");
    const type = rawType.trim().toLowerCase();
    const q = params.map((p) => /^\s*q=([0-9.]+)\s*$/i.exec(p)).find(Boolean) as
      RegExpExecArray | undefined;
    const weight = q ? Number(q[1]) : 1;
    if (Number.isNaN(weight) || weight <= 0) continue;
    if (MARKDOWN_TYPES.includes(type)) markdown = Math.max(markdown, weight);
    if (type === "text/html" || type === "*/*" || type === "text/*") html = Math.max(html, weight);
  }
  // Ties go to markdown: a client that listed it explicitly meant it.
  return markdown > 0 && markdown >= html;
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
