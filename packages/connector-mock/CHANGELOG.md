# @analytics-kit/connector-mock

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
