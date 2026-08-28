import { describe, expect, it } from "vitest";
import { numericAxisDomain, rechartsScale } from "./chart.js";
import { AXIS_SCALES } from "./variants.js";

describe("axis scales", () => {
  it("exposes a real symlog scale that crosses zero", () => {
    expect(AXIS_SCALES).toContain("symlog");
    const scale = rechartsScale("symlog");
    expect(scale).not.toBe("log");
    if (scale === "log") throw new Error("expected callable symlog scale");

    scale.domain([-100, 100]).range([0, 200]);
    expect(scale(-100)).toBe(0);
    expect(scale(0)).toBe(100);
    expect(scale(100)).toBe(200);
    expect(scale(-1)).toBeLessThan(scale(0));
    expect(scale(1)).toBeGreaterThan(scale(0));
  });

  it("keeps log away from zero while symlog derives both ends", () => {
    expect(numericAxisDomain("log")).toEqual([1, "auto"]);
    expect(numericAxisDomain("symlog")).toEqual(["auto", "auto"]);
  });
});
