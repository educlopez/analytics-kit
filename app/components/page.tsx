import type { Metadata } from "next";
import { ComponentsIndex } from "../../src/views/ComponentsIndex";

export const metadata: Metadata = {
  title: "Components",
  description: "Analytics Kit charts by type — live demos, variants, and install commands.",
  alternates: { canonical: "/components" },
  openGraph: {
    title: "Components — Analytics Kit",
    description: "Analytics Kit charts by type — live demos, variants, and install commands.",
    url: "/components",
  },
};

export default function Page() {
  return <ComponentsIndex />;
}
