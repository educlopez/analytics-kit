import type { Metadata } from "next";
import { ComponentsIndex } from "../../src/views/ComponentsIndex";

export const metadata: Metadata = {
  title: "Components",
  description: "Wingtics charts by type — live demos, variants, and install commands.",
  alternates: { canonical: "/components" },
  openGraph: {
    title: "Components — Wingtics",
    description: "Wingtics charts by type — live demos, variants, and install commands.",
    url: "/components",
  },
};

export default function Page() {
  return <ComponentsIndex />;
}
