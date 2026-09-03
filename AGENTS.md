<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- friction-log:agents -->

## Friction log

Contributor and agent papercuts in this repository live as GitHub issues
labeled `friction`, not as files in the tree. A daily Cursor Cloud Agent
investigates them.

When you hit a papercut you cannot — or should not — fix inside the current
change, file it before you forget:

```bash
gh issue create --repo educlopez/analytics-kit --title "Friction: …" --label friction --body-file -
```

Full policy and the investigator contract:
[`docs/contributing/friction-log.md`](docs/contributing/friction-log.md).
Harnesses that load skills on demand read the same policy from
`.claude/skills/friction-log/SKILL.md` or
`.cursor/skills/friction-log/SKILL.md`.
