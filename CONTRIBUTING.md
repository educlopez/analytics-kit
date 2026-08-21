# Contributing

## Setup

```bash
pnpm install
pnpm check
pnpm dev
```

Requires Node 20+ (22 recommended, see `.nvmrc`) and pnpm 10.

## Scripts

| Command               | What it does                                |
| --------------------- | ------------------------------------------- |
| `pnpm test`           | Vitest                                      |
| `pnpm typecheck`      | `tsc --noEmit` in every package             |
| `pnpm lint`           | ESLint                                      |
| `pnpm format`         | Prettier                                    |
| `pnpm build`          | ESM + CJS + d.ts via tsup                   |
| `pnpm publint`        | Validate publishable `package.json` exports |
| `pnpm check`          | All of the above (same as CI)               |
| `pnpm changeset`      | Describe a user-facing change               |
| `pnpm registry:build` | Write shadcn JSON to `apps/demo/public/r`   |

## Versioning and publish

Packages are versioned together with [Changesets](https://github.com/changesets/changesets).

1. After a meaningful change: `pnpm changeset`
2. Merge to `main`. The Release workflow opens a **Version Packages** PR.
3. Merge that PR. CI runs `changeset publish` to npm.

First-time npm setup:

1. Create the GitHub repo `educlopez/analytics-kit` and push `main`.
2. Create the npm org [`analytics-kit`](https://www.npmjs.com/org/create) (scope `@analytics-kit`).
3. Add repo secret `NPM_TOKEN` (Automation token) so GitHub Actions can publish.
4. Grant the token publish rights on the org.

The demo app (`@analytics-kit/demo`) is private and never published.

## Adding a provider

Copy [`examples/custom-connector.ts`](examples/custom-connector.ts) into `packages/connector-<name>`, implement `defineConnector`, add the package to `pnpm-workspace.yaml` (already covered by `packages/*`), `.changeset/config.json` `fixed` group, and this README’s package table.

## Adding a widget

See [`examples/custom-widget.tsx`](examples/custom-widget.tsx). Register with `defineWidget` so `<Dashboard />` can render it by id.

To expose it on the shadcn registry, add a recipe under `registry/default/blocks/` and an item in `registry.json`. `pnpm registry:build` inlines those files for GitHub Pages (`/r/{name}.json`).
