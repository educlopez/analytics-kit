---
"@analytics-kit/react": minor
---

Add `BumpChart`, `MarimekkoChart`, `SparkTable` and `TimelineChart`.

`BumpChart` plots rank over time — "which pages are climbing" is a rank question, and absolute-value lines hide it behind scale differences. Rank is derived from the values rather than supplied, so it can never disagree with the row it came from. `MarimekkoChart` gives each column a width proportional to its volume and each segment a height proportional to its share, so area is the absolute number and a 60% slice of a sliver stays a sliver. `SparkTable` is a real table — selectable, searchable — with a trailing sparkline and signed delta per row. `TimelineChart` is the standalone twin of the annotations layer, taking the same `{ at, label, kind }` shape.

`SparkTable` introduces a `SparkRow` type, since rows carry a series alongside scalars and `ChartDatum` is `Record<string, string | number>`. Widening `ChartDatum` would have loosened every chart's contract for one component.
