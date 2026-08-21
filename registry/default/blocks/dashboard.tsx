"use client";

import { catalogDashboard, Dashboard } from "@analytics-kit/react";

/**
 * Full widget catalog. Pair with a full-capability connector
 * (or `@analytics-kit/connector-mock` profile `full`).
 */
export function Example() {
  return <Dashboard widgets={catalogDashboard} columns={4} />;
}
