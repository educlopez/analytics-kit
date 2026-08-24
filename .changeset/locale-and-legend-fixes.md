---
"@analytics-kit/react": patch
---

Fix hydration mismatches from locale-dependent number formatting, and stop legend swatches drifting away from their labels.

Twelve call sites across the pie, funnel, ring, sunburst, choropleth and gauge charts, the ranked list and the value dot still used bare `toLocaleString()`, which follows the runtime's locale. When the server's locale differs from the viewer's, React throws a hydration mismatch on every server-rendered number. All of them now go through the formatter pinned to `en-US`.

The legend rows hold three children — swatch, label, value — and `space-between` spread all three, stranding the swatch at the far edge of a wide card. The label now takes the slack instead.
