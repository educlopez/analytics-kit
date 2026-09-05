import type { Metadata } from "next";
import { DocsPage } from "../../src/views/Docs";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Install Wingtics, wire a connector, and keep vendor keys on the server with @wingtics/next.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Docs — Wingtics",
    description:
      "Install Wingtics, wire a connector, and keep vendor keys on the server with @wingtics/next.",
    url: "/docs",
  },
};

export default function Page() {
  return <DocsPage />;
}
