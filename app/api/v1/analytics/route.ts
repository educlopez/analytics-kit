/**
 * The versioned analytics endpoint — the one to pin.
 *
 * Both this and the unversioned /api/analytics mount the same handlers from
 * src/site/analytics-api.ts; see the note there for why the alias stays.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export { GET, POST, OPTIONS, PUT, PATCH, DELETE } from "../../../../src/site/analytics-api";
