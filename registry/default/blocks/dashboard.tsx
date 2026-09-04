"use client";

import { catalogDashboard, Dashboard } from "@wingtics/react";

/**
 * Full widget catalog. Pair with a full-capability connector
 * (or `@wingtics/connector-mock` profile `full`).
 */
export function Example() {
  return <Dashboard widgets={catalogDashboard} columns={4} />;
}
