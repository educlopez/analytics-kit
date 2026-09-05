/**
 * Unversioned alias of /api/v1/analytics, kept for good.
 *
 * It is published in llms.txt, in the docs and in every spec shipped so far.
 * It tracks the newest major rather than being frozen or deprecated; see
 * src/site/analytics-api.ts.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export { GET, POST, OPTIONS, PUT, PATCH, DELETE } from "../../../src/site/analytics-api";
