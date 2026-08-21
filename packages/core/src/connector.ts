import type { ConnectorCapabilities } from "./capabilities.js";
import { AnalyticsError } from "./errors.js";
import { normalizeQuery } from "./normalize.js";
import type { AnalyticsQuery, AnalyticsResult, RealtimeQuery, RealtimeResult } from "./query.js";
import { emptyResult, type NormalizedQuery } from "./query.js";
import { serializeQuery } from "./normalize.js";
import { assertSupported } from "./validate.js";

export interface ConnectorInfo {
  id: string;
  name: string;
  capabilities: ConnectorCapabilities;
}

export interface AnalyticsConnector extends ConnectorInfo {
  query(query: AnalyticsQuery): Promise<AnalyticsResult>;
  realtime?(query?: RealtimeQuery): Promise<RealtimeResult>;
  refreshCapabilities?(): Promise<ConnectorCapabilities>;
}

export interface DefineConnectorInput {
  id: string;
  name: string;
  capabilities: ConnectorCapabilities;
  query: (query: NormalizedQuery) => Promise<AnalyticsResult>;
  realtime?: (query: RealtimeQuery) => Promise<RealtimeResult>;
  refreshCapabilities?: () => Promise<ConnectorCapabilities>;
}

export function defineConnector(input: DefineConnectorInput): AnalyticsConnector {
  const connector: AnalyticsConnector = {
    id: input.id,
    name: input.name,
    capabilities: input.capabilities,
    async query(raw) {
      const query = normalizeQuery(raw);
      assertSupported(connector.capabilities, query, connector.id);
      const result = await input.query(query);
      const fallback = emptyResult(connector.id, query);
      return {
        ...result,
        totals: result.totals ?? fallback.totals,
        series: result.series ?? [],
        breakdown: result.breakdown ?? [],
        meta: {
          ...fallback.meta,
          ...result.meta,
          connectorId: connector.id,
          range: result.meta?.range ?? fallback.meta.range,
          granularity: result.meta?.granularity ?? query.granularity,
        },
      };
    },
    realtime: input.realtime
      ? async (query = {}) => {
          if (!connector.capabilities.realtime) {
            throw new AnalyticsError(
              "UNSUPPORTED",
              `Realtime is not available on connector "${connector.id}".`,
              { connectorId: connector.id },
            );
          }
          return input.realtime!(query);
        }
      : undefined,
    refreshCapabilities: input.refreshCapabilities
      ? async () => {
          connector.capabilities = await input.refreshCapabilities!();
          return connector.capabilities;
        }
      : undefined,
  };

  return connector;
}

export function withCache(connector: AnalyticsConnector, ttlMs = 30_000): AnalyticsConnector {
  const cache = new Map<string, { expires: number; value: AnalyticsResult }>();
  const inflight = new Map<string, Promise<AnalyticsResult>>();

  return {
    ...connector,
    async query(query) {
      const key = `${connector.id}:${serializeQuery(query)}`;
      const hit = cache.get(key);
      if (hit && hit.expires > Date.now()) return hit.value;
      const pending = inflight.get(key);
      if (pending) return pending;
      const promise = connector.query(query).then((value) => {
        cache.set(key, { expires: Date.now() + ttlMs, value });
        inflight.delete(key);
        return value;
      });
      inflight.set(key, promise);
      return promise;
    },
  };
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 250): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (
        error instanceof AnalyticsError &&
        (error.code === "AUTH" || error.code === "UNSUPPORTED")
      ) {
        throw error;
      }
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}
