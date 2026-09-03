"use client";

import { useState, type ReactNode } from "react";
import type { BreakdownRow } from "@analytics-kit/core";
import { BreakdownCard, type BreakdownCardVariant } from "@analytics-kit/react";

/**
 * The card is presentational — the host owns which dimension is selected — so
 * the preview has to own that state for the tabs to do anything. Three real
 * queries stand behind them, not three slices of one.
 */
const TABS = [
  { id: "countries", label: "Countries" },
  { id: "devices", label: "Devices" },
  { id: "browsers", label: "Browsers" },
] as const;

/** Two-letter ISO code → regional indicator pair. */
function flag(key: string): ReactNode {
  if (!/^[A-Za-z]{2}$/.test(key)) return undefined;
  const code = key.toUpperCase();
  return (
    <span aria-hidden="true">
      {String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)))}
    </span>
  );
}

export function BreakdownCardPreview({
  countries,
  devices,
  browsers,
  metric,
  variant,
}: {
  countries: BreakdownRow[];
  devices: BreakdownRow[];
  browsers: BreakdownRow[];
  metric: string;
  variant?: BreakdownCardVariant;
}) {
  const [tab, setTab] = useState<string>("countries");
  const source = tab === "devices" ? devices : tab === "browsers" ? browsers : countries;

  const rows = source.slice(0, 6).map((row) => ({
    key: row.key,
    label: row.label ?? row.key,
    value: row.values[metric] ?? 0,
    // The same dimension counted by pageviews — the real "uniques vs total"
    // pair a provider reports, rather than a second invented number.
    secondary: row.values.pageviews,
    // Only countries have a canonical mark. The others go without rather than
    // getting a decorative one.
    icon: tab === "countries" ? flag(row.key) : undefined,
  }));

  return (
    <BreakdownCard
      rows={rows}
      tabs={[...TABS]}
      activeTab={tab}
      onTabChange={setTab}
      valueLabel="Visitors"
      secondaryLabel="Total"
      display="both"
      variant={variant}
      fadeLast
      onExpand={() => {}}
      actions={
        <>
          <button type="button" aria-label="Expand">
            ⤢
          </button>
          <button type="button" aria-label="Share">
            ↗
          </button>
          <button type="button" aria-label="More">
            …
          </button>
        </>
      }
    />
  );
}
