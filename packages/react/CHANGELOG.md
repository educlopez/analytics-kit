# @analytics-kit/react

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - @wingtics/core@0.6.1

## 0.6.0

### Minor Changes

- [#44](https://github.com/educlopez/analytics-kit/pull/44) [`3551a3d`](https://github.com/educlopez/analytics-kit/commit/3551a3de3ab7195e73e5426de865a41cb09bbcf0) Thanks [@educlopez](https://github.com/educlopez)! - Four new marks and two new line variants.

  - `GlobeChart` puts a country breakdown on a rotating globe, backed by cobe. ISO 3166-1 alpha-2 codes resolve to a committed centroid table, markers scale by area rather than radius, and every marker carries a hit target that names its numbers on hover and pins them on click. Variants: `spin`, `drag`, `focus`, `arcs`, `still` — and the moving ones degrade to `still` under `prefers-reduced-motion`. Without WebGL it reports the shortfall and lists the locations instead of leaving an empty canvas.
  - `MetricTabs` makes the metric cards the chart's tabs: a real tablist with a roving tabindex, an inline spark drawn without a chart library, and `cards`, `strip`, `segmented` and `stacked` variants.
  - `EmptyState` covers the empty results `Unsupported` never did — what is missing, why, and the way out — as `panel`, `dashed`, `inline` or `compact`.
  - `BreakdownCard` wraps a breakdown in the panel a provider dashboard actually has: dimension tabs, two value columns, share or count or both, a faded overflow row, an expand affordance and a hover toolbar. Variants: `bars`, `split`, `plain`, `heat`.
  - `LineChart` gains `forecast`, which extends a client-side least-squares trend past the last measured point as a dotted line over a tinted span, and `dual`, which gives each of two keys its own y-axis tinted to its series. `projectSeries` is exported for the projection on its own.
  - Variants for six marks that had none: `quota-bar`, `marimekko-chart`, `spark-table`, `timeline-chart`, `strip-chart` and `radial-time-chart`.

  Adds `cobe` as a dependency; it is only loaded by `GlobeChart`.

- [#39](https://github.com/educlopez/analytics-kit/pull/39) [`bbe70bc`](https://github.com/educlopez/analytics-kit/commit/bbe70bc292bd8acd0e8177e2e066c6d9ce64a680) Thanks [@educlopez](https://github.com/educlopez)! - Add optional real volume to `CandleDatum`, use it in the candlestick volume pane without drawing phantom zero-volume bars, group legend swatches with their labels, and support custom symlog axes on area and line charts.

### Patch Changes

- Updated dependencies [[`bbe70bc`](https://github.com/educlopez/analytics-kit/commit/bbe70bc292bd8acd0e8177e2e066c6d9ce64a680)]:
  - @analytics-kit/core@0.6.0

## 0.5.0

### Minor Changes

- [#33](https://github.com/educlopez/analytics-kit/pull/33) [`8474d4e`](https://github.com/educlopez/analytics-kit/commit/8474d4e3aa298a757e7451e04ccc3b63cc25f462) Thanks [@educlopez](https://github.com/educlopez)! - Add `PieChart variant="callout"`, `RadarChart variant="polygon"`, `ScatterChart variant="field"`, `CandlestickChart variant="volume"`, `FunnelChart variant="flow"` and `BarChart variant="bullet"`.

  `callout` runs leader lines to labels outside the ring so the legend disappears. `polygon` swaps the concentric circles for a straight web and appends each axis's count to its label. `field` puts a soft density glow behind each point, turning a scatter into a map you can name places on. `volume` adds a second pane on the same x-scale, since an OHLC move means something different on light volume than on heavy. `flow` shows converted and dropped as separate shapes between steps, because a tapering ribbon never says where the missing people went. `bullet` puts actual, target and qualitative bands in a 24px row, via a new `targetKey`.

  `flow` clamps its continued share to 100%: a stage reporting more people than the one before it is not a funnel, and the honest reading is a flat 100% rather than an impossible number.

- [#37](https://github.com/educlopez/analytics-kit/pull/37) [`07116b0`](https://github.com/educlopez/analytics-kit/commit/07116b027a0396dbb374a5a61658739e3ec12a19) Thanks [@educlopez](https://github.com/educlopez)! - Add `StripChart`, `RadialTimeChart`, `Odometer` and `SmallMultiples`.

  `StripChart` puts one tick per event in a lane per event name, with no aggregation — bursts, gaps and correlated spikes disappear the moment you bucket, which is what every other time mark here does. `RadialTimeChart` wraps hours around a circle with weekdays as rings, so a burst straddling midnight reads as one burst rather than two at opposite ends of a rectangle.

  `Odometer` rolls a number to its new value instead of replacing it, animating from what is on screen so a change arriving mid-roll continues from where the digits actually are, and honouring `prefers-reduced-motion`. `SmallMultiples` lays out one miniature per category on a locked shared domain — without it the eye compares shapes drawn to different rulers and concludes things that are not true.

- [#33](https://github.com/educlopez/analytics-kit/pull/33) [`ce7b32b`](https://github.com/educlopez/analytics-kit/commit/ce7b32b35e8e0ac0a694f2f4937a73ea0a051af5) Thanks [@educlopez](https://github.com/educlopez)! - Add `LineChart variant="focus" | "anomaly"` and `AreaChart variant="band" | "ridge"`.

  `focus` draws every series faint and promotes the hovered one, so twenty lines stay legible — the interaction is the variant, with no extra state. `anomaly` rings points that sit far from a rolling median, using MAD computed client-side with no model or service; the strictness is tunable through `anomalyThreshold`, and defaults high because a chart that rings every wobble trains people to ignore the rings.

  `band` draws a ribbon between the current and previous series with the line inside it, rendering `previous` as a shape instead of a second line. `ridge` gives each series its own baseline, offset upward and overlapping the one behind with an opaque fill, so the occlusion reads as depth.

- [#35](https://github.com/educlopez/analytics-kit/pull/35) [`edab950`](https://github.com/educlopez/analytics-kit/commit/edab950dd376ab748fb38c3e9f0eb5537f983849) Thanks [@educlopez](https://github.com/educlopez)! - Add `WaterfallChart`, `ShareBand`, `SlopeChart` and `QuotaBar`.

  `WaterfallChart` bridges a start total to an end total with floating signed bars and connectors carrying the running total, answering "where did the change come from" — a question a time series never answers, since it only shows that a number moved. `ShareBand` is a single 100% band that says in 20px what a donut needs 200px to say, and doubles as a table header. `SlopeChart` joins two dated axes with one line per item, so the slope _is_ the change and crossings are the story. `QuotaBar` draws usage against a ceiling with a limit marker and an optional projection — none of the cartesian marks express a _limit_, only a quantity.

  All four are hand-drawn, so none adds a dependency.

- [#33](https://github.com/educlopez/analytics-kit/pull/33) [`b16c4c9`](https://github.com/educlopez/analytics-kit/commit/b16c4c91d2acbb5d7a4507560ae5061d4a5f4c8a) Thanks [@educlopez](https://github.com/educlopez)! - Add `RankedList variant="inset" | "dual"`, `MetricCard variant="bleed" | "histogram"` and `HeatmapChart variant="month"`.

  `inset` makes the bar the row's own background rather than a separate track below it, halving the row height and keeping the label attached to its magnitude. `dual` adds a share column beside the count, because a percentage on its own is the classic dashboard ambiguity. `bleed` runs the sparkline edge to edge above the number instead of beside it. `histogram` puts twelve inline micro-bars in the text as a typographic element rather than a chart. `month` draws a real weekday calendar grid — the existing `calendar` variant is a year strip.

- [#38](https://github.com/educlopez/analytics-kit/pull/38) [`a81cc46`](https://github.com/educlopez/analytics-kit/commit/a81cc4693dd379cee5ffd78ab7b6b85e6524cf48) Thanks [@educlopez](https://github.com/educlopez)! - Add the texture variants (`riso`, `screentone`, `grain`) and a `scale` prop for log axes.

  `screentone` is a halftone dot screen where density carries the value, so it still reads in print, in a photocopy, or to someone who cannot separate the palette's hues. `riso` prints the shape twice slightly out of register — the misalignment is the effect. `grain` lays fine film noise over the fill.

  `scale="log"` makes long-tail data readable; on a linear axis the tail is simply invisible. There is no `symlog`: recharts' `ScaleType` does not include it, and shipping an option that silently does nothing is worse than not shipping it. A log axis cannot represent zero either, so its floor is pinned to 1 rather than dropping the point without saying so.

- [#36](https://github.com/educlopez/analytics-kit/pull/36) [`6184f62`](https://github.com/educlopez/analytics-kit/commit/6184f629b719be01c6ebc042d4e8a741f3e77fcd) Thanks [@educlopez](https://github.com/educlopez)! - Add `BumpChart`, `MarimekkoChart`, `SparkTable` and `TimelineChart`.

  `BumpChart` plots rank over time — "which pages are climbing" is a rank question, and absolute-value lines hide it behind scale differences. Rank is derived from the values rather than supplied, so it can never disagree with the row it came from. `MarimekkoChart` gives each column a width proportional to its volume and each segment a height proportional to its share, so area is the absolute number and a 60% slice of a sliver stays a sliver. `SparkTable` is a real table — selectable, searchable — with a trailing sparkline and signed delta per row. `TimelineChart` is the standalone twin of the annotations layer, taking the same `{ at, label, kind }` shape.

  `SparkTable` introduces a `SparkRow` type, since rows carry a series alongside scalars and `ChartDatum` is `Record<string, string | number>`. Widening `ChartDatum` would have loosened every chart's contract for one component.

### Patch Changes

- Updated dependencies []:
  - @analytics-kit/core@0.5.0

## 0.4.0

### Minor Changes

- [#30](https://github.com/educlopez/analytics-kit/pull/30) [`c13d19f`](https://github.com/educlopez/analytics-kit/commit/c13d19ffafab0c84d151f97e3c936015f87c0c8f) Thanks [@educlopez](https://github.com/educlopez)! - Add the shared chart infrastructure: `SyncGroup`, `annotations` and `brush`.

  `SyncGroup` shares one hovered index across every chart inside it, so hovering Tuesday in one card highlights Tuesday in all of them. The `annotations` prop draws dated markers — deploys, releases, incidents — over any x-scaled chart, turning a curve into a causal story. `brush` adds a drag-to-zoom strip under the chart.

  `AreaChart` and `LineChart` take both new props today. Because these are layers rather than variants, every later chart on the same x-scale inherits them.

- [#27](https://github.com/educlopez/analytics-kit/pull/27) [`f0fc0cd`](https://github.com/educlopez/analytics-kit/commit/f0fc0cd78ba11cb2f8113c9544728075230529e6) Thanks [@educlopez](https://github.com/educlopez)! - Add `CohortGrid` and `TreemapChart`.

  `CohortGrid` puts cohorts down and periods across, heat-tinting each cell by retained share. Rows stay ragged on purpose: a cohort that started three weeks ago has three periods of history, and padding it to full width would invent data. `TreemapChart` packs categories by value using a squarified layout, so tiles stay readable rather than collapsing into slivers; `variant="diverging"` colours by the sign of a delta instead.

  Both are hand-drawn rather than recharts-backed, so neither adds a dependency.

- [#24](https://github.com/educlopez/analytics-kit/pull/24) [`355e03a`](https://github.com/educlopez/analytics-kit/commit/355e03aae9397732b60a8c75c23dfb4e78011ba6) Thanks [@educlopez](https://github.com/educlopez)! - Add the multi-series composition variants: `AreaChart variant="stacked"` and `BarChart variant="grouped" | "stacked" | "stacked-100"`.

  Both components take a new optional `dataKeys: string[]` naming the series to compose, defaulting to `[dataKey]` so every existing call is unchanged. The multi-series variants render a per-series tooltip (with a total, where a total means something) and a series legend. `stacked-100` rebases only the drawing to share — the tooltip still reports the real counts.

- [#32](https://github.com/educlopez/analytics-kit/pull/32) [`697c7fe`](https://github.com/educlopez/analytics-kit/commit/697c7fea7c7e8f34660f9168555354d7d194c3a5) Thanks [@educlopez](https://github.com/educlopez)! - Add `BarChart variant="diverging" | "editorial"`, `PieChart variant="half"` and `GaugeChart variant="score"`.

  `diverging` runs bars both ways from a zero axis with gainers and losers coloured apart — the natural mark for period deltas. `editorial` drops the axes and grid for display-scale bars with the value set inside them. `half` draws a semicircle at half the height, putting the total in the vacated middle. `score` splits the arc into qualitative bands and names the one the value lands in, because a raw number without its band is not yet an interpretation; the bands are configurable via a new `bands` prop.

  Also fixes `formatNumber` rounding fractions away. A pie slice sized from 1.5 printed "2" while recharts used 1.5 for the geometry, and fractional metrics like bounce rate lost their precision. Integers still print as integers.

- [#25](https://github.com/educlopez/analytics-kit/pull/25) [`c57931d`](https://github.com/educlopez/analytics-kit/commit/c57931d2511dcd0161235fbccab26e19a427d67f) Thanks [@educlopez](https://github.com/educlopez)! - Add three cross-cutting treatments to `AreaChart` and `LineChart`: `emphasizeLast`, `previous`, and `gaps`.

  `emphasizeLast` draws a terminal dot and a value pill on the final point, on its own layer so it composes with any variant. `previous` takes a second set of rows and draws them dashed underneath, aligned by index rather than by date, adding a Previous row to the tooltip. `gaps` chooses whether a null is bridged across or left open — neither coerces the missing point to zero, which would draw a cliff that reads as a traffic collapse rather than a hole in collection.

- [#26](https://github.com/educlopez/analytics-kit/pull/26) [`77a4332`](https://github.com/educlopez/analytics-kit/commit/77a4332ce985c4043dcf0e1c5020f6c2387b6c60) Thanks [@educlopez](https://github.com/educlopez)! - Add `HorizonChart` and `AreaChart variant="stream"`.

  `HorizonChart` folds each series into stacked colour bands so a lane needs about 26px instead of a whole card — twenty series fit where two line charts would. `variant="mirror"` folds negatives back up so a drop reads as depth. `AreaChart variant="stream"` centres the stack on a floating baseline, making each ribbon's own thickness its value.

  Also fixes a hydration mismatch in the chart number formatting. `toLocaleString()` follows the runtime's locale, so Node rendered `4279` where the browser rendered `4,279`; all chart numbers now go through a formatter pinned to `en-US`.

### Patch Changes

- [#31](https://github.com/educlopez/analytics-kit/pull/31) [`6c5528c`](https://github.com/educlopez/analytics-kit/commit/6c5528c6725eff19f1533c1cff0cd0b0930b21a1) Thanks [@educlopez](https://github.com/educlopez)! - Fix hydration mismatches from locale-dependent number formatting, and stop legend swatches drifting away from their labels.

  Twelve call sites across the pie, funnel, ring, sunburst, choropleth and gauge charts, the ranked list and the value dot still used bare `toLocaleString()`, which follows the runtime's locale. When the server's locale differs from the viewer's, React throws a hydration mismatch on every server-rendered number. All of them now go through the formatter pinned to `en-US`.

  The legend rows hold three children — swatch, label, value — and `space-between` spread all three, stranding the swatch at the far edge of a wide card. The label now takes the slack instead.

- [#22](https://github.com/educlopez/analytics-kit/pull/22) [`f9615d7`](https://github.com/educlopez/analytics-kit/commit/f9615d74761da7e9dec4391c4296461ff2510bb7) Thanks [@educlopez](https://github.com/educlopez)! - Keep the metric-card sparkline a fixed 36px tall instead of scaling with the
  card's width. In a widened card (`span: 2`) the viewBox ratio grew it to 150px
  against 68px in its neighbours, and grid stretch then forced the whole row to
  match. The path stretches horizontally now, with a non-scaling stroke so the
  line keeps its weight.
- Updated dependencies [[`d22f48a`](https://github.com/educlopez/analytics-kit/commit/d22f48a4fcbcceae3fb470ce88048aee526df80b)]:
  - @analytics-kit/core@0.4.0

## 0.3.0

### Minor Changes

- [#18](https://github.com/educlopez/analytics-kit/pull/18) [`4e68bba`](https://github.com/educlopez/analytics-kit/commit/4e68bba74568cb941ddf7fb916d95d7cb82ba3d8) Thanks [@educlopez](https://github.com/educlopez)! - Fix the Vercel connector's capability profile: `source`, `medium`, `campaign`,
  `eventName`, and `events` are paid-plan-only Web Analytics features and now
  correctly report as unsupported instead of letting widgets request them and
  hit HTTP 402. A 402 encountered at runtime (or any other capability gap
  discovered mid-query) now degrades that one slice to an empty result instead
  of failing the whole query or surfacing a 502. `@analytics-kit/connector-mock`'s
  `vercel` profile mirrors the same limits so local/dev previews stay honest.

  Also hardens the Vercel connector's totals request: the outbound `until`
  timestamp is clamped so it's never in the future, and the visit-count response
  is parsed defensively in case it comes back array-shaped like the aggregate
  endpoint does.

  Adds `withSampleFallback` to `@analytics-kit/core`: wrap a connector so a query
  that's unsupported, errors, or comes back with no signal (all-zero totals,
  empty breakdown, empty series) transparently falls back to a sample connector
  instead of an error or an empty widget, tagging the result with
  `meta.sample = true`.

  `@analytics-kit/react` widgets and `useQuery` now surface that flag: `WidgetFrame`
  accepts `kind` (for a loading skeleton shaped like the widget's real layout,
  to avoid layout shift), `sample` (renders a "Sample" badge), and `onRetry`
  (shown as a Retry action on error). The loading skeleton also shows a "Still
  loading…" note after a few seconds and respects `prefers-reduced-motion`.
  Fixes a pre-existing bug where `.ak-tracker-cell` had no size/color rule and
  rendered invisible.

  Fixes charts that never painted on first mount. `Pie`, `RadialBar`, `Bar`,
  `Line` and `Area` series mounted with their layer present but no geometry until
  something forced a re-render, because recharts starts its entrance animation
  from an effect that never fired here — they now draw immediately. `ProfitLossChart`
  also wrapped its series in a React fragment, which hides them from recharts'
  child walk entirely, so the chart rendered bare axes; the series are passed as
  an array now.

  Accessibility and touch-target fixes across the widgets. Loading, error and
  sample transitions are announced (`aria-live`, `aria-busy`, `role="alert"`) —
  previously a screen reader was told nothing when a widget resolved — and the
  "Still loading…" note moved out of the `aria-hidden` skeleton wrapper. The
  sample badge gets a dedicated `--ak-notice` token that clears WCAG AA on both
  themes (it borrowed `--ak-chart-3`, which fails at text sizes and also encodes
  real data inside the same widgets) plus a screen-reader-only explanation. The
  range switcher and the Retry button now meet the 44px minimum. Skeletons no
  longer misreport shape: list and table rows follow the query's `limit`, the
  tracker follows the active range, the donut stacks like `PieChart` actually
  renders, and `variant="bars"` gets the chart skeleton rather than a row list.

### Patch Changes

- Updated dependencies [[`4e68bba`](https://github.com/educlopez/analytics-kit/commit/4e68bba74568cb941ddf7fb916d95d7cb82ba3d8)]:
  - @analytics-kit/core@0.3.0

## 0.2.1

### Patch Changes

- [`d18ba26`](https://github.com/educlopez/analytics-kit/commit/d18ba266207b56b9a913970d7c143c5a0a49af1a) Thanks [@educlopez](https://github.com/educlopez)! - Publish with npm provenance attestations, via OIDC trusted publishing instead of a
  long-lived token. Consumers can now verify that a tarball was built by this
  repository's release workflow.
- Updated dependencies [[`d18ba26`](https://github.com/educlopez/analytics-kit/commit/d18ba266207b56b9a913970d7c143c5a0a49af1a)]:
  - @analytics-kit/core@0.2.1

## 0.2.0

### Minor Changes

- [#9](https://github.com/educlopez/analytics-kit/pull/9) [`24fcf9f`](https://github.com/educlopez/analytics-kit/commit/24fcf9f53286620bb7db692836717adb30159f92) Thanks [@educlopez](https://github.com/educlopez)! - Chart components now use Tailwind + Recharts with visual `variant`s (gradient, step, horizontal, donut…). Color themes were removed; charts inherit --chart-1…5 from the host site.

- [#13](https://github.com/educlopez/analytics-kit/pull/13) [`cfed8a4`](https://github.com/educlopez/analytics-kit/commit/cfed8a476e34443f8b37061c1c18a6f2d1bfde10) Thanks [@educlopez](https://github.com/educlopez)! - Charts gain `dither` (stipple fill) and `glow` drawing variants. Area and line accept both; bar and pie accept dither.

- [#14](https://github.com/educlopez/analytics-kit/pull/14) [`ac9281e`](https://github.com/educlopez/analytics-kit/commit/ac9281e33416f2c048f873331eab379c0e817d84) Thanks [@educlopez](https://github.com/educlopez)! - Charts gain textured drawings: area `hatched` / `bars` / `solid`, line `ping` / `rainbow` / `values`, bar `glow` / `gradient` / `duotone`, pie `rounded` / `radial` / `glow`.

- [#14](https://github.com/educlopez/analytics-kit/pull/14) [`ac9281e`](https://github.com/educlopez/analytics-kit/commit/ac9281e33416f2c048f873331eab379c0e817d84) Thanks [@educlopez](https://github.com/educlopez)! - New chart types for other questions: FunnelChart (tape / steps / vertical), RadarChart, GaugeChart (arc / ring / tick), and ComposedChart (combo / highlight / overlay).

- [#14](https://github.com/educlopez/analytics-kit/pull/14) [`ac9281e`](https://github.com/educlopez/analytics-kit/commit/ac9281e33416f2c048f873331eab379c0e817d84) Thanks [@educlopez](https://github.com/educlopez)! - Remaining catalog chart types: ScatterChart, SankeyChart, CandlestickChart, ChoroplethChart, LiveLineChart, RingChart, HeatmapChart, SunburstChart, and ProfitLossChart.

- [#7](https://github.com/educlopez/analytics-kit/pull/7) [`4c2f526`](https://github.com/educlopez/analytics-kit/commit/4c2f526d5e92cf0f19ba041bfef6a18cc0a24cba) Thanks [@educlopez](https://github.com/educlopez)! - Named styles (`editorial`, `ink`, `shadcn`), a fuller analytics widget catalog, and a shadcn registry so widgets can be installed with the CLI.

### Patch Changes

- [#15](https://github.com/educlopez/analytics-kit/pull/15) [`15eaf4a`](https://github.com/educlopez/analytics-kit/commit/15eaf4aa813858c5fb803d2e274ec4b3090164ff) Thanks [@educlopez](https://github.com/educlopez)! - AnalyticsProvider can take previewQuery so catalog and teaser charts render on the first paint instead of an empty “No series data” prerender.

- Updated dependencies []:
  - @analytics-kit/core@0.2.0

## 0.1.0

### Minor Changes

- [`2371b69`](https://github.com/educlopez/analytics-kit/commit/2371b6937fe238cb1f7a3b6d643c20c7d284f1e9) Thanks [@educlopez](https://github.com/educlopez)! - Initial public release of Analytics Kit: provider-agnostic connectors, React widgets, and a Next.js handler.

### Patch Changes

- Updated dependencies [[`2371b69`](https://github.com/educlopez/analytics-kit/commit/2371b6937fe238cb1f7a3b6d643c20c7d284f1e9)]:
  - @analytics-kit/core@0.1.0
