import { RiCodeSSlashLine, RiFlaskLine } from "@remixicon/react";
import { ProviderMark } from "@/site/ProviderMark";

/**
 * The connector list, as cards rather than a props table: which provider,
 * which constructor, which options, which package. A table row read as seven
 * near-identical strings; the brand mark is what tells them apart at a glance.
 */
const CONNECTORS: {
  id: string;
  label: string;
  ctor: string;
  options: string;
  pkg: string;
  note?: string;
}[] = [
  {
    id: "vercel",
    label: "Vercel",
    ctor: "createVercelConnector",
    options: "{ token, projectId, teamId? }",
    pkg: "@analytics-kit/connector-vercel",
    note: "Web Analytics API",
  },
  {
    id: "plausible",
    label: "Plausible",
    ctor: "createPlausibleConnector",
    options: "{ apiKey, siteId }",
    pkg: "@analytics-kit/connector-plausible",
    note: "Stats API v2",
  },
  {
    id: "ga4",
    label: "Google Analytics 4",
    ctor: "createGa4Connector",
    options: "{ accessToken, propertyId }",
    pkg: "@analytics-kit/connector-ga4",
    note: "Data API",
  },
  {
    id: "umami",
    label: "Umami",
    ctor: "createUmamiConnector",
    options: "{ apiKey, websiteId, host? }",
    pkg: "@analytics-kit/connector-umami",
  },
  {
    id: "posthog",
    label: "PostHog",
    ctor: "createPostHogConnector",
    options: "{ apiKey, projectId, host? }",
    pkg: "@analytics-kit/connector-posthog",
    note: "HogQL",
  },
];

/** No vendor mark for these two — they are the kit's own. */
const OWN: {
  icon: typeof RiFlaskLine;
  label: string;
  ctor: string;
  options: string;
  note: string;
}[] = [
  {
    icon: RiFlaskLine,
    label: "Mock",
    ctor: "createMockConnector",
    options: "{ profile?, seed? }",
    note: "Deterministic data. profile: full | vercel | plausible | …",
  },
  {
    icon: RiCodeSSlashLine,
    label: "Your endpoint",
    ctor: "createHttpConnector",
    options: "{ endpoint }",
    note: "The browser talks to your route. Keys stay on the server.",
  },
];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-stroke-soft-200 bg-bg-white-0 min-w-0 rounded-2xl border p-4">
      {children}
    </div>
  );
}

export function ConnectorGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {CONNECTORS.map((item) => (
        <Card key={item.id}>
          <div className="mb-3 flex items-center gap-2.5">
            <ProviderMark id={item.id} className="text-text-strong-950 size-5 shrink-0" />
            <span className="text-label-sm text-text-strong-950 truncate">{item.label}</span>
            {item.note ? (
              <span className="text-label-xs text-text-soft-400 ml-auto shrink-0">{item.note}</span>
            ) : null}
          </div>
          <code className="text-text-sub-600 block font-mono text-xs break-all">{item.ctor}</code>
          <code className="text-text-soft-400 mt-1.5 block font-mono text-[11px] break-all">
            {item.options}
          </code>
          <code className="border-stroke-soft-200 text-text-soft-400 mt-3 block border-t pt-2.5 font-mono text-[11px] break-all">
            {item.pkg}
          </code>
        </Card>
      ))}
      {OWN.map((item) => (
        <Card key={item.ctor}>
          <div className="mb-3 flex items-center gap-2.5">
            <item.icon className="text-text-soft-400 size-5 shrink-0" />
            <span className="text-label-sm text-text-strong-950 truncate">{item.label}</span>
          </div>
          <code className="text-text-sub-600 block font-mono text-xs break-all">{item.ctor}</code>
          <code className="text-text-soft-400 mt-1.5 block font-mono text-[11px] break-all">
            {item.options}
          </code>
          <p className="border-stroke-soft-200 text-label-xs text-text-soft-400 mt-3 border-t pt-2.5">
            {item.note}
          </p>
        </Card>
      ))}
    </div>
  );
}
