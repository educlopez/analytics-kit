---
"@analytics-kit/react": minor
---

Add `RankedList variant="inset" | "dual"`, `MetricCard variant="bleed" | "histogram"` and `HeatmapChart variant="month"`.

`inset` makes the bar the row's own background rather than a separate track below it, halving the row height and keeping the label attached to its magnitude. `dual` adds a share column beside the count, because a percentage on its own is the classic dashboard ambiguity. `bleed` runs the sparkline edge to edge above the number instead of beside it. `histogram` puts twelve inline micro-bars in the text as a typographic element rather than a chart. `month` draws a real weekday calendar grid — the existing `calendar` variant is a year strip.
