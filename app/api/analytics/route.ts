import { createDemoMockConnector } from "@analytics-kit/connector-mock";
import { createVercelConnector } from "@analytics-kit/connector-vercel";
import { createRouteHandlers } from "@analytics-kit/next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const token = process.env.ANALYTICS_VERCEL_TOKEN ?? process.env.VERCEL_TOKEN;
const projectId = process.env.ANALYTICS_VERCEL_PROJECT_ID ?? process.env.VERCEL_PROJECT_ID;
const teamId =
  process.env.ANALYTICS_VERCEL_TEAM_ID ?? process.env.VERCEL_TEAM_ID ?? process.env.VERCEL_ORG_ID;

const connector =
  token && projectId
    ? createVercelConnector({
        token,
        projectId,
        teamId,
      })
    : createDemoMockConnector({ profile: "vercel" });

export const { GET, POST, OPTIONS } = createRouteHandlers({ connector });
