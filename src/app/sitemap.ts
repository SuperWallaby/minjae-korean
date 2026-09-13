import type { MetadataRoute } from "next";

import { BLOG_LISTED_SLUGS } from "@/data/blogPosts";
import { SITE_ORIGIN, siteUrl } from "@/lib/siteUrl";

/**
 * kajakorean.com public sitemap — home, blog, book, legal.
 * Vocab SEO pages stay out (noindex + robots disallow).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE_ORIGIN.replace(/\/+$/, "");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/book/korean-beyond-translation`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/free-korean-class`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogArticles: MetadataRoute.Sitemap = BLOG_LISTED_SLUGS.map((slug) => ({
    url: siteUrl(`/blog/article/${slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogArticles];
}
