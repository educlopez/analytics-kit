import type { Metadata } from "next";
import { DocsPage } from "../../src/views/Docs";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Install Analytics Kit, wire a connector, and keep vendor keys on the server with @analytics-kit/next.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Docs — Analytics Kit",
    description:
      "Install Analytics Kit, wire a connector, and keep vendor keys on the server with @analytics-kit/next.",
    url: "/docs",
  },
};

export default function Page() {
  return <DocsPage />;
}
