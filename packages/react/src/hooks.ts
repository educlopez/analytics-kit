import { useEffect, useMemo, useState } from "react";
import {
  isAnalyticsError,
  missingRequirements,
  type AnalyticsError,
  type AnalyticsQuery,
  type AnalyticsResult,
  type DateRangeInput,
  type RealtimeResult,
} from "@analytics-kit/core";
import { useAnalytics } from "./context.js";

export type QueryStatus = "idle" | "loading" | "success" | "error" | "unsupported";

export interface UseQueryResult {
  data?: AnalyticsResult;
  status: QueryStatus;
  error?: AnalyticsError | Error;
  missing: string[];
  /** True when `data` came from a sample/mock fallback rather than the live provider. */
  sample: boolean;
  reload: () => void;
}

export function useQuery(
  partial: Omit<AnalyticsQuery, "range"> & { range?: DateRangeInput },
): UseQueryResult {
  const { query, range, capabilities, connector, previewQuery } = useAnalytics();
  const [tick, setTick] = useState(0);
  const serialized = JSON.stringify(partial);

  const merged: AnalyticsQuery = useMemo(() => {
    const parsed = JSON.parse(serialized) as typeof partial;
    return { ...parsed, range: parsed.range ?? range };
  }, [serialized, range]);

  const missing = useMemo(
    () =>
      missingRequirements(capabilities, {
        metrics: merged.metrics,
        dimensions: merged.dimensions,
      }),
    [capabilities, merged],
  );
  const seeded = missing.length ? undefined : previewQuery?.(merged);
  const [data, setData] = useState<AnalyticsResult | undefined>(seeded);
  const [status, setStatus] = useState<QueryStatus>(
    missing.length ? "unsupported" : seeded ? "success" : "idle",
  );
  const [error, setError] = useState<AnalyticsError | Error>();

  useEffect(() => {
    if (missing.length) {
      setStatus("unsupported");
      setData(undefined);
      return;
    }
    const next = previewQuery?.(merged);
    if (next) {
      setData(next);
      setStatus("success");
      setError(undefined);
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setError(undefined);
    query(merged)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const nextError = isAnalyticsError(err)
          ? err
          : err instanceof Error
            ? err
            : new Error(String(err));
        setError(nextError);
        setStatus(isAnalyticsError(err) && err.code === "UNSUPPORTED" ? "unsupported" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [query, tick, missing, merged, connector.id, previewQuery]);

  return {
    data,
    status,
    error,
    missing,
    sample: Boolean(data?.meta?.sample),
    reload: () => setTick((value) => value + 1),
  };
}

export function useRealtime(pollMs = 15_000): {
  data?: RealtimeResult;
  status: QueryStatus;
  missing: string[];
} {
  const { realtime, capabilities } = useAnalytics();
  const missing = useMemo(
    () => (capabilities.realtime ? [] : ["realtime"]),
    [capabilities.realtime],
  );
  const [data, setData] = useState<RealtimeResult>();
  const [status, setStatus] = useState<QueryStatus>("idle");

  useEffect(() => {
    if (missing.length) {
      setStatus("unsupported");
      return;
    }
    let cancelled = false;
    const load = () => {
      setStatus((current) => (current === "success" ? current : "loading"));
      void realtime()
        .then((result) => {
          if (!cancelled) {
            setData(result);
            setStatus("success");
          }
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });
    };
    load();
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [realtime, pollMs, missing]);

  return { data, status, missing };
}

export function useCapabilities() {
  return useAnalytics().capabilities;
}
