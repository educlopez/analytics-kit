---
"@analytics-kit/react": patch
---

Keep the metric-card sparkline a fixed 36px tall instead of scaling with the
card's width. In a widened card (`span: 2`) the viewBox ratio grew it to 150px
against 68px in its neighbours, and grid stretch then forced the whole row to
match. The path stretches horizontally now, with a non-scaling stroke so the
line keeps its weight.
