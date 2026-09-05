/**
 * JSON 404 for anything under /api that no route handles.
 *
 * Without this, an unknown API path falls through to the app's HTML 404 — a
 * 63KB page shell answering a request that said `Accept: application/json`.
 * A client probing the API surface cannot tell "wrong path" from "this is not
 * an API at all", which is exactly how an agent concludes there is no API here.
 *
 * A more specific route wins over a catch-all in the App Router, so
 * /api/analytics is untouched by this file.
 */
const KNOWN_ENDPOINTS = ["/api/v1/analytics", "/api/analytics"] as const;

function notFound(pathname: string) {
  return Response.json(
    {
      error: `No API endpoint at ${pathname}.`,
      code: "ENDPOINT_NOT_FOUND",
      hint: `This API exposes ${KNOWN_ENDPOINTS.join(" (pin this) and ")} (an alias that tracks the newest major). Fetch /openapi.json for the full machine-readable surface, including parameters and response schemas.`,
      endpoints: KNOWN_ENDPOINTS,
      documentation: "https://wingtics.com/openapi.json",
    },
    {
      status: 404,
      headers: {
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
      },
    },
  );
}

function handler(request: Request) {
  return notFound(new URL(request.url).pathname);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
