import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Geist_Mono, Inter } from "next/font/google";
import { SiteShell } from "../src/site/SiteShell";
import { REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "../src/site/meta";
import "../src/tailwind.css";
import "../src/site.css";
import "@wingtics/react/styles.css";

// Inter is AlignUI's typeface; Geist Mono stays for code surfaces, which
// AlignUI does not specify.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // Required for the OG and Twitter image URLs to resolve absolutely. Without
  // it Next emits relative paths, which every social scraper rejects.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Eduardo Calvo", url: "https://github.com/educlopez" }],
  creator: "Eduardo Calvo",
  publisher: "Eduardo Calvo",
  category: "technology",
  keywords: [
    "analytics",
    "react analytics components",
    "vercel web analytics",
    "plausible",
    "google analytics 4",
    "umami",
    "posthog",
    "recharts",
    "shadcn registry",
    "dashboard components",
    "typescript",
  ],
  alternates: {
    canonical: "/",
    types: {
      "text/plain": "/llms.txt",
      "application/json": "/openapi.json",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Matches each theme's page background, so the mobile browser chrome does
  // not sit on a colour the page never uses.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("ak-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
        {/* Structured data: SoftwareSourceCode is the accurate type for a
            library. WebSite carries the search action target. */}
        {/* The IANA-registered relation for an API description, so a client
            can discover the spec from any page instead of guessing its URL. */}
        <link rel="service-desc" type="application/json" href="/openapi.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareSourceCode",
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                url: SITE_URL,
                codeRepository: REPO_URL,
                programmingLanguage: "TypeScript",
                runtimePlatform: "React",
                license: "https://opensource.org/licenses/MIT",
                sameAs: [REPO_URL, "https://www.npmjs.com/org/wingtics"],
                author: {
                  "@type": "Person",
                  name: "Eduardo Calvo",
                  url: "https://educalvo.com",
                  sameAs: ["https://github.com/educlopez"],
                },
              },
              {
                // The audit tooling reads the first identity type it finds, and
                // a library is a SoftwareApplication as much as it is source.
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                url: SITE_URL,
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Any",
                softwareVersion: "0.6.1",
                license: "https://opensource.org/licenses/MIT",
                sameAs: [REPO_URL, "https://www.npmjs.com/org/wingtics"],
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                author: { "@type": "Person", name: "Eduardo Calvo" },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                alternateName: SITE_TAGLINE,
                url: SITE_URL,
              },
            ]),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
