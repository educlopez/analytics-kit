"use client";

import {
  AnalyticsProvider,
  type AnalyticsStyleName,
  type AnalyticsStyleOverrides,
  type AnalyticsTheme,
} from "@analytics-kit/react";
import type { AnalyticsConnector } from "@analytics-kit/core";
import type { ReactNode } from "react";

/**
 * Drop this around any dashboard. `style` swaps the named look;
 * `tokens` overrides individual CSS variables (`accent`, `chart1`…).
 */
export function Example({
  connector,
  style = "editorial",
  theme = "light",
  tokens,
  children,
}: {
  connector: AnalyticsConnector;
  style?: AnalyticsStyleName;
  theme?: AnalyticsTheme;
  tokens?: AnalyticsStyleOverrides;
  children: ReactNode;
}) {
  return (
    <AnalyticsProvider connector={connector} style={style} theme={theme} tokens={tokens}>
      {children}
    </AnalyticsProvider>
  );
}
