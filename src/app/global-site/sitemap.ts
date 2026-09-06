import type { MetadataRoute } from "next";
import {
  getGlobalCatalog,
  globalSiteBase,
  listGlobalPins,
} from "@/lib/globalSite/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = globalSiteBase();
  const now = new Date();
  const langs = (await getGlobalCatalog()).languages || [];
  const pins = await listGlobalPins();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...langs.map((l) => ({
      url: `${base}/lang/${l.code}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...pins.map((p) => ({
      url: `${base}/pin/${encodeURIComponent(p.id)}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
  return routes;
}
