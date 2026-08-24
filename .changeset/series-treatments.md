---
"@analytics-kit/react": minor
---

Add three cross-cutting treatments to `AreaChart` and `LineChart`: `emphasizeLast`, `previous`, and `gaps`.

`emphasizeLast` draws a terminal dot and a value pill on the final point, on its own layer so it composes with any variant. `previous` takes a second set of rows and draws them dashed underneath, aligned by index rather than by date, adding a Previous row to the tooltip. `gaps` chooses whether a null is bridged across or left open — neither coerces the missing point to zero, which would draw a cliff that reads as a traffic collapse rather than a hole in collection.
