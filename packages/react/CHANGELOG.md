# @analytics-kit/react

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
