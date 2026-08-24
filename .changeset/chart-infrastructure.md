---
"@analytics-kit/react": minor
---

Add the shared chart infrastructure: `SyncGroup`, `annotations` and `brush`.

`SyncGroup` shares one hovered index across every chart inside it, so hovering Tuesday in one card highlights Tuesday in all of them. The `annotations` prop draws dated markers — deploys, releases, incidents — over any x-scaled chart, turning a curve into a causal story. `brush` adds a drag-to-zoom strip under the chart.

`AreaChart` and `LineChart` take both new props today. Because these are layers rather than variants, every later chart on the same x-scale inherits them.
