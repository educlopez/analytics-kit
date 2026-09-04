import { markdownFor } from "../../../src/site/markdown";

/**
 * The markdown half of the Accept negotiation in `middleware.ts`. Reached only
 * by rewrite, never linked, so it carries `noindex`: the HTML page at the same
 * path is the canonical one.
 */
export const dynamic = "force-static";

export async function GET(_request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const pathname = `/${(path ?? []).join("/")}`;
  const body = markdownFor(pathname === "/" ? "/" : pathname);

  if (!body) {
    return new Response(
      `# Not found\n\nNo markdown representation exists for \`${pathname}\`.\n\nSee /llms.txt for the machine-readable index, or /sitemap.xml for every page.\n`,
      {
        status: 404,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          vary: "Accept, Accept-Encoding",
          "x-robots-tag": "noindex",
        },
      },
    );
  }

  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      vary: "Accept, Accept-Encoding",
      "x-robots-tag": "noindex",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
