import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "../../src/views/Prose";
import { REPO_URL } from "../../src/site/meta";

const DESCRIPTION =
  "Wingtics is an open-source React component kit for website analytics. One query model, six connectors, and a dashboard that survives changing analytics vendor.";

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: "About — Wingtics", description: DESCRIPTION, url: "/about" },
};

export default function Page() {
  return (
    <ProsePage
      title="About Wingtics"
      lede="An open-source React kit for reading your website analytics, whichever tool holds them."
    >
      <section>
        <h2>The problem it solves</h2>
        <p>
          Analytics dashboards are usually written against one vendor&rsquo;s API. Moving from
          Plausible to GA4, or from GA4 to Vercel Web Analytics, means rewriting the charts, the
          number formatting, the empty states and the loading behaviour — none of which had anything
          to do with the vendor.
        </p>
        <p>
          Wingtics splits the two apart. A <strong>connector</strong> speaks to one analytics
          provider and answers a single provider-agnostic query model. The{" "}
          <strong>components</strong> render whatever comes back. Switching provider is a
          constructor change; the dashboard does not move.
        </p>
      </section>

      <section>
        <h2>What it is, concretely</h2>
        <ul>
          <li>
            <code>@wingtics/core</code> — the query model, the connector contract, metric and
            dimension registries.
          </li>
          <li>
            <code>@wingtics/react</code> — 37 chart and dashboard components, plus the provider and
            hooks that feed them.
          </li>
          <li>
            <code>@wingtics/next</code> — route handlers that proxy a connector so vendor
            credentials never reach the browser.
          </li>
          <li>
            Six connectors: Vercel Web Analytics, Plausible, GA4, Umami, PostHog, and a
            deterministic mock for tests and demos.
          </li>
        </ul>
        <p>
          Components also install as source through a{" "}
          <Link href="/docs#registry">shadcn registry</Link>, so you can own the file instead of the
          dependency.
        </p>
      </section>

      <section>
        <h2>What it is not</h2>
        <p>
          It is not an analytics provider and not a hosted service. It collects nothing, stores
          nothing, and has no account. You bring the analytics tool you already pay for; Wingtics is
          the interface on top of it. There is no paid tier — the whole thing is MIT.
        </p>
      </section>

      <section>
        <h2>Capabilities, not crashes</h2>
        <p>
          Providers disagree about what they can answer. Plausible has no per-page bounce rate;
          Vercel Web Analytics has no event properties. Every connector declares its capabilities,
          and components that cannot be answered say so instead of rendering a zero. A dashboard
          built on Wingtics degrades honestly when you change vendor.
        </p>
      </section>

      <section>
        <h2>Who builds it</h2>
        <p>
          Wingtics is built by <a href="https://educalvo.com">Eduardo Calvo</a> and is developed in
          the open at <a href={REPO_URL}>github.com/educlopez/wingtics</a>. It was called Analytics
          Kit until September 2026. Issues and pull requests are welcome — see{" "}
          <Link href="/contact">contact</Link>.
        </p>
      </section>
    </ProsePage>
  );
}
