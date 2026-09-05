/**
 * A fixed-window limiter for the public analytics endpoint.
 *
 * It enforces a real limit rather than decorating responses with headers we do
 * not honour — an advertised limit nobody applies is a lie an agent will plan
 * around. The counters live in module memory, so on a platform that runs more
 * than one instance the *effective* ceiling is this limit times the number of
 * warm instances. That is stated in the API description rather than papered
 * over: the number is a floor an agent can rely on, not a ceiling we promise.
 *
 * Fixed window, not sliding: a caller can spend the whole budget at the end of
 * one window and again at the start of the next. For an abuse guard in front
 * of a demo connector that is the right trade against keeping a timestamp list
 * per client.
 */
export const RATE_LIMIT = {
  /** Requests allowed per window, per client. */
  limit: 60,
  /** Window length in seconds. */
  window: 60,
  /** Name reported in `RateLimit-Policy`. */
  policy: "analytics",
} as const;

export interface RateLimitVerdict {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the window resets; never negative, never zero while limited. */
  reset: number;
}

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/**
 * One client, as well as this can be known behind a proxy.
 *
 * `x-forwarded-for` is a list; the first entry is the original client. It is
 * spoofable, so this is an abuse guard and not a security control — which is
 * also why exceeding it costs a 429 and nothing more.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Count one request against `key` and say whether it may proceed.
 *
 * `now` is injectable so the window behaviour can be tested without waiting a
 * minute for real time to pass.
 */
export function consume(key: string, now: number = Date.now()): RateLimitVerdict {
  prune(now);

  const windowMs = RATE_LIMIT.window * 1000;
  const existing = windows.get(key);
  const current =
    existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + windowMs };

  current.count += 1;
  windows.set(key, current);

  const reset = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return {
    allowed: current.count <= RATE_LIMIT.limit,
    limit: RATE_LIMIT.limit,
    remaining: Math.max(0, RATE_LIMIT.limit - current.count),
    reset,
  };
}

/**
 * Drop expired windows so a long-lived instance does not accumulate one entry
 * per address it has ever seen. Cheap because it only runs once a window.
 */
let lastPrune = 0;
function prune(now: number) {
  if (now - lastPrune < RATE_LIMIT.window * 1000) return;
  lastPrune = now;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/** Test seam: forget every counter. */
export function resetRateLimiter() {
  windows.clear();
  lastPrune = 0;
}

/** The headers every answer carries, so a client can self-throttle before it is told to. */
export function rateLimitHeaders(verdict: RateLimitVerdict): Record<string, string> {
  return {
    "RateLimit-Limit": String(verdict.limit),
    "RateLimit-Remaining": String(verdict.remaining),
    "RateLimit-Reset": String(verdict.reset),
    "RateLimit-Policy": `"${RATE_LIMIT.policy}";q=${verdict.limit};w=${RATE_LIMIT.window}`,
  };
}
