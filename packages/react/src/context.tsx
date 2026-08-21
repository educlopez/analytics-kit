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
import {
  tokensToCssVars,
  type AnalyticsStyleName,
  type AnalyticsStyleOverrides,
  type AnalyticsTheme,
} from "./style.js";

export type { AnalyticsTheme };

export interface AnalyticsContextValue {
  connector: AnalyticsConnector;
  capabilities: ConnectorCapabilities;
  range: DateRangeInput;
  setRange: (range: DateRangeInput) => void;
  theme: AnalyticsTheme;
  style: AnalyticsStyleName;
  query: (query: AnalyticsQuery) => Promise<AnalyticsResult>;
  realtime: () => Promise<RealtimeResult>;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export interface AnalyticsProviderProps {
  connector: AnalyticsConnector;
  range?: DateRangeInput;
  theme?: AnalyticsTheme;
  /** Named look for every widget. `editorial` | `ink` | `shadcn`. */
  style?: AnalyticsStyleName;
  /** Partial token overrides on top of the named style. */
  tokens?: AnalyticsStyleOverrides;
  cacheTtlMs?: number;
  children: ReactNode;
}

export function AnalyticsProvider({
  connector: rawConnector,
  range: rangeProp = "7d",
  theme = "dark",
  style = "ink",
  tokens,
  cacheTtlMs = 30_000,
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
      style,
      query,
      realtime,
    }),
    [connector, capabilities, range, theme, style, query, realtime],
  );

  const tokenStyle = useMemo(() => (tokens ? tokensToCssVars(tokens) : undefined), [tokens]);

  return (
    <AnalyticsContext.Provider value={value}>
      <div className="ak-root" data-ak-theme={theme} data-ak-style={style} style={tokenStyle}>
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
