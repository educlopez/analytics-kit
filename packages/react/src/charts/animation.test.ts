import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * recharts' mount animation starts a mark clipped to zero width, or a line with
 * a ~2px stroke-dasharray on a ~1000px path, and needs a second render to
 * advance. Development gets that second pass from StrictMode's double-render;
 * production does not, so an unguarded mark renders permanently blank there.
 *
 * That shipped once (the area and line charts were empty on the deployed site),
 * so the guard is asserted here rather than left to review.
 */
// fileURLToPath rather than import.meta.dirname: the latter needs Node 20.11,
// and the package declares engines node >=20. Changing a published engine range
// for a test-only convenience is the wrong trade.
const CHARTS_DIR = dirname(fileURLToPath(import.meta.url));

/** recharts marks that animate on mount. Sankey is absent: it takes no such prop. */
const ANIMATED_MARKS = ["Area", "Line", "Bar", "Pie", "RadialBar", "Scatter", "Radar", "Funnel"];

const OPENING_TAG = new RegExp(`<(${ANIMATED_MARKS.join("|")})(\\s|$)`);

const NESTED_OPEN = /<[A-Z][A-Za-z]*/g;
const SELF_CLOSE = /\/>/g;

/**
 * Splits a file into the prop list of every animated mark it renders.
 *
 * Depth is tracked because several marks pass JSX inside a prop — a `dot`
 * renderer returning `<PingDot />`, for instance. Stopping at the first `/>`
 * would end the mark's props at that nested element and report a guarded mark
 * as unguarded.
 */
function markBodies(source: string): { mark: string; body: string; line: number }[] {
  const lines = source.split("\n");
  const found: { mark: string; body: string; line: number }[] = [];

  lines.forEach((line, index) => {
    const match = OPENING_TAG.exec(line.trim());
    if (!match) return;

    const body: string[] = [];
    let depth = 0;
    for (let i = index; i < lines.length; i += 1) {
      const text = lines[i];
      body.push(text);
      // The mark's own opening tag counts as depth 1; anything opened inside a
      // prop pushes deeper, and each `/>` pops one level back.
      depth += (text.match(NESTED_OPEN) ?? []).length;
      depth -= (text.match(SELF_CLOSE) ?? []).length;
      const closesOwnTag = depth <= 0 || (i > index && /^\s*>\s*$/.test(text));
      if (closesOwnTag) break;
    }
    found.push({ mark: match[1], body: body.join("\n"), line: index + 1 });
  });

  return found;
}

describe("recharts mount animation", () => {
  const files = readdirSync(CHARTS_DIR).filter(
    (name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx"),
  );

  it("finds chart sources to check", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const file of files) {
    const source = readFileSync(join(CHARTS_DIR, file), "utf8");
    const marks = markBodies(source);
    if (!marks.length) continue;

    it(`${file} disables it on every animated mark`, () => {
      const unguarded = marks
        .filter((entry) => !entry.body.includes("isAnimationActive={false}"))
        .map((entry) => `${file}:${entry.line} <${entry.mark}>`);

      expect(unguarded).toEqual([]);
    });
  }
});
