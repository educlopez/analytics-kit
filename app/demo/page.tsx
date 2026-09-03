import type { Metadata } from "next";
import { DemoPlatform } from "../../src/views/DemoPlatform";

const DESCRIPTION =
  "A working analytics platform built from Analytics Kit widgets. Switch the connector and watch which metrics each provider can answer.";

export const metadata: Metadata = {
  title: "Demo",
  description: DESCRIPTION,
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Demo — Analytics Kit",
    description: DESCRIPTION,
    url: "/demo",
  },
};

export default function Page() {
  return <DemoPlatform />;
}
