# Contributing

## Setup

```bash
pnpm install
pnpm build
pnpm check
pnpm dev
```

`pnpm dev` starts the Next.js site at the repo root.

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
| `pnpm registry:build` | Write shadcn JSON to `public/r`             |

## Versioning and publish

Packages are versioned together with [Changesets](https://github.com/changesets/changesets).

1. After a meaningful change: `pnpm changeset`
2. Merge to `main`. The Release workflow opens a **Version Packages** PR.
3. Merge that PR. CI runs `changeset publish` to npm.

First-time npm setup:

1. Create the GitHub repo `educlopez/wingtics` and push `main`.
2. Create the npm org [`wingtics`](https://www.npmjs.com/org/create) (scope `@wingtics`).
3. Publish each package once by hand. npm can only attach a trusted publisher to
   a package that already exists, so this first release cannot come from CI.
4. For each package, add the trusted publisher `educlopez/wingtics` +
   `release.yml` under Settings → Trusted Publisher, and tick **npm publish** as
   well as the default `npm stage publish` — `changeset publish` runs the former,
   so a stage-only publisher would leave every release staged and unreleased.

No `NPM_TOKEN`: `release.yml` publishes over OIDC, and npm prefers a token
whenever one is present. Note that npm matches `repository.url` against the real
repository, so renaming the repo means updating all nine package manifests in the
same change.

The Next.js product site at the repo root is private and never published.

## Adding a provider

Copy [`examples/custom-connector.ts`](examples/custom-connector.ts) into `packages/connector-<name>`, implement `defineConnector`, add the package to `pnpm-workspace.yaml` (already covered by `packages/*`), `.changeset/config.json` `fixed` group, and this README’s package table.

## Adding a widget

See [`examples/custom-widget.tsx`](examples/custom-widget.tsx). Register with `defineWidget` so `<Dashboard />` can render it by id.

To expose it on the shadcn registry, add a recipe under `registry/default/blocks/` and an item in `registry.json`. `pnpm registry:build` inlines those files into `public/r` (served by the Next.js site).

## Friction log

Repository papercuts — confusing docs, a script that needs a secret handshake, a
type that lies — go in GitHub issues labeled `friction`, not in this file. See
[docs/contributing/friction-log.md](docs/contributing/friction-log.md). Feature
requests and bug reports about the published package stay ordinary issues.
