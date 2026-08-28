import { describe, expect, expectTypeOf, it } from "vitest";
import type { CandleDatum } from "./index.js";

describe("CandleDatum", () => {
  it("keeps volume optional for price-only consumers", () => {
    const legacy: CandleDatum = { date: "2026-08-01", open: 10, high: 14, low: 8, close: 12 };
    const withVolume: CandleDatum = { ...legacy, volume: 18_400 };

    expect(legacy.volume).toBeUndefined();
    expect(withVolume.volume).toBe(18_400);
    expectTypeOf(withVolume.volume).toEqualTypeOf<number | undefined>();
  });
});
