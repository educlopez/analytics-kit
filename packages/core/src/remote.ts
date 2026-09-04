import type { AnalyticsConnector } from "./connector.js";
import { EMPTY_CAPABILITIES, type ConnectorCapabilities } from "./capabilities.js";
import type { AnalyticsQuery, AnalyticsResult, RealtimeQuery, RealtimeResult } from "./query.js";
import { providerJson } from "./http.js";

export interface RemoteConnectorOptions {
  endpoint: string;
  headers?: Record<string, string>;
  id?: string;
  name?: string;
}

/**
 * Browser/server connector that talks to an Wingtics HTTP endpoint
 * created by `@wingtics/next` (or any handler that speaks the same protocol).
 */
export function createHttpConnector(options: RemoteConnectorOptions): AnalyticsConnector {
  const headers = {
    "content-type": "application/json",
    ...options.headers,
  };

  const connector: AnalyticsConnector = {
    id: options.id ?? "remote",
    name: options.name ?? "Remote analytics",
    capabilities: EMPTY_CAPABILITIES,
    async refreshCapabilities() {
      const info = await providerJson<{
        id: string;
        name: string;
        capabilities: ConnectorCapabilities;
      }>(options.endpoint, { method: "GET", headers }, connector.id);
      connector.id = info.id;
      connector.name = info.name;
      connector.capabilities = info.capabilities;
      return info.capabilities;
    },
    async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
      return providerJson<AnalyticsResult>(
        options.endpoint,
        { method: "POST", headers, body: JSON.stringify(query) },
        connector.id,
      );
    },
    async realtime(query: RealtimeQuery = {}): Promise<RealtimeResult> {
      const target = options.endpoint.includes("?")
        ? `${options.endpoint}&realtime=1`
        : `${options.endpoint}?realtime=1`;
      return providerJson<RealtimeResult>(
        target,
        { method: "POST", headers, body: JSON.stringify(query) },
        connector.id,
      );
    },
  };

  return connector;
}
