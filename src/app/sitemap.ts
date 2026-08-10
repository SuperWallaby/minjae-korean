import type { MetadataRoute } from "next";

import { listBlogPosts } from "@/data/blogPosts";
import {
  LEVEL_EXAM_SLUGS,
  MOCK_EXAM_SLUGS,
  TOPIC_QUIZ_SLUGS,
} from "@/data/examsList";
import { getAllExpressionChapters } from "@/data/expressionChapterList";
import { getAllChapters, grammarChapterList } from "@/data/grammarChapterList";
import { listArticles } from "@/lib/articlesRepo";
import { listTopComparisonsForStaticParams } from "@/lib/grammarComparisonsRepo";
import { listTopGuidesForStaticParams } from "@/lib/grammarGuidesRepo";
import { buildVocabCompareCatalog } from "@/lib/vocabCompare/repo";
import { toVocabDifferencePage } from "@/lib/vocabDetail/project";
import { vocabDetailSiteBaseUrl } from "@/lib/vocabDetail/slug";
import { listAllVocabSeoPages } from "@/lib/vocabInfographic/repo";
import { listAllIgListSeoPages } from "@/lib/igList/repo";
import { listTopWhenToUseForStaticParams } from "@/lib/whenToUse/repo";
import { listSongs } from "@/lib/songsRepo";
import { listDramas } from "@/lib/dramaRepo";

const baseUrl = vocabDetailSiteBaseUrl();
const MAX_SITEMAP_ENTRIES = 49_000;

