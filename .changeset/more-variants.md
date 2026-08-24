---
"@analytics-kit/react": minor
---

Add `BarChart variant="diverging" | "editorial"`, `PieChart variant="half"` and `GaugeChart variant="score"`.

`diverging` runs bars both ways from a zero axis with gainers and losers coloured apart — the natural mark for period deltas. `editorial` drops the axes and grid for display-scale bars with the value set inside them. `half` draws a semicircle at half the height, putting the total in the vacated middle. `score` splits the arc into qualitative bands and names the one the value lands in, because a raw number without its band is not yet an interpretation; the bands are configurable via a new `bands` prop.

Also fixes `formatNumber` rounding fractions away. A pie slice sized from 1.5 printed "2" while recharts used 1.5 for the geometry, and fractional metrics like bounce rate lost their precision. Integers still print as integers.
