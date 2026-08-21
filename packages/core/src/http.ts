import { AnalyticsError } from "./errors.js";

export async function providerFetch(
  url: string,
  init: RequestInit,
  connectorId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetchImpl(url, init);
  } catch (error) {
    throw new AnalyticsError("NETWORK", `Network error talking to ${connectorId}.`, {
      connectorId,
      cause: error,
    });
  }

  if (response.ok) return response;

  const details = await safeJson(response);
  if (response.status === 401 || response.status === 403) {
    throw new AnalyticsError("AUTH", `${connectorId} rejected the credentials.`, {
      connectorId,
      status: response.status,
      details,
    });
  }
  if (response.status === 429) {
    throw new AnalyticsError("RATE_LIMIT", `${connectorId} rate-limited the request.`, {
      connectorId,
      status: response.status,
      details,
    });
  }
  throw new AnalyticsError("PROVIDER", `${connectorId} returned HTTP ${response.status}.`, {
    connectorId,
    status: response.status,
    details,
  });
}

export async function providerJson<T>(
  url: string,
  init: RequestInit,
  connectorId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<T> {
  const response = await providerFetch(url, init, connectorId, fetchImpl);
  return (await response.json()) as T;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}
