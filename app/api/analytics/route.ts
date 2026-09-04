import { createWingticsMockConnector } from "@wingtics/connector-mock";
import { createVercelConnector } from "@wingtics/connector-vercel";
import { createRouteHandlers } from "@wingtics/next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const token = process.env.ANALYTICS_VERCEL_TOKEN;
const projectId = process.env.ANALYTICS_VERCEL_PROJECT_ID;

const connector =
  token && projectId
    ? createVercelConnector({
        token,
        projectId,
        teamId: process.env.ANALYTICS_VERCEL_TEAM_ID,
      })
    : createWingticsMockConnector({ profile: "vercel" });

export const { GET, POST, OPTIONS, PUT, PATCH, DELETE } = createRouteHandlers({ connector });
