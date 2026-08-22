import { createPlausibleConnector } from "@analytics-kit/connector-plausible";
import { createVercelConnector } from "@analytics-kit/connector-vercel";
import { createGa4Connector } from "@analytics-kit/connector-ga4";
import { createHttpConnector } from "@analytics-kit/core";
import { createRouteHandlers } from "@analytics-kit/next";

/**
 * Server route — keep provider secrets here.
 *
 * app/api/analytics/route.ts
 * Live example: apps/demo/app/api/analytics/route.ts
 */
const connector =
  process.env.ANALYTICS_PROVIDER === "vercel"
    ? createVercelConnector({
        token: process.env.VERCEL_TOKEN!,
        projectId: process.env.VERCEL_PROJECT_ID!,
        teamId: process.env.VERCEL_TEAM_ID,
      })
    : process.env.ANALYTICS_PROVIDER === "ga4"
      ? createGa4Connector({
          accessToken: process.env.GA4_ACCESS_TOKEN!,
          propertyId: process.env.GA4_PROPERTY_ID!,
        })
      : createPlausibleConnector({
          apiKey: process.env.PLAUSIBLE_API_KEY!,
          siteId: process.env.PLAUSIBLE_SITE_ID!,
        });

export const { GET, POST } = createRouteHandlers({ connector });

/**
 * Browser client — widgets talk to this connector, never to vendor APIs.
 *
 * app/dashboard.tsx
 *
 * const remote = createHttpConnector({ endpoint: "/api/analytics" });
 * <AnalyticsProvider connector={remote}><Dashboard /></AnalyticsProvider>
 */
void createHttpConnector;
