import type { MetadataRoute } from "next";

import { listArticles } from "@/lib/articlesRepo";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const baseUrl = BASE.replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/booking`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/grammar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/account`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  let articles: Awaited<ReturnType<typeof listArticles>> = [];
  try {
    articles = await listArticles(500);
  } catch {
    // DB unavailable at build time
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/news/article/${encodeURIComponent(a.slug)}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : a.createdAt ? new Date(a.createdAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes];
}
