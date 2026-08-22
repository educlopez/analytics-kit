import type { Metadata } from "next";
import { DocsPage } from "../../src/pages/Docs";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Install Analytics Kit, wire a connector, and keep vendor keys on the server with @analytics-kit/next.",
};

export default function Page() {
  return <DocsPage />;
}
