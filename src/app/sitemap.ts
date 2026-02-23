import type { MetadataRoute } from "next";

import { listBlogPosts } from "@/data/blogPosts";
import { getAllExpressionChapters } from "@/data/expressionChapterList";
import { getAllChapters, grammarChapterList } from "@/data/grammarChapterList";
import { listArticles } from "@/lib/articlesRepo";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const baseUrl = BASE.replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/booking`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/grammar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/expressions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/account`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const expressionChapters = getAllExpressionChapters();
  const expressionRoutes: MetadataRoute.Sitemap = expressionChapters.map((ch) => ({
    url: `${baseUrl}/expressions/${encodeURIComponent(ch.slug)}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const grammarChapters = getAllChapters(grammarChapterList);
  const grammarRoutes: MetadataRoute.Sitemap = grammarChapters.map((ch) => ({
    url: `${baseUrl}/grammar/${encodeURIComponent(ch.slug)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  let articles: Awaited<ReturnType<typeof listArticles>> = [];
  try {
    articles = await listArticles(500);
  } catch {
    // DB unavailable at build time
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/news/article/${encodeURIComponent(a.slug)}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : a.createdAt ? new Date(a.createdAt) : new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  let blogPosts: Awaited<ReturnType<typeof listBlogPosts>> = [];
  try {
    blogPosts = await listBlogPosts(500);
  } catch {
    // ignore
  }
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${baseUrl}/blog/article/${encodeURIComponent(p.slug)}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...grammarRoutes, ...articleRoutes, ...blogRoutes, ...expressionRoutes];
}
