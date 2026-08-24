---
"@analytics-kit/react": minor
---

Add `HorizonChart` and `AreaChart variant="stream"`.

`HorizonChart` folds each series into stacked colour bands so a lane needs about 26px instead of a whole card — twenty series fit where two line charts would. `variant="mirror"` folds negatives back up so a drop reads as depth. `AreaChart variant="stream"` centres the stack on a floating baseline, making each ribbon's own thickness its value.

Also fixes a hydration mismatch in the chart number formatting. `toLocaleString()` follows the runtime's locale, so Node rendered `4279` where the browser rendered `4,279`; all chart numbers now go through a formatter pinned to `en-US`.
