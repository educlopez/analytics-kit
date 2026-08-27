---
"@analytics-kit/react": minor
---

Add `LineChart variant="focus" | "anomaly"` and `AreaChart variant="band" | "ridge"`.

`focus` draws every series faint and promotes the hovered one, so twenty lines stay legible — the interaction is the variant, with no extra state. `anomaly` rings points that sit far from a rolling median, using MAD computed client-side with no model or service; the strictness is tunable through `anomalyThreshold`, and defaults high because a chart that rings every wobble trains people to ignore the rings.

`band` draws a ribbon between the current and previous series with the line inside it, rendering `previous` as a shape instead of a second line. `ridge` gives each series its own baseline, offset upward and overlapping the one behind with an opaque fill, so the occlusion reads as depth.
