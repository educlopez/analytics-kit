# @analytics-kit/next

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

### Patch Changes

- Updated dependencies []:
  - @analytics-kit/core@0.2.0

## 0.1.0

### Minor Changes

- [`2371b69`](https://github.com/educlopez/analytics-kit/commit/2371b6937fe238cb1f7a3b6d643c20c7d284f1e9) Thanks [@educlopez](https://github.com/educlopez)! - Initial public release of Analytics Kit: provider-agnostic connectors, React widgets, and a Next.js handler.

### Patch Changes

- Updated dependencies [[`2371b69`](https://github.com/educlopez/analytics-kit/commit/2371b6937fe238cb1f7a3b6d643c20c7d284f1e9)]:
  - @analytics-kit/core@0.1.0
