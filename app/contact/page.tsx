import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "../../src/views/Prose";
import { REPO_URL } from "../../src/site/meta";

const DESCRIPTION =
  "How to reach the Wingtics maintainers: GitHub issues for bugs and features, private disclosure for security, and the friction log for papercuts.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact — Wingtics", description: DESCRIPTION, url: "/contact" },
};

export default function Page() {
  return (
    <ProsePage
      title="Contact"
      lede="Everything happens in the open on GitHub, except security reports."
    >
      <section>
        <h2>Bugs and feature requests</h2>
        <p>
          Open an issue at <a href={`${REPO_URL}/issues`}>github.com/educlopez/wingtics/issues</a>.
          For a rendering bug, the useful report names the component, the variant, the connector,
          and the viewport — those four narrow almost everything down. A reproduction against{" "}
          <code>@wingtics/connector-mock</code> is ideal, because the mock is deterministic and
          needs no credentials.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          Do not open a public issue for a vulnerability. Use GitHub&rsquo;s private advisory form
          at <a href={`${REPO_URL}/security/advisories/new`}>Security → Report a vulnerability</a>.
          The area worth the most scrutiny is <code>@wingtics/next</code>, since it is the piece
          that holds provider credentials server-side.
        </p>
      </section>

      <section>
        <h2>Contributing</h2>
        <p>
          Read <a href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING.md</a> first. Pull
          requests need a changeset when they touch a published package, and the CI gate is{" "}
          <code>pnpm check</code> plus a production smoke run against a real build.
        </p>
        <p>
          Friction while working in the repository — a confusing command, a lying type, a test that
          only fails locally — goes in the{" "}
          <a href={`${REPO_URL}/issues?q=is%3Aissue+label%3Afriction`}>friction log</a> rather than
          a normal issue.
        </p>
      </section>

      <section>
        <h2>No sales channel</h2>
        <p>
          There is nothing to buy, so there is no sales contact and no support SLA. If you need
          Wingtics to do something it does not do, the issue tracker is the whole process. See{" "}
          <Link href="/about">about</Link> for what the project is and is not.
        </p>
      </section>
    </ProsePage>
  );
}
