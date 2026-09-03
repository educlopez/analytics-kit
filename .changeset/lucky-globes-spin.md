---
"@analytics-kit/react": minor
---

Four new marks and two new line variants.

- `GlobeChart` puts a country breakdown on a rotating globe, backed by cobe. ISO 3166-1 alpha-2 codes resolve to a committed centroid table, markers scale by area rather than radius, and every marker carries a hit target that names its numbers on hover and pins them on click. Variants: `spin`, `drag`, `focus`, `arcs`, `still` — and the moving ones degrade to `still` under `prefers-reduced-motion`. Without WebGL it reports the shortfall and lists the locations instead of leaving an empty canvas.
- `MetricTabs` makes the metric cards the chart's tabs: a real tablist with a roving tabindex, an inline spark drawn without a chart library, and `cards`, `strip`, `segmented` and `stacked` variants.
- `EmptyState` covers the empty results `Unsupported` never did — what is missing, why, and the way out — as `panel`, `dashed`, `inline` or `compact`.
- `BreakdownCard` wraps a breakdown in the panel a provider dashboard actually has: dimension tabs, two value columns, share or count or both, a faded overflow row, an expand affordance and a hover toolbar. Variants: `bars`, `split`, `plain`, `heat`.
- `LineChart` gains `forecast`, which extends a client-side least-squares trend past the last measured point as a dotted line over a tinted span, and `dual`, which gives each of two keys its own y-axis tinted to its series. `projectSeries` is exported for the projection on its own.
- Variants for six marks that had none: `quota-bar`, `marimekko-chart`, `spark-table`, `timeline-chart`, `strip-chart` and `radial-time-chart`.

Adds `cobe` as a dependency; it is only loaded by `GlobeChart`.
