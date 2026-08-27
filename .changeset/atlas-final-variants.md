---
"@analytics-kit/react": minor
---

Add `PieChart variant="callout"`, `RadarChart variant="polygon"`, `ScatterChart variant="field"`, `CandlestickChart variant="volume"`, `FunnelChart variant="flow"` and `BarChart variant="bullet"`.

`callout` runs leader lines to labels outside the ring so the legend disappears. `polygon` swaps the concentric circles for a straight web and appends each axis's count to its label. `field` puts a soft density glow behind each point, turning a scatter into a map you can name places on. `volume` adds a second pane on the same x-scale, since an OHLC move means something different on light volume than on heavy. `flow` shows converted and dropped as separate shapes between steps, because a tapering ribbon never says where the missing people went. `bullet` puts actual, target and qualitative bands in a 24px row, via a new `targetKey`.

`flow` clamps its continued share to 100%: a stage reporting more people than the one before it is not a funnel, and the honest reading is a flat 100% rather than an impossible number.
