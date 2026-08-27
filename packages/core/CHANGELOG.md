# @analytics-kit/core

## 0.5.0

## 0.4.0

### Minor Changes

- [#20](https://github.com/educlopez/analytics-kit/pull/20) [`d22f48a`](https://github.com/educlopez/analytics-kit/commit/d22f48a4fcbcceae3fb470ce88048aee526df80b) Thanks [@educlopez](https://github.com/educlopez)! - Stop `withSampleFallback` from misrepresenting live data, and stop it from
  losing capabilities the primary connector has.

  A breakdown or series result is now judged empty only when it has no rows or
  points at all. Previously a metric value of `0` counted as "no signal", so a
  site with genuinely zero visitors had its honest zero replaced by invented
  numbers and labelled as sample data. A totals-only query still falls back on
  all-zero, because `emptyResult` fills every requested metric with `0` and the
  two cases are indistinguishable there — pass your own `isEmpty` if your
  connector can tell them apart.

  Realtime no longer returns a fabricated `{ visitors: 0 }` when the primary
  stream fails and no sample stream exists; it rethrows, so a UI shows an error
  instead of presenting an invented count as live.

  Adds `unionCapabilities`, and uses it for the wrapper's reported capabilities.
  `mergeCapabilities` is override semantics, so a sample connector declaring
  `realtime: false` used to cancel a primary that supports it — and the widget
  was then rejected before the live source was ever reached.

  Note for anyone theming the widgets: `--ak-surface-2` falls back to `--muted`,
  which shadcn uses for a surface but plenty of palettes use for muted _text_. If
  yours does, map `--ak-*` explicitly — the demo site had to, after the active
  range pill rendered at 2:1 contrast. The package's own light-theme block is
  `.ak-root[data-ak-theme="light"]`, so an override needs at least that
  specificity to win.

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

## 0.2.1

### Patch Changes

- [`d18ba26`](https://github.com/educlopez/analytics-kit/commit/d18ba266207b56b9a913970d7c143c5a0a49af1a) Thanks [@educlopez](https://github.com/educlopez)! - Publish with npm provenance attestations, via OIDC trusted publishing instead of a
  long-lived token. Consumers can now verify that a tarball was built by this
  repository's release workflow.

## 0.2.0

## 0.1.0

### Minor Changes

- [`2371b69`](https://github.com/educlopez/analytics-kit/commit/2371b6937fe238cb1f7a3b6d643c20c7d284f1e9) Thanks [@educlopez](https://github.com/educlopez)! - Initial public release of Analytics Kit: provider-agnostic connectors, React widgets, and a Next.js handler.
