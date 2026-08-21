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
  reload: () => void;
}

export function useQuery(
  partial: Omit<AnalyticsQuery, "range"> & { range?: DateRangeInput },
): UseQueryResult {
  const { query, range, capabilities, connector } = useAnalytics();
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<AnalyticsResult>();
  const [status, setStatus] = useState<QueryStatus>("idle");
  const [error, setError] = useState<AnalyticsError | Error>();
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
  const missingKey = missing.join("|");

  useEffect(() => {
    if (missing.length) {
      setStatus("unsupported");
      setData(undefined);
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
        const next = isAnalyticsError(err) ? err : err instanceof Error ? err : new Error(String(err));
        setError(next);
        setStatus(isAnalyticsError(err) && err.code === "UNSUPPORTED" ? "unsupported" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [query, tick, missingKey, serialized, range, connector.id]);

  return {
    data,
    status,
    error,
    missing,
    reload: () => setTick((value) => value + 1),
  };
}

export function useRealtime(pollMs = 15_000): {
  data?: RealtimeResult;
  status: QueryStatus;
  missing: string[];
} {
  const { realtime, capabilities } = useAnalytics();
  const missing = capabilities.realtime ? [] : ["realtime"];
  const missingKey = missing.join("|");
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
  }, [realtime, pollMs, missingKey]);

  return { data, status, missing };
}

export function useCapabilities() {
  return useAnalytics().capabilities;
}
