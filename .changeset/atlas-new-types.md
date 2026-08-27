---
"@analytics-kit/react": minor
---

Add `WaterfallChart`, `ShareBand`, `SlopeChart` and `QuotaBar`.

`WaterfallChart` bridges a start total to an end total with floating signed bars and connectors carrying the running total, answering "where did the change come from" — a question a time series never answers, since it only shows that a number moved. `ShareBand` is a single 100% band that says in 20px what a donut needs 200px to say, and doubles as a table header. `SlopeChart` joins two dated axes with one line per item, so the slope _is_ the change and crossings are the story. `QuotaBar` draws usage against a ceiling with a limit marker and an optional projection — none of the cartesian marks express a _limit_, only a quantity.

All four are hand-drawn, so none adds a dependency.
