import { createWingticsMockConnector } from "@wingtics/connector-mock";
import { createVercelConnector } from "@wingtics/connector-vercel";
import { createRouteHandlers } from "@wingtics/next";
import { RATE_LIMIT, clientKey, consume, rateLimitHeaders } from "./rate-limit";

/**
 * The analytics endpoint, mounted at two paths.
 *
 * `/api/v1/analytics` is the versioned one an agent should pin. `/api/analytics`
 * is the same handler and stays for good: it is published in llms.txt, in the
 * docs and in every spec we have shipped, and breaking those links to satisfy a
 * versioning policy would cost more than the policy is worth. It is an alias
 * that tracks the newest major, not a deprecated path — so it carries no
 * `Deprecation` header, because it is not going anywhere.
 *
 * A future breaking change becomes `/api/v2/…`, at which point `/api/v1/…`
 * starts carrying `Deprecation` and `Sunset` and the alias follows v2.
 */
const token = process.env.ANALYTICS_VERCEL_TOKEN;
const projectId = process.env.ANALYTICS_VERCEL_PROJECT_ID;

const connector =
  token && projectId
    ? createVercelConnector({
        token,
        projectId,
        teamId: process.env.ANALYTICS_VERCEL_TEAM_ID,
      })
    : createWingticsMockConnector({ profile: "vercel" });

const handlers = createRouteHandlers({ connector });

/**
 * Wrap one handler so every answer reports the budget, and an exhausted one
 * answers 429 in the same JSON shape as any other failure.
 *
 * The headers go on success *and* on failure: a client that only learns its
 * budget once it has already been refused cannot pace itself, which is the
 * whole point of the RateLimit fields.
 */
function limited(handler: (request: Request) => Promise<Response>) {
  return async function limitedHandler(request: Request): Promise<Response> {
    // A preflight is not a query; counting it would spend a caller's budget on
    // a request the browser made on its behalf.
    if (request.method === "OPTIONS") return handler(request);

    const verdict = consume(clientKey(request));
    const headers = rateLimitHeaders(verdict);

    if (!verdict.allowed) {
      return Response.json(
        {
          error: `Too many requests. The limit is ${RATE_LIMIT.limit} per ${RATE_LIMIT.window} seconds.`,
          code: "RATE_LIMIT",
          hint: `Wait ${verdict.reset} seconds, or read RateLimit-Remaining on every response and pace yourself before you are refused.`,
        },
        {
          status: 429,
          headers: { ...headers, "Retry-After": String(verdict.reset) },
        },
      );
    }

    const response = await handler(request);
    for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
    return response;
  };
}

export const GET = limited(handlers.GET);
export const POST = limited(handlers.POST);
export const OPTIONS = limited(handlers.OPTIONS);
export const PUT = limited(handlers.PUT);
export const PATCH = limited(handlers.PATCH);
export const DELETE = limited(handlers.DELETE);
