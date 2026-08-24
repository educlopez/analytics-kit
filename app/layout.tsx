import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { DM_Mono, DM_Sans, Newsreader } from "next/font/google";
import { SiteShell } from "../src/site/SiteShell";
import { REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "../src/site/meta";
import "../src/tailwind.css";
import "../src/app.css";
import "@analytics-kit/react/styles.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-title",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
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
    { media: "(prefers-color-scheme: light)", color: "#f9f8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#120c08" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${dmSans.variable} ${dmMono.variable}`}
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
