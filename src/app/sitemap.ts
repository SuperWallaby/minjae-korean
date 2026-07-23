import type { MetadataRoute } from "next";

import { listBlogPosts } from "@/data/blogPosts";
import {
  LEVEL_EXAM_SLUGS,
  MOCK_EXAM_SLUGS,
} from "@/data/examsList";
import { getAllExpressionChapters } from "@/data/expressionChapterList";
import { getAllChapters, grammarChapterList } from "@/data/grammarChapterList";
import { listArticles } from "@/lib/articlesRepo";
import { listTopComparisonsForStaticParams } from "@/lib/grammarComparisonsRepo";
import { listTopGuidesForStaticParams } from "@/lib/grammarGuidesRepo";
import { listTopVocabCompareForStaticParams } from "@/lib/vocabCompare/repo";
import { listAllVocabSeoPages } from "@/lib/vocabInfographic/repo";
import { listTopWhenToUseForStaticParams } from "@/lib/whenToUse/repo";
import { listSongs } from "@/lib/songsRepo";
import { listDramas } from "@/lib/dramaRepo";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
const baseUrl = BASE.replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // { url: `${baseUrl}/booking`, ... }, // hidden while 1:1 sessions are paused
    { url: `${baseUrl}/subscribe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/grammar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/grammar/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/grammar/meaning`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/grammar/usage`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/grammar/how-to-say`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/vocab-quiz`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/when-to-use`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/vocab`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/vocab/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/expressions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/songs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/drama`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/quoto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/account`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/exams`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/exams/placement`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const examLevelRoutes: MetadataRoute.Sitemap = LEVEL_EXAM_SLUGS.map((e) => ({
    url: `${baseUrl}/exams/level/${encodeURIComponent(e.slug)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const examMockRoutes: MetadataRoute.Sitemap = MOCK_EXAM_SLUGS.map((e) => ({
    url: `${baseUrl}/exams/mock/${encodeURIComponent(e.slug)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

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

  let grammarComparisons: Awaited<
    ReturnType<typeof listTopComparisonsForStaticParams>
  > = [];
  try {
    grammarComparisons = await listTopComparisonsForStaticParams(2000);
  } catch {
    // DB unavailable at build time
  }
  const grammarComparisonRoutes: MetadataRoute.Sitemap = grammarComparisons.map(
    (c) => ({
      url: `${baseUrl}/grammar/${c.id}/${encodeURIComponent(c.slug)}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );

  let grammarMeaningGuides: Awaited<
    ReturnType<typeof listTopGuidesForStaticParams>
  > = [];
  let grammarUsageGuides: Awaited<
    ReturnType<typeof listTopGuidesForStaticParams>
  > = [];
  let grammarHowToSayGuides: Awaited<
    ReturnType<typeof listTopGuidesForStaticParams>
  > = [];
  try {
    [grammarMeaningGuides, grammarUsageGuides, grammarHowToSayGuides] =
      await Promise.all([
        listTopGuidesForStaticParams("meaning", 2000),
        listTopGuidesForStaticParams("usage", 2000),
        listTopGuidesForStaticParams("how-to-say", 2000),
      ]);
  } catch {
    // DB unavailable at build time
  }
  const grammarMeaningRoutes: MetadataRoute.Sitemap = grammarMeaningGuides.map(
    (g) => ({
      url: `${baseUrl}/grammar/meaning/${g.id}/${encodeURIComponent(g.slug)}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );
  const grammarUsageRoutes: MetadataRoute.Sitemap = grammarUsageGuides.map(
    (g) => ({
      url: `${baseUrl}/grammar/usage/${g.id}/${encodeURIComponent(g.slug)}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );
  const grammarHowToSayRoutes: MetadataRoute.Sitemap = grammarHowToSayGuides.map(
    (g) => ({
      url: `${baseUrl}/grammar/how-to-say/${g.id}/${encodeURIComponent(g.slug)}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );

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

  let songs: Awaited<ReturnType<typeof listSongs>> = [];
  try {
    songs = await listSongs(500);
  } catch {
    // DB unavailable at build time
  }
  const songRoutes: MetadataRoute.Sitemap = songs.map((s) => ({
    url: `${baseUrl}/songs/${encodeURIComponent(s.slug)}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : s.createdAt ? new Date(s.createdAt) : new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  let dramas: Awaited<ReturnType<typeof listDramas>> = [];
  try {
    dramas = await listDramas(500);
  } catch {
    // DB unavailable at build time
  }
  const dramaRoutes: MetadataRoute.Sitemap = dramas.map((d) => ({
    url: `${baseUrl}/drama/${encodeURIComponent(d.slug)}`,
    lastModified: d.updatedAt ? new Date(d.updatedAt) : d.createdAt ? new Date(d.createdAt) : new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  let whenToUsePages: Awaited<
    ReturnType<typeof listTopWhenToUseForStaticParams>
  > = [];
  try {
    whenToUsePages = await listTopWhenToUseForStaticParams(2000);
  } catch {
    // DB unavailable at build time
  }
  const whenToUseRoutes: MetadataRoute.Sitemap = whenToUsePages.map((row) => ({
    url: `${baseUrl}/when-to-use/${encodeURIComponent(row.id)}/${encodeURIComponent(row.slug)}`,
    lastModified: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  let vocabComparePages: Awaited<
    ReturnType<typeof listTopVocabCompareForStaticParams>
  > = [];
  try {
    vocabComparePages = await listTopVocabCompareForStaticParams(2000);
  } catch {
    // DB unavailable at build time
  }
  const vocabCompareRoutes: MetadataRoute.Sitemap = vocabComparePages.map(
    (row) => ({
      url: `${baseUrl}/vocab/compare/${encodeURIComponent(row.leftId)}/${encodeURIComponent(row.rightId)}/${encodeURIComponent(row.slug)}`,
      lastModified: row.updatedAt ? new Date(row.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  const vocabSeoPages = listAllVocabSeoPages();
  const vocabSeoRoutes: MetadataRoute.Sitemap = vocabSeoPages.map((row) => ({
    url: `${baseUrl}/vocab/${encodeURIComponent(row.bundleId)}/${encodeURIComponent(row.slug)}`,
    lastModified: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  return [
    ...staticRoutes,
    ...grammarRoutes,
    ...grammarComparisonRoutes,
    ...grammarMeaningRoutes,
    ...grammarUsageRoutes,
    ...grammarHowToSayRoutes,
    ...whenToUseRoutes,
    ...vocabCompareRoutes,
    ...vocabSeoRoutes,
    ...articleRoutes,
    ...blogRoutes,
    ...expressionRoutes,
    ...songRoutes,
    ...dramaRoutes,
    ...examLevelRoutes,
    ...examMockRoutes,
  ];
}
