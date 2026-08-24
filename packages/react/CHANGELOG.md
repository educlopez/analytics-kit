# @analytics-kit/react

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
