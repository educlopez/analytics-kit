# @analytics-kit/connector-mock

## 0.7.0

### Minor Changes

- [#53](https://github.com/educlopez/wingtics/pull/53) [`5b8be89`](https://github.com/educlopez/wingtics/commit/5b8be893f46d528fad12a56bfc02ff13316b30d8) Thanks [@educlopez](https://github.com/educlopez)! - Three changes that came out of auditing how the site and the packages read to an automated client.

  `WidgetFrame` and `MetricCard` take a `headingLevel` (2-6, default 3). A widget cannot know where it sits in the host's outline: inside a dashboard `h3` is right, but dropped straight under a page's `h1` it skips a level, which is a real accessibility defect. The default keeps existing markup byte-identical.

  `@wingtics/next` now answers every failure in one shape. Unsupported methods used to fall through to the framework, which replies with an empty 405 and no content type, while every other error on the endpoint was JSON — so a client could not use one parser for the whole surface. `createRouteHandlers` exports `PUT`, `PATCH` and `DELETE` alongside the rest so they reach the handler, and each error now carries a `hint` saying what a caller can do about it next to the existing `error` and `code`.

  `@wingtics/connector-mock` renames `createAnalyticsKitMockConnector` to `createWingticsMockConnector` and `ANALYTICS_KIT_DATASET` to `WINGTICS_DATASET`, which were the last public identifiers still carrying the old project name. The old names remain as deprecated aliases of the same values, so nothing breaks.

### Patch Changes

- Updated dependencies []:
  - @wingtics/core@0.7.0

## 0.6.1

### Patch Changes

- [#51](https://github.com/educlopez/wingtics/pull/51) [`b8c4960`](https://github.com/educlopez/wingtics/commit/b8c4960e3ce60b1e6a4c6e6b64c8ec720c885525) Thanks [@educlopez](https://github.com/educlopez)! - The mock connector reported `analytics-kit-demo.vercel.app` as its site name, which the demo dashboard shows verbatim — so the old brand was still on screen. It now reports `wingtics.com`.

- Updated dependencies []:
  - @wingtics/core@0.6.1

## 0.6.0

### Patch Changes

- Updated dependencies [[`bbe70bc`](https://github.com/educlopez/analytics-kit/commit/bbe70bc292bd8acd0e8177e2e066c6d9ce64a680)]:
  - @analytics-kit/core@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies []:
  - @analytics-kit/core@0.5.0

## 0.4.0

### Patch Changes

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

- [`2bd126a`](https://github.com/educlopez/analytics-kit/commit/2bd126a900728ab06517cfd3300ef1ae3b650a64) Thanks [@educlopez](https://github.com/educlopez)! - Point the landing dashboard at this site's own analytics instead of an external project.

  Breaking: `createSmoothuiMockConnector` is renamed to `createAnalyticsKitMockConnector`, and
  `SMOOTHUI_DATASET` to `ANALYTICS_KIT_DATASET`. The dataset now carries this site's routes.

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
