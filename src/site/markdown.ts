import { CATALOG, CATALOG_GROUPS, catalogBySlug } from "@/catalog/items";
import { PROP_DOCS } from "@/catalog/propDocs";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, REPO_URL } from "@/site/meta";

/**
 * Markdown representations of the pages whose content is already structured
 * data — the catalog and the site index.
 *
 * Derived, never transcribed. The prose pages (docs, about, contact, privacy)
 * deliberately have no markdown variant: rendering them here would mean a
 * second copy of the same sentences, and the two would drift. Middleware only
 * negotiates the paths this module can actually answer, so an agent asking for
 * markdown never gets a hollow stub.
 */
export function markdownFor(pathname: string): string | null {
  if (pathname === "/") return indexMarkdown();
  if (pathname === "/components") return componentsMarkdown();
  const match = /^\/components\/([a-z0-9-]+)$/.exec(pathname);
  if (match) return componentMarkdown(match[1]);
  return null;
}

/** Every path with a markdown variant, for llms.txt and for tests. */
export const MARKDOWN_PATHS = [
  "/",
  "/components",
  ...CATALOG.map((item) => `/components/${item.slug}`),
];

function indexMarkdown(): string {
  const groups = CATALOG_GROUPS.map((group) => {
    const items = CATALOG.filter((item) => item.group === group.id);
    return items.length ? `- **${group.label}** (${items.length})` : null;
  }).filter(Boolean);

  return `# ${SITE_NAME}

${SITE_TAGLINE}

${SITE_DESCRIPTION}

## What it gives you

${groups.join("\n")}

Six connectors: Vercel Web Analytics, Plausible, GA4, Umami, PostHog, and a deterministic mock.

## Install

\`\`\`bash
pnpm add @wingtics/react @wingtics/core @wingtics/connector-plausible
\`\`\`

## Where to look next

- ${SITE_URL}/docs — install, connectors, the query model
- ${SITE_URL}/components — every component with props and variants
- ${SITE_URL}/llms.txt — the same thing in one file, with when-to-use guidance
- ${SITE_URL}/openapi.json — the HTTP surface
- ${REPO_URL} — source, MIT
`;
}

function componentsMarkdown(): string {
  const sections = CATALOG_GROUPS.map((group) => {
    const items = CATALOG.filter((item) => item.group === group.id);
    if (!items.length) return null;
    const rows = items
      .map(
        (item) =>
          `- [\`${item.component}\`](${SITE_URL}/components/${item.slug}) — ${item.blurb}${
            item.variants.length ? ` Variants: ${item.variants.join(", ")}.` : ""
          }`,
      )
      .join("\n");
    return `## ${group.label}\n\n${rows}`;
  }).filter(Boolean);

  return `# Components — ${SITE_NAME}

${CATALOG.length} components. Every one is a React component from \`@wingtics/react\`, and every
one also installs as source through the shadcn registry at ${SITE_URL}/r/{name}.json.

${sections.join("\n\n")}
`;
}

function componentMarkdown(slug: string): string | null {
  const item = catalogBySlug(slug);
  if (!item) return null;
  const props = PROP_DOCS[item.slug] ?? [];

  const propTable = props.length
    ? [
        "| Prop | Type | Default | Notes |",
        "| --- | --- | --- | --- |",
        ...props.map(
          (row) =>
            `| \`${row.name}\` | \`${row.type}\` | ${row.default ? `\`${row.default}\`` : "—"} | ${row.notes.replace(/\|/g, "\\|")} |`,
        ),
      ].join("\n")
    : "_No documented props._";

  return `# ${item.title} — ${SITE_NAME}

${item.blurb}

- **Component:** \`${item.component}\`
- **Group:** ${item.group}
${item.variants.length ? `- **Variants:** ${item.variants.join(", ")} (default \`${item.defaultVariant}\`)\n` : ""}- **Dependencies:** ${item.dependencies.map((d) => `\`${d.name}\``).join(", ")}
- **HTML page:** ${SITE_URL}/components/${item.slug}

## Usage

\`\`\`tsx
${item.snippet}
\`\`\`

## Props

${propTable}

## Install as source

\`\`\`bash
pnpm dlx shadcn@latest add ${SITE_URL}/r/${item.registry ?? item.slug}.json
\`\`\`
`;
}