function warnSitemapSource(source: string, error: unknown) {
  console.warn(`[sitemap] Failed to load ${source}:`, error);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/news`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    // { url: `${baseUrl}/booking`, ... }, // hidden while 1:1 sessions are paused
    { url: `${baseUrl}/subscribe`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/grammar`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/grammar/compare`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/grammar/meaning`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/grammar/usage`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/grammar/how-to-say`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/vocab-quiz`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/vocab`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/list`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/vocab/detail`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/vocab/detail?tab=how-to-say`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/expressions`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/songs`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/drama`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/quoto`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/support`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/book/korean-beyond-translation`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/coaching`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/exams`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/exams/placement`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const examLevelRoutes: MetadataRoute.Sitemap = LEVEL_EXAM_SLUGS.map((e) => ({
    url: `${baseUrl}/exams/level/${encodeURIComponent(e.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const examMockRoutes: MetadataRoute.Sitemap = MOCK_EXAM_SLUGS.map((e) => ({
    url: `${baseUrl}/exams/mock/${encodeURIComponent(e.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const examTopicRoutes: MetadataRoute.Sitemap = TOPIC_QUIZ_SLUGS.map((e) => ({
    url: `${baseUrl}/exams/topic/${encodeURIComponent(e.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const expressionChapters = getAllExpressionChapters();
  const expressionRoutes: MetadataRoute.Sitemap = expressionChapters.map((ch) => ({
    url: `${baseUrl}/expressions/${encodeURIComponent(ch.slug)}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const grammarChapters = getAllChapters(grammarChapterList);
  const grammarRoutes: MetadataRoute.Sitemap = grammarChapters.map((ch) => ({
    url: `${baseUrl}/grammar/${encodeURIComponent(ch.slug)}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  let grammarComparisons: Awaited<
    ReturnType<typeof listTopComparisonsForStaticParams>
  > = [];
  try {
    grammarComparisons = await listTopComparisonsForStaticParams(2000);
  } catch (error) {
    warnSitemapSource("grammar comparisons", error);
  }
  const grammarComparisonRoutes: MetadataRoute.Sitemap = grammarComparisons.map(
    (c) => ({
      url: `${baseUrl}/grammar/${c.id}/${encodeURIComponent(c.slug)}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
      changeFrequency: "yearly" as const,
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
  } catch (error) {
    warnSitemapSource("grammar guides", error);
  }
  const grammarMeaningRoutes: MetadataRoute.Sitemap = grammarMeaningGuides.map(
    (g) => ({
      url: `${baseUrl}/grammar/meaning/${g.id}/${encodeURIComponent(g.slug)}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.65,
    }),
  );
  const grammarUsageRoutes: MetadataRoute.Sitemap = grammarUsageGuides.map(
    (g) => ({
      url: `${baseUrl}/grammar/usage/${g.id}/${encodeURIComponent(g.slug)}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.65,
    }),
  );
  const grammarHowToSayRoutes: MetadataRoute.Sitemap = grammarHowToSayGuides.map(
    (g) => ({
      url: `${baseUrl}/grammar/how-to-say/${g.id}/${encodeURIComponent(g.slug)}`,
      lastModified: g.updatedAt ? new Date(g.updatedAt) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.65,
    }),
  );

  let articles: Awaited<ReturnType<typeof listArticles>> = [];
  try {
    articles = await listArticles(500);
  } catch (error) {
    warnSitemapSource("news articles", error);
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
  } catch (error) {
    warnSitemapSource("blog posts", error);
  }
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${baseUrl}/blog/article/${encodeURIComponent(p.slug)}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : undefined,
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  let songs: Awaited<ReturnType<typeof listSongs>> = [];
  try {
    songs = await listSongs(500);
  } catch (error) {
    warnSitemapSource("songs", error);
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
  } catch (error) {
    warnSitemapSource("dramas", error);
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
  } catch (error) {
    warnSitemapSource("how-to-say vocab pages", error);
  }

  let vocabDetailDifferencePages: Awaited<
    ReturnType<typeof buildVocabCompareCatalog>
  > = [];
  try {
    vocabDetailDifferencePages = await buildVocabCompareCatalog(2000);
  } catch (error) {
    warnSitemapSource("cached vocab differences", error);
  }
  const vocabDetailDifferenceRoutes: MetadataRoute.Sitemap =
    vocabDetailDifferencePages.map((row) => {
      const page = toVocabDifferencePage(row);
      return {
        url: `${baseUrl}/vocab/detail/difference/${encodeURIComponent(page.leftId)}/${encodeURIComponent(page.rightId)}/${encodeURIComponent(page.slug)}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
        changeFrequency: "yearly" as const,
        priority: 0.72,
      };
    });

  const vocabDetailHowToSayRoutes: MetadataRoute.Sitemap = whenToUsePages.map(
    (row) => ({
      url: `${baseUrl}/vocab/detail/how-to-say/${encodeURIComponent(row.id)}/${encodeURIComponent(row.slug)}`,
      lastModified: row.updatedAt ? new Date(row.updatedAt) : undefined,
      changeFrequency: "yearly" as const,
      priority: 0.72,
    }),
  );

  const vocabSeoPages = listAllVocabSeoPages();
  const vocabSeoRoutes: MetadataRoute.Sitemap = vocabSeoPages.map((row) => ({
    url: `${baseUrl}/vocab/${encodeURIComponent(row.bundleId)}/${encodeURIComponent(row.slug)}`,
    lastModified: row.updatedAt ? new Date(row.updatedAt) : undefined,
    changeFrequency: "yearly" as const,
    priority: 0.72,
  }));

  const igListSeoPages = listAllIgListSeoPages();
  const igListSeoRoutes: MetadataRoute.Sitemap = igListSeoPages.map((row) => ({
    url: `${baseUrl}/list/${encodeURIComponent(row.setId)}/${encodeURIComponent(row.slug)}`,
    lastModified: row.updatedAt ? new Date(row.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.78,
  }));

  const routes: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...grammarRoutes,
    ...grammarComparisonRoutes,
    ...grammarMeaningRoutes,
    ...grammarUsageRoutes,
    ...grammarHowToSayRoutes,
    ...vocabDetailDifferenceRoutes,
    ...vocabDetailHowToSayRoutes,
    ...vocabSeoRoutes,
    ...igListSeoRoutes,
    ...articleRoutes,
    ...blogRoutes,
    ...expressionRoutes,
    ...songRoutes,
    ...dramaRoutes,
    ...examLevelRoutes,
    ...examMockRoutes,
    ...examTopicRoutes,
  ];
  if (routes.length > MAX_SITEMAP_ENTRIES) {
    console.warn(
      `[sitemap] Truncating ${routes.length} routes to ${MAX_SITEMAP_ENTRIES}`,
    );
  }
  return routes.slice(0, MAX_SITEMAP_ENTRIES);
}
