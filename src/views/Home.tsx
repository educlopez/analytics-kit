"use client";

import Link from "next/link";
import { ChartTeaser } from "../ChartTeaser";
import { Cta } from "@/blocks/Cta";
import { Faq } from "@/blocks/Faq";
import { Features } from "@/blocks/Features";
import { Hero } from "@/blocks/Hero";
import { HowItWorks } from "@/blocks/HowItWorks";
import { Stats } from "@/blocks/Stats";
import { CATALOG } from "@/catalog/items";
import { CodeBlock } from "@/site/CodeBlock";
import { CopyCommand } from "@/site/CopyCommand";
import { Section, SectionHead } from "@/site/Section";
import { useSite } from "@/site/theme";
import { useRegistryCommand } from "@/site/useRegistryCommand";

const INSTALL = "pnpm add @wingtics/react @wingtics/core @wingtics/next @wingtics/connector-vercel";

const SNIPPET = `import { AnalyticsProvider, Dashboard } from "@wingtics/react";
import { createHttpConnector } from "@wingtics/core";

const connector = createHttpConnector({ endpoint: "/api/analytics" });

export function Stats() {
  return (
    <AnalyticsProvider connector={connector}>
      <Dashboard />
    </AnalyticsProvider>
  );
}`;

export function HomePage() {
  const { theme } = useSite();
  const registry = useRegistryCommand("dashboard");

  return (
    <>
      <Hero theme={theme} />

      <Features />

      <Section id="kit">
        <SectionHead
          kicker="Charts"
          title="Same data. Different shapes."
          lede={
            <>
              Every chart has visual <code className="text-label-sm">variant</code>s — the drawing,
              not a color theme. Colors inherit from your CSS.{" "}
              <Link href="/components" className="text-primary-base hover:underline">
                See every component and its config
              </Link>
              .
            </>
          }
        />
        <ChartTeaser theme={theme} />
      </Section>

      <Section id="registry">
        <SectionHead
          kicker="shadcn registry"
          title="Install a widget. Own the file."
          lede={
            <>
              Add the catalog from this site&apos;s <code className="text-label-sm">/r</code>{" "}
              folder, or <code className="text-label-sm">educlopez/analytics-kit/dashboard</code>{" "}
              from the repo. Runtime still comes from npm so connectors and queries stay canonical.
            </>
          }
        />
        <CopyCommand command={registry} id="registry" />
      </Section>

      <Stats componentCount={CATALOG.length} />

      <Section>
        <SectionHead
          kicker="Drop-in"
          title="Same widgets. Vercel connector."
          lede="Keep tokens on the server in production. Swap the import for Plausible or GA4."
        />
        <div className="flex flex-col gap-4">
          <CodeBlock code={SNIPPET} lang="tsx" title="stats.tsx" copyId="snippet" />
          <CopyCommand command={INSTALL} id="install" />
        </div>
      </Section>

      <HowItWorks />
      <Faq />
      <Cta />
    </>
  );
}
