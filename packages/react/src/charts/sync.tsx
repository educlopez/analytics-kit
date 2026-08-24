"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface SyncState {
  /** Index of the hovered point, shared across every chart in the group. */
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  /** recharts' own syncId, so charts on the same x-scale share their tooltip. */
  syncId: string;
}

const SyncContext = createContext<SyncState | null>(null);

/**
 * Shares one hovered index across every chart inside it.
 *
 * Hovering Tuesday in one card highlights Tuesday in all of them, which is the
 * difference between nine separate charts and one dashboard. recharts already
 * has `syncId` for charts that share an x-scale; this adds the surrounding
 * state so non-recharts marks (heatmap, cohort, horizon) can join in too.
 */
export function SyncGroup({ id, children }: { id: string; children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const value = useMemo(() => ({ activeIndex, setActiveIndex, syncId: id }), [activeIndex, id]);
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

/**
 * Returns the group a chart belongs to, or null when it stands alone.
 *
 * Null rather than a default group: charts outside a SyncGroup must not
 * accidentally share a hover with every other chart on the page.
 */
export function useSyncGroup(): SyncState | null {
  return useContext(SyncContext);
}
