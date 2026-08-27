---
"@analytics-kit/react": minor
---

Add the texture variants (`riso`, `screentone`, `grain`) and a `scale` prop for log axes.

`screentone` is a halftone dot screen where density carries the value, so it still reads in print, in a photocopy, or to someone who cannot separate the palette's hues. `riso` prints the shape twice slightly out of register — the misalignment is the effect. `grain` lays fine film noise over the fill.

`scale="log"` makes long-tail data readable; on a linear axis the tail is simply invisible. There is no `symlog`: recharts' `ScaleType` does not include it, and shipping an option that silently does nothing is worse than not shipping it. A log axis cannot represent zero either, so its floor is pinned to 1 rather than dropping the point without saying so.
