---
"@analytics-kit/core": minor
"@analytics-kit/react": minor
"@analytics-kit/connector-vercel": minor
"@analytics-kit/connector-mock": minor
---

Fix the Vercel connector's capability profile: `source`, `medium`, `campaign`,
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
