# @analytics-kit/react

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

- [#14](https://github.com/educlopez/analytics-kit/pull/14) [`ac9281e`](https://github.com/educlopez/analytics-kit/commit/ac9281e33416f2c048f873331eab379c0e817d84) Thanks [@educlopez](https://github.com/educlopez)! - Charts gain EvilCharts-inspired drawings: area `hatched` / `bars` / `solid`, line `ping` / `rainbow` / `values`, bar `glow` / `gradient` / `duotone`, pie `rounded` / `radial` / `glow`.

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
