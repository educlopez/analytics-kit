/**
 * Template for a new analytics provider.
 *
 * 1. Copy this file into packages/connector-<name>/src/index.ts
 * 2. Map canonical metrics/dimensions onto the vendor API
 * 3. Declare capabilities so widgets can hide unsupported queries
 */
import {
  defineConnector,
  emptyResult,
  providerJson,
  queryNeeds,
  type ConnectorCapabilities,
  type NormalizedQuery,
} from "@analytics-kit/core";

export interface AcmeConnectorOptions {
  apiKey: string;
  siteId: string;
  fetch?: typeof fetch;
}

export const ACME_CAPABILITIES: ConnectorCapabilities = {
  metrics: { visitors: true, pageviews: true, visits: true },
  dimensions: { path: true, referrer: true, country: true },
  granularity: ["day"],
  filters: false,
  realtime: false,
  previousPeriod: false,
};

export function createAcmeConnector(options: AcmeConnectorOptions) {
  return defineConnector({
    id: "acme",
    name: "Acme Analytics",
    capabilities: ACME_CAPABILITIES,
    async query(query: NormalizedQuery) {
      const needs = queryNeeds(query);
      const result = emptyResult("acme", query);
      const payload = await providerJson<{ visitors: number; pageviews: number }>(
        `https://api.acme.test/stats?site=${options.siteId}`,
        { headers: { authorization: `Bearer ${options.apiKey}` } },
        "acme",
        options.fetch ?? fetch,
      );
      result.totals = {
        visitors: payload.visitors,
        pageviews: payload.pageviews,
      };
      if (needs.series) result.series = [];
      if (needs.breakdown) result.breakdown = [];
      return result;
    },
  });
}
