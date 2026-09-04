---
"@wingtics/react": minor
"@wingtics/next": minor
"@wingtics/connector-mock": minor
---

Three changes that came out of auditing how the site and the packages read to an automated client.

`WidgetFrame` and `MetricCard` take a `headingLevel` (2-6, default 3). A widget cannot know where it sits in the host's outline: inside a dashboard `h3` is right, but dropped straight under a page's `h1` it skips a level, which is a real accessibility defect. The default keeps existing markup byte-identical.

`@wingtics/next` now answers every failure in one shape. Unsupported methods used to fall through to the framework, which replies with an empty 405 and no content type, while every other error on the endpoint was JSON — so a client could not use one parser for the whole surface. `createRouteHandlers` exports `PUT`, `PATCH` and `DELETE` alongside the rest so they reach the handler, and each error now carries a `hint` saying what a caller can do about it next to the existing `error` and `code`.

`@wingtics/connector-mock` renames `createAnalyticsKitMockConnector` to `createWingticsMockConnector` and `ANALYTICS_KIT_DATASET` to `WINGTICS_DATASET`, which were the last public identifiers still carrying the old project name. The old names remain as deprecated aliases of the same values, so nothing breaks.
