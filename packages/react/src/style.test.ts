import { describe, expect, it } from "vitest";
import { resolveAnalyticsStyle, tokensToCssVars } from "./style.js";

describe("analytics styles", () => {
  it("resolves named looks for light and dark", () => {
    const editorial = resolveAnalyticsStyle("editorial", "light");
    expect(editorial.accent).toBe("#1d779b");
    expect(editorial.headingFont).toMatch(/Newsreader/);

    const ink = resolveAnalyticsStyle("ink", "dark");
    expect(ink.bg).toBe("#0b0f14");

    const shadcn = resolveAnalyticsStyle("shadcn", "light");
    expect(shadcn.radius).toBe("0.75rem");
  });

  it("lets tokens override a named style", () => {
    const tokens = resolveAnalyticsStyle("editorial", "light", { accent: "#111111" });
    expect(tokens.accent).toBe("#111111");
    expect(tokens.chart1).toBe("#1d779b");
  });

  it("maps overrides onto CSS variables", () => {
    const css = tokensToCssVars({ accent: "#abc", chart1: "#def" });
    expect(css).toMatchObject({ "--ak-accent": "#abc", "--ak-chart-1": "#def" });
  });
});
