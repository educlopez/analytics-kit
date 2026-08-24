---
"@analytics-kit/react": minor
---

Add the multi-series composition variants: `AreaChart variant="stacked"` and `BarChart variant="grouped" | "stacked" | "stacked-100"`.

Both components take a new optional `dataKeys: string[]` naming the series to compose, defaulting to `[dataKey]` so every existing call is unchanged. The multi-series variants render a per-series tooltip (with a total, where a total means something) and a series legend. `stacked-100` rebases only the drawing to share — the tooltip still reports the real counts.
