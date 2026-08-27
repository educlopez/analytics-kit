---
"@analytics-kit/react": minor
---

Add `StripChart`, `RadialTimeChart`, `Odometer` and `SmallMultiples`.

`StripChart` puts one tick per event in a lane per event name, with no aggregation — bursts, gaps and correlated spikes disappear the moment you bucket, which is what every other time mark here does. `RadialTimeChart` wraps hours around a circle with weekdays as rings, so a burst straddling midnight reads as one burst rather than two at opposite ends of a rectangle.

`Odometer` rolls a number to its new value instead of replacing it, animating from what is on screen so a change arriving mid-roll continues from where the digits actually are, and honouring `prefers-reduced-motion`. `SmallMultiples` lays out one miniature per category on a locked shared domain — without it the eye compares shapes drawn to different rulers and concludes things that are not true.
