import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATALOG, catalogBySlug } from "../../../src/catalog/items";
import { ComponentDetail } from "../../../src/views/ComponentDetail";

export function generateStaticParams() {
  return CATALOG.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = catalogBySlug(slug);
  if (!item) return { title: "Components" };
  return {
    title: item.title,
    description: item.blurb,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = catalogBySlug(slug);
  if (!item) notFound();
  return <ComponentDetail item={item} />;
}
