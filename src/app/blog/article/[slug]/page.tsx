import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/siteUrl";
import { SITE_META_KEYWORD, SITE_NAME } from "@/lib/siteBrand";

import { ArticleActionsAndComments } from "@/components/article/ArticleActionsAndComments";
import { ArticleFeed } from "@/components/article/ArticleFeed";
import { BookmarkNavIcon } from "@/components/article/BookmarkNavIcon";
import { YouTubeEmbed } from "@/components/article/YouTubeEmbed";
import homeStyles from "@/components/site/home-blog.module.css";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/Button";
import {
  getBlogPost,
  listBlogPosts,
  blogPostKeepsImages,
} from "@/data/blogPosts";
import { resolveBlogCoverImage } from "@/data/blogPosts/cover";

export const runtime = "nodejs";

const SITE_URL = SITE_ORIGIN;

function buildDescription(a: Awaited<ReturnType<typeof getBlogPost>>): string {
  if (!a) return "";
  if (a.description?.trim()) return a.description.trim();
  const raw = a.paragraphs?.[0]?.content;
  const firstContent = typeof raw === "string" ? raw.trim() : "";
  if (firstContent) {
    const plain = firstContent.replace(/\s+/g, " ").slice(0, 155);
    return plain + (plain.length >= 155 ? "…" : "");
  }
  return `${a.title}. How to study Korean — a note by Minjae.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getBlogPost(slug);
  if (!a) return { title: "Post Not Found" };

  const title = a.title;
  const description = buildDescription(a);
  const mainImage = a.imageLarge?.trim() || a.imageThumb?.trim();
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/blog/article/${encodeURIComponent(slug)}`;
  const metaTitle = `${title} | ${SITE_META_KEYWORD} | ${SITE_NAME}`;
  const metaDescription = description.includes(SITE_META_KEYWORD)
    ? description
    : `${SITE_META_KEYWORD}. ${description}`;

  return {
    title: { absolute: metaTitle },
    description: metaDescription,
    ...(a.keywords?.length && { keywords: a.keywords }),
    alternates: { canonical },
    ...(a.noImageIndex && {
      robots: { index: true, follow: true, noimageindex: true },
    }),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      url: canonical,
      ...(mainImage && {
        images: [{ url: mainImage, width: 1200, height: 630, alt: title }],
      }),
      siteName: SITE_NAME,
      ...((a.createdAt || a.updatedAt) && {
        publishedTime: a.createdAt ?? undefined,
        modifiedTime: a.updatedAt ?? a.createdAt ?? undefined,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      ...(mainImage && { images: [mainImage] }),
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [a, allPosts] = await Promise.all([
    getBlogPost(slug),
    listBlogPosts(10),
  ]);
  if (!a) return notFound();

  const isDev = process.env.NODE_ENV !== "production";
  const related = allPosts.filter((x) => x.slug !== a.slug).slice(0, 4);
  const keepImages = blogPostKeepsImages(a.slug);
  const mainImage = keepImages ? resolveBlogCoverImage(a) : "";
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/blog/article/${encodeURIComponent(a.slug)}`;

  const baseUrl = SITE_URL.replace(/\/+$/, "");
  const useWideContainer = a.slug === "korean-verb-endings";
  /* Default matches .column (780px); wide only for special layouts */
  const columnMaxWidth = useWideContainer ? "72rem" : "780px";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: buildDescription(a),
    url: canonical,
    datePublished: a.createdAt ?? undefined,
    dateModified: a.updatedAt ?? a.createdAt ?? undefined,
    ...(mainImage && { image: mainImage }),
    author: {
      "@type": "Person",
      name: "Minjae",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: baseUrl,
    },
  };
  const breadcrumbListJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/blog`,
      },
      { "@type": "ListItem", position: 3, name: a.title, item: canonical },
    ],
  };
  const faqJsonLd =
    a.faq && a.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: a.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <div className={homeStyles.articleWrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListJsonLd),
        }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <div className={homeStyles.column} style={{ maxWidth: columnMaxWidth }}>
        <p className="mb-4">
          <Link href="/blog" className={homeStyles.textLink}>
            ← All posts
          </Link>
        </p>

        <article className={homeStyles.articleCard}>
          {mainImage ? (
            <div className="mb-8 overflow-hidden rounded-xl border border-[color-mix(in_srgb,#1c1916_10%,transparent)] bg-[#f3f1ec]">
              <div className="relative aspect-video w-full">
                <Image
                  src={mainImage}
                  alt={a.title}
                  fill
                  className="object-cover object-center"
                  unoptimized
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            </div>
          ) : null}

          {isDev ? (
            <div className="mb-3">
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/blog/article/${encodeURIComponent(a.slug)}/edit`}
                >
                  Edit images
                </Link>
              </Button>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={homeStyles.articleMeta}>Minjae</span>
            {a.createdAt ? (
              <>
                <span className={homeStyles.articleMeta} aria-hidden>
                  ·
                </span>
                <span className={homeStyles.articleMeta}>
                  {new Date(a.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-start gap-3">
            <h1 className={homeStyles.articleTitle}>{a.title}</h1>
            <BookmarkNavIcon />
          </div>

          <section className={homeStyles.articleBody}>
            {a.audio ? (
              <div className="sticky top-0 z-[9999] mb-6 rounded-xl border border-[color-mix(in_srgb,#1c1916_10%,transparent)] bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                <div className="text-xs font-medium text-[#6b6760]">Listen</div>
                <audio controls src={a.audio} className="mt-1 w-full" />
              </div>
            ) : null}

            {(a.paragraphs ?? []).length === 0 ? (
              <p className="text-[#6b6760]">No content yet.</p>
            ) : (
              (a.paragraphs ?? []).map((p, idx) => {
                return (
                  <div
                    key={`${idx}-${p.subtitle}-${p.youtube ?? ""}-${p.audio ?? ""}`}
                    className={homeStyles.articleBodyBlock}
                  >
                    <div className="space-y-3">
                      {p.subtitle ? (
                        <h2 className={homeStyles.articleSubhead}>
                          {p.subtitle}
                        </h2>
                      ) : null}
                      {p.audio ? (
                        <div className="flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,#1c1916_10%,transparent)] bg-[#f3f1ec] px-3 py-2">
                          <audio
                            controls
                            src={p.audio}
                            className="h-10 min-w-0 flex-1"
                          />
                        </div>
                      ) : null}
                      <div className="whitespace-pre-wrap text-[#2f2c28]">
                        {p.content}
                      </div>
                      {keepImages && p.image ? (
                        <div className="mt-4 mb-4 overflow-hidden rounded-xl border border-[color-mix(in_srgb,#1c1916_10%,transparent)] bg-[#f3f1ec]">
                          <div
                            className="relative w-full"
                            style={{
                              aspectRatio:
                                typeof p.imageAspect === "number" &&
                                p.imageAspect > 0
                                  ? p.imageAspect
                                  : 16 / 9,
                            }}
                          >
                            <Image
                              src={p.image}
                              alt={a.title}
                              fill
                              className="object-cover object-center"
                              unoptimized
                            />
                          </div>
                        </div>
                      ) : null}
                      {p.youtube ? (
                        <div className="mt-4 mb-6">
                          <YouTubeEmbed urlOrId={p.youtube} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </section>

          <div className="mt-12 mb-8 flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[#6b6760]">
              <Logo mode="v2" className="opacity-90" />
              <span aria-hidden="true">·</span>
              <span className="font-serif font-medium text-[#1c1916]">
                Minjae
              </span>
            </div>
          </div>

          <ArticleActionsAndComments
            scope="blog"
            slug={a.slug}
            shareUrl={canonical}
            shareTitle={a.title}
          />
        </article>

        {related.length > 0 ? (
          <section className={homeStyles.articleRelated}>
            <h2 className={homeStyles.articleRelatedTitle}>Related posts</h2>
            <ArticleFeed
              articles={related}
              showMajor={false}
              showCovers={false}
              basePath="/blog/article"
            />
          </section>
        ) : null}

        <div className={homeStyles.articleNav}>
          <Link href="/blog" className={homeStyles.textLink}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
