import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  serializeQuery,
  withCache,
  type AnalyticsConnector,
  type AnalyticsQuery,
  type AnalyticsResult,
  type ConnectorCapabilities,
  type DateRangeInput,
  type RealtimeResult,
} from "@analytics-kit/core";

export type AnalyticsTheme = "dark" | "light";

export interface AnalyticsContextValue {
  connector: AnalyticsConnector;
  capabilities: ConnectorCapabilities;
  range: DateRangeInput;
  setRange: (range: DateRangeInput) => void;
  theme: AnalyticsTheme;
  query: (query: AnalyticsQuery) => Promise<AnalyticsResult>;
  realtime: () => Promise<RealtimeResult>;
  previewQuery?: (query: AnalyticsQuery) => AnalyticsResult | undefined;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export interface AnalyticsProviderProps {
  connector: AnalyticsConnector;
  range?: DateRangeInput;
  theme?: AnalyticsTheme;
  cacheTtlMs?: number;
  /** Synchronous result for first paint / prerender. Catalog and teasers use this. */
  previewQuery?: (query: AnalyticsQuery) => AnalyticsResult | undefined;
  children: ReactNode;
}

export function AnalyticsProvider({
  connector: rawConnector,
  range: rangeProp = "7d",
  theme = "dark",
  cacheTtlMs = 30_000,
  previewQuery,
  children,
}: AnalyticsProviderProps) {
  const connector = useMemo(
    () => (cacheTtlMs > 0 ? withCache(rawConnector, cacheTtlMs) : rawConnector),
    [rawConnector, cacheTtlMs],
  );
  const [range, setRange] = useState<DateRangeInput>(rangeProp);
  const [capabilities, setCapabilities] = useState(connector.capabilities);

  useEffect(() => {
    setRange(rangeProp);
  }, [rangeProp]);

  useEffect(() => {
    setCapabilities(connector.capabilities);
    void connector.refreshCapabilities?.().then(setCapabilities);
  }, [connector]);

  const query = useCallback(
    (analyticsQuery: AnalyticsQuery) => connector.query(analyticsQuery),
    [connector],
  );

  const realtime = useCallback(async () => {
    if (!connector.realtime) {
      return { visitors: 0 };
    }
    return connector.realtime();
  }, [connector]);

  const value = useMemo(
    () => ({
      connector,
      capabilities,
      range,
      setRange,
      theme,
      query,
      realtime,
      previewQuery,
    }),
    [connector, capabilities, range, theme, query, realtime, previewQuery],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      <div className="ak-root" data-ak-theme={theme}>
        {children}
      </div>
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used inside <AnalyticsProvider>.");
  }
  return ctx;
}

export function queryKey(query: AnalyticsQuery): string {
  return serializeQuery(query);
}
