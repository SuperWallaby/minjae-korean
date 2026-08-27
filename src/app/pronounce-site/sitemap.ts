import type { MetadataRoute } from "next";
import { atlasLangPath, atlasPinPath } from "@/lib/atlasRoutes";
import {
  getGlobalCatalog,
  globalSiteBase,
  listGlobalPins,
} from "@/lib/globalSite/catalog";
import { listPronouncePins } from "@/lib/pronounceSite/catalog";
import { pronounceSiteOrigin } from "@/lib/pronounceSite/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = globalSiteBase();
  const now = new Date();
  const langs = getGlobalCatalog().languages || [];
  const pins = listGlobalPins();
  const words = listPronouncePins();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${pronounceSiteOrigin()}/pinyin/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...langs
      .filter((l) => l.code !== "zh")
      .map((l) => ({
        url: `${base}${atlasLangPath(l.code)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
    ...pins.map((p) => ({
      url: `${base}${atlasPinPath(p)}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...words.map((w) => ({
      url: `${base}/words/${encodeURIComponent(w.slug)}`,
      lastModified: w.publishedAt ? new Date(w.publishedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.88,
    })),
  ];
  return routes;
}
