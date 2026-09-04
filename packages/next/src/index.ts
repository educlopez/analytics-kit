import { isAnalyticsError, type AnalyticsConnector, type AnalyticsQuery } from "@wingtics/core";

export interface AnalyticsHandlerOptions {
  connector: AnalyticsConnector;
  cors?: boolean | { origin?: string };
  beforeQuery?: (
    query: AnalyticsQuery,
    request: Request,
  ) => AnalyticsQuery | Promise<AnalyticsQuery>;
}

/**
 * What a caller can do about each modelled failure. Agents get an error code
 * they can branch on and a sentence they can act on; people get the same.
 */
const ERROR_HINTS: Record<string, string> = {
  AUTH: "The provider rejected the credentials. Check the token and project id on the server.",
  RATE_LIMIT: "The provider is rate-limiting. Back off and retry; the query itself is valid.",
  UNSUPPORTED:
    "This connector cannot answer that query. Read `capabilities` from GET on this endpoint and drop the metrics or dimensions it does not list.",
  INVALID_QUERY: "The query does not match the AnalyticsQuery shape. Fix it before retrying.",
  NETWORK: "The provider was unreachable. Retrying is safe.",
  PROVIDER: "The provider answered with an error of its own. Retrying may help.",
};

export function createAnalyticsHandler(options: AnalyticsHandlerOptions) {
  return async function analyticsHandler(request: Request): Promise<Response> {
    const headers = responseHeaders(options.cors);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    try {
      if (request.method === "GET") {
        return json(
          {
            id: options.connector.id,
            name: options.connector.name,
            capabilities: options.connector.capabilities,
          },
          headers,
        );
      }

      if (request.method !== "POST") {
        // Every other failure already answers in JSON; this one answered in
        // plain text, which an agent cannot parse alongside the rest.
        return json(
          {
            error: `${request.method} is not supported by this endpoint.`,
            code: "METHOD_NOT_ALLOWED",
            hint: "GET returns the connector's id, name and capabilities. POST an AnalyticsQuery as JSON to run a query.",
          },
          { ...headers, allow: "GET, POST, OPTIONS" },
          405,
        );
      }

      const url = new URL(request.url);
      const body = (await request.json().catch(() => ({}))) as AnalyticsQuery;
      if (url.searchParams.get("realtime") === "1") {
        const realtime = await options.connector.realtime?.(body);
        return json(realtime ?? { visitors: 0 }, headers);
      }

      const query = options.beforeQuery ? await options.beforeQuery(body, request) : body;
      const result = await options.connector.query(query);
      return json(result, headers);
    } catch (error) {
      if (isAnalyticsError(error)) {
        const status =
          error.code === "AUTH"
            ? 401
            : error.code === "RATE_LIMIT"
              ? 429
              : error.code === "UNSUPPORTED" || error.code === "INVALID_QUERY"
                ? 400
                : 502;
        return json(
          { error: error.message, code: error.code, hint: ERROR_HINTS[error.code] },
          headers,
          status,
        );
      }
      return json(
        {
          error: error instanceof Error ? error.message : "Unknown error",
          code: "INTERNAL",
          hint: "The connector threw something the protocol does not model. Retrying is safe; the query was not partially applied.",
        },
        headers,
        500,
      );
    }
  };
}

/**
 * Handlers for a Next route segment.
 *
 * The unsupported verbs are exported too, and deliberately. A framework that
 * only sees GET, POST and OPTIONS answers everything else itself, with a 405
 * that has no content type and no body — so a client probing the endpoint gets
 * something it cannot parse, while every other failure here is JSON. Routing
 * them through the handler makes one answer shape hold for the whole surface.
 */
export function createRouteHandlers(options: AnalyticsHandlerOptions) {
  const handler = createAnalyticsHandler(options);
  return {
    GET: handler,
    POST: handler,
    OPTIONS: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
  };
}

function json(body: unknown, headers: HeadersInit, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function responseHeaders(cors: AnalyticsHandlerOptions["cors"]): HeadersInit {
  if (!cors) return {};
  const origin = typeof cors === "object" ? (cors.origin ?? "*") : "*";
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
  };
}
