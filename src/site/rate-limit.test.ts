import { beforeEach, describe, expect, it } from "vitest";
import { RATE_LIMIT, clientKey, consume, rateLimitHeaders, resetRateLimiter } from "./rate-limit";

beforeEach(() => resetRateLimiter());

const T0 = 1_700_000_000_000;

describe("consume", () => {
  it("allows exactly the limit, then refuses", () => {
    for (let i = 1; i <= RATE_LIMIT.limit; i++) {
      const verdict = consume("a", T0);
      expect(verdict.allowed, `request ${i}`).toBe(true);
      expect(verdict.remaining).toBe(RATE_LIMIT.limit - i);
    }
    const over = consume("a", T0);
    expect(over.allowed).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it("counts each client separately", () => {
    for (let i = 0; i < RATE_LIMIT.limit; i++) consume("a", T0);
    expect(consume("a", T0).allowed).toBe(false);
    expect(consume("b", T0).allowed).toBe(true);
  });

  it("starts a fresh window once the old one has passed", () => {
    for (let i = 0; i < RATE_LIMIT.limit; i++) consume("a", T0);
    expect(consume("a", T0).allowed).toBe(false);

    const later = T0 + RATE_LIMIT.window * 1000 + 1;
    const verdict = consume("a", later);
    expect(verdict.allowed).toBe(true);
    expect(verdict.remaining).toBe(RATE_LIMIT.limit - 1);
  });

  // Reset has to shrink as the window runs down, or a client told "60" every
  // time will keep retrying a whole window too early.
  it("counts reset down within the window", () => {
    const first = consume("a", T0);
    const late = consume("a", T0 + (RATE_LIMIT.window - 5) * 1000);
    expect(first.reset).toBe(RATE_LIMIT.window);
    expect(late.reset).toBeLessThan(first.reset);
    expect(late.reset).toBeGreaterThan(0);
  });

  it("never reports a reset a client could read as zero seconds", () => {
    consume("a", T0);
    const atTheEdge = consume("a", T0 + RATE_LIMIT.window * 1000 - 1);
    expect(atTheEdge.reset).toBeGreaterThanOrEqual(1);
  });
});

describe("clientKey", () => {
  // x-forwarded-for is a list and the first entry is the original client;
  // taking the last one buckets every caller behind the same proxy together.
  it("takes the first address in x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" },
    });
    expect(clientKey(request)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then to a shared bucket", () => {
    expect(
      clientKey(new Request("https://e.com", { headers: { "x-real-ip": "198.51.100.4" } })),
    ).toBe("198.51.100.4");
    expect(clientKey(new Request("https://e.com"))).toBe("unknown");
  });
});

describe("rateLimitHeaders", () => {
  it("reports the budget in the RFC fields", () => {
    const headers = rateLimitHeaders(consume("a", T0));
    expect(headers["RateLimit-Limit"]).toBe(String(RATE_LIMIT.limit));
    expect(headers["RateLimit-Remaining"]).toBe(String(RATE_LIMIT.limit - 1));
    expect(headers["RateLimit-Reset"]).toBe(String(RATE_LIMIT.window));
    expect(headers["RateLimit-Policy"]).toBe(
      `"${RATE_LIMIT.policy}";q=${RATE_LIMIT.limit};w=${RATE_LIMIT.window}`,
    );
  });
});
