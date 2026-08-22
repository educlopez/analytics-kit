import type { Metadata } from "next";
import { ComponentsPage } from "../../src/pages/Components";

export const metadata: Metadata = {
  title: "Components",
  description: "Every Analytics Kit chart variant and its configuration options.",
};

export default function Page() {
  return <ComponentsPage />;
}
