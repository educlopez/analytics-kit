import { isAnalyticsError, type AnalyticsConnector, type AnalyticsQuery } from "@analytics-kit/core";

export interface AnalyticsHandlerOptions {
  connector: AnalyticsConnector;
  cors?: boolean | { origin?: string };
  beforeQuery?: (query: AnalyticsQuery, request: Request) => AnalyticsQuery | Promise<AnalyticsQuery>;
}

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
        return new Response("Method not allowed", { status: 405, headers });
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
        return json({ error: error.message, code: error.code }, headers, status);
      }
      return json({ error: error instanceof Error ? error.message : "Unknown error" }, headers, 500);
    }
  };
}

export function createRouteHandlers(options: AnalyticsHandlerOptions) {
  const handler = createAnalyticsHandler(options);
  return {
    GET: handler,
    POST: handler,
    OPTIONS: handler,
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
  const origin = typeof cors === "object" ? cors.origin ?? "*" : "*";
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
  };
}
