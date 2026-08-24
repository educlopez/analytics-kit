---
"@analytics-kit/react": minor
---

Add `CohortGrid` and `TreemapChart`.

`CohortGrid` puts cohorts down and periods across, heat-tinting each cell by retained share. Rows stay ragged on purpose: a cohort that started three weeks ago has three periods of history, and padding it to full width would invent data. `TreemapChart` packs categories by value using a squarified layout, so tiles stay readable rather than collapsing into slivers; `variant="diverging"` colours by the sign of a delta instead.

Both are hand-drawn rather than recharts-backed, so neither adds a dependency.
