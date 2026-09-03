import type { MetadataRoute } from "next";
import { CATALOG } from "../src/catalog/items";
import { SITE_URL } from "../src/site/meta";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/components`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/docs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/demo`, changeFrequency: "weekly", priority: 0.8 },
    ...CATALOG.map((item) => ({
      url: `${SITE_URL}/components/${item.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
