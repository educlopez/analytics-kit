import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Mono, DM_Sans, Newsreader } from "next/font/google";
import { SiteShell } from "../src/site/SiteShell";
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
  title: {
    default: "Analytics Kit — One dashboard. Any analytics tool.",
    template: "%s — Analytics Kit",
  },
  description:
    "Provider-agnostic analytics widgets. Connect Vercel, Plausible, GA4, Umami, or PostHog and keep the same dashboard.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
