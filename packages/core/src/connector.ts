import { unionCapabilities, type ConnectorCapabilities } from "./capabilities.js";
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

export interface SampleFallbackOptions {
  /** The primary connector — usually live/remote. */
  connector: AnalyticsConnector;
  /** Queried whenever the primary connector is unsupported, errors, or has no signal. */
  sample: AnalyticsConnector;
  /** Override the default "no signal" heuristic (all-zero totals / empty breakdown / empty series). */
  isEmpty?: (result: AnalyticsResult, query: NormalizedQuery) => boolean;
}

/**
 * Wrap a connector so a query that the primary connector can't answer — because
 * it's unsupported, it throws, or it comes back with no signal (all-zero
 * totals, empty breakdown, empty series) — transparently falls back to a
 * sample connector instead of surfacing an error or an empty widget.
 *
 * The fallback result is tagged with `meta.sample = true` so UIs can render an
 * honest "this is sample data" signal instead of passing it off as live.
 *
 * Reported capabilities are the union of both connectors: the point is that a
 * widget should never have to "sit out" on this wrapper — it either gets live
 * data or a clearly labeled sample, decided per query at request time, not by
 * a static pre-flight capability check.
 */
export function withSampleFallback(options: SampleFallbackOptions): AnalyticsConnector {
  const { connector, sample } = options;
  const isEmpty = options.isEmpty ?? defaultResultIsEmpty;
  // Union, not merge: merge is override semantics, so a sample connector
  // declaring `realtime: false` would cancel a primary that supports it and
  // defineConnector would reject realtime before we ever reach the live source.
  const capabilities = unionCapabilities(connector.capabilities, sample.capabilities);
  const primaryRealtime = connector.realtime;
  const sampleRealtime = sample.realtime;

  return defineConnector({
    id: connector.id,
    name: connector.name,
    capabilities,
    async query(query) {
      try {
        const result = await connector.query(query);
        return isEmpty(result, query) ? tagSample(await sample.query(query)) : result;
      } catch {
        return tagSample(await sample.query(query));
      }
    },
    realtime:
      primaryRealtime || sampleRealtime
        ? async (rtQuery) => {
            try {
              if (!primaryRealtime) throw new AnalyticsError("UNSUPPORTED", "No realtime source.");
              return await primaryRealtime(rtQuery);
            } catch (error) {
              // A fabricated 0 would render as "0 live visitors" with nothing
              // marking it as invented. With no sample stream to fall back to,
              // failing is the honest outcome.
              if (!sampleRealtime) {
                throw error instanceof AnalyticsError
                  ? error
                  : new AnalyticsError("UNSUPPORTED", "No realtime source.");
              }
              return sampleRealtime(rtQuery);
            }
          }
        : undefined,
    refreshCapabilities: connector.refreshCapabilities
      ? async () => unionCapabilities(await connector.refreshCapabilities!(), sample.capabilities)
      : undefined,
  });
}

function tagSample(result: AnalyticsResult): AnalyticsResult {
  return { ...result, meta: { ...result.meta, sample: true } };
}

/**
 * "The provider gave us nothing to show" — deliberately not "the numbers are
 * zero". A site with genuinely zero visitors has real data, and replacing that
 * honest zero with invented numbers is the failure this wrapper exists to avoid.
 * So a breakdown row or a series point counts as data whatever it holds.
 *
 * A totals-only query (metric cards) is the one case that can't be told apart:
 * `emptyResult` fills every requested metric with 0, so "no data" and "real
 * zero" are byte-identical. There we still fall back — the visible sample badge
 * keeps it honest — and a connector that can assert a true zero should pass its
 * own `isEmpty`.
 */
function defaultResultIsEmpty(result: AnalyticsResult, query: NormalizedQuery): boolean {
  if (query.dimensions.length > 0) {
    return !result.breakdown?.length;
  }
  if (query.includePrevious || !query.granularity) {
    return !query.metrics.some((metric) => Number(result.totals?.[metric]) > 0);
  }
  return !result.series?.length;
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
