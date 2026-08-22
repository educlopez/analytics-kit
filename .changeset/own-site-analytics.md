---
"@analytics-kit/connector-mock": minor
---

Point the landing dashboard at this site's own analytics instead of an external project.

Breaking: `createSmoothuiMockConnector` is renamed to `createAnalyticsKitMockConnector`, and
`SMOOTHUI_DATASET` to `ANALYTICS_KIT_DATASET`. The dataset now carries this site's routes.
