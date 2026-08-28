import type { MetadataRoute } from "next";

/**
 * kajakorean.com sitemap intentionally empty — site is noindex.
 * Atlas sites keep their own sitemap under *-site/sitemap.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
