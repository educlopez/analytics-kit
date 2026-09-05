import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "../../src/views/Prose";

const DESCRIPTION =
  "What wingtics.com collects, and what the Wingtics packages do with data in your own application. The library sends nothing anywhere.";

export const metadata: Metadata = {
  title: "Privacy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy — Wingtics", description: DESCRIPTION, url: "/privacy" },
};

export default function Page() {
  return (
    <ProsePage
      title="Privacy"
      lede="Two separate questions: what this website collects, and what the packages do inside your application."
    >
      <section>
        <h2>What the packages do</h2>
        <p>
          Nothing leaves your infrastructure because of Wingtics. The components have no telemetry,
          no phone-home, and no analytics of their own — they render whatever your connector
          returns. There is no Wingtics server for them to talk to.
        </p>
        <p>
          A connector talks only to the analytics provider you configure it with.{" "}
          <code>@wingtics/next</code> exists so that provider credentials stay on your server: the
          browser calls your route, your route calls the provider. The token never reaches the
          client bundle.
        </p>
        <p>
          Whatever your analytics provider collects about your visitors is governed by that
          provider&rsquo;s policy, not this one. Wingtics does not add to it or send it elsewhere.
        </p>
      </section>

      <section>
        <h2>What this website collects</h2>
        <p>
          wingtics.com runs Vercel Web Analytics, which is cookieless and does not fingerprint
          visitors. It records aggregate page views, referrers, country, and device class. There is
          no cross-site tracking, no advertising identifier, and no attempt to identify you.
        </p>
        <p>
          The <Link href="/demo">demo dashboard</Link> reads this site&rsquo;s own analytics, which
          is why the numbers there are real. That is also the only personal-data processing behind
          this site: it measures itself and shows you the result.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          No tracking cookies. The only client-side storage is a theme preference and the state of
          the component playground&rsquo;s controls, both kept in your browser&rsquo;s local storage
          and never transmitted.
        </p>
      </section>

      <section>
        <h2>Third parties</h2>
        <ul>
          <li>Vercel — hosting and the cookieless analytics described above.</li>
          <li>
            npm and GitHub — reached only when you follow a link or install a package, under their
            own policies.
          </li>
          <li>
            Fonts come from the Google Fonts catalogue but are downloaded at build time and served
            from this domain, so your browser never requests anything from Google.
          </li>
        </ul>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          Ask in the open on <Link href="/contact">GitHub</Link>. This page changes when the answer
          changes; it is version-controlled with the rest of the site, so its history is public.
        </p>
      </section>
    </ProsePage>
  );
}
