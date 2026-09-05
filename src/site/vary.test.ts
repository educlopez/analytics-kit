import { describe, expect, it } from "vitest";
import { varies } from "./vary.mjs";

describe("varies", () => {
  it("finds a field that is a real list member", () => {
    expect(varies("Accept, Accept-Encoding", "accept")).toBe(true);
    expect(varies("accept", "accept")).toBe(true);
    expect(varies("rsc, Accept, next-router-prefetch", "accept")).toBe(true);
  });

  // The bug this module exists for: a `\b`-anchored regex, or a substring
  // test, calls this a match. Next puts `Accept-Encoding` on every page
  // response, so getting this wrong makes the assertion permanently green.
  it("does not mistake Accept-Encoding for Accept", () => {
    const nextsPageVary =
      "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding";
    expect(/\baccept\b/i.test(nextsPageVary)).toBe(true); // what the old check did
    expect(varies(nextsPageVary, "accept")).toBe(false); // what it should have done
  });

  it("is case- and whitespace-insensitive on both sides", () => {
    expect(varies("  ACCEPT ,  rsc ", "Accept")).toBe(true);
  });

  it("treats a missing or empty header as no fields", () => {
    expect(varies(null, "accept")).toBe(false);
    expect(varies("", "accept")).toBe(false);
  });
});
