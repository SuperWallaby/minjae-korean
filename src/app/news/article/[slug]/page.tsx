import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArticleActionsAndComments } from "@/components/article/ArticleActionsAndComments";
import { ArticleFeed } from "@/components/article/ArticleFeed";
import { BookmarkNavIcon } from "@/components/article/BookmarkNavIcon";
import { Describe } from "@/components/article/Describe";
import { VocabularySection } from "@/components/article/VocabularySection";
import { YouTubeEmbed } from "@/components/article/YouTubeEmbed";
import { TailwindClassCheck } from "@/components/debug/TailwindClassCheck";
import { Container } from "@/components/site/Container";
import { Logo } from "@/components/site/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getArticle, listArticles } from "@/lib/articlesRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function buildDescription(a: Awaited<ReturnType<typeof getArticle>>): string {
  if (!a) return "";
  const firstContent = a.paragraphs?.[0]?.content?.trim();
  if (firstContent) {
    const plain = firstContent.replace(/\s+/g, " ").slice(0, 155);
    return plain + (plain.length >= 155 ? "…" : "");
  }
  return `${a.title}. Korean reading practice.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: "Article Not Found" };

  const title = a.title;
  const description = buildDescription(a);
  const mainImage = a.imageLarge?.trim() || a.imageThumb?.trim();
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/news/article/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    ...(a.noImageIndex && {
      robots: { index: true, follow: true, noimageindex: true },
    }),
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      ...(mainImage && {
        images: [{ url: mainImage, width: 1200, height: 630, alt: title }],
      }),
      siteName: "Kaja",
      ...((a.createdAt || a.updatedAt) && {
        publishedTime: a.createdAt ?? undefined,
        modifiedTime: a.updatedAt ?? a.createdAt ?? undefined,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(mainImage && { images: [mainImage] }),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [a, allArticles] = await Promise.all([
    getArticle(slug),
    listArticles(10),
  ]);
  if (!a) return notFound();

  const related = allArticles.filter((x) => x.slug !== a.slug).slice(0, 4);
  const isDev = devOnly();

  const mainImage = a.imageLarge?.trim() || a.imageThumb?.trim();
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/news/article/${encodeURIComponent(a.slug)}`;
  const baseUrl = SITE_URL.replace(/\/+$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: buildDescription(a),
    url: canonical,
    datePublished: a.createdAt ?? undefined,
    dateModified: a.updatedAt ?? a.createdAt ?? undefined,
    ...(mainImage && { image: mainImage }),
    publisher: {
      "@type": "Organization",
      name: "Kaja",
      url: baseUrl,
    },
  };
  const breadcrumbListJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "News", item: `${baseUrl}/news` },
      { "@type": "ListItem", position: 3, name: a.title, item: canonical },
    ],
  };

  return (
    <div className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }}
      />
      <TailwindClassCheck />
      <Container className="max-w-4xl">
        {/* 0. 메인사진 */}
        {mainImage ? (
          <div className="md:-mx-4 mb-12 overflow-hidden rounded-2xl border border-border bg-muted/10 sm:-mx-6">
            <div className="relative aspect-16/10 w-full sm:aspect-vd">
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

        {/* 1. Title zone */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <Badge variant="muted">
                Level {Math.min(9, Math.max(5, (a.level ?? 1) + 4))}
              </Badge>
              {a.createdAt ? (
                <span>
                  {new Date(a.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                <Describe>{a.title}</Describe>
              </h1>
              <BookmarkNavIcon />
            </div>
          </div>
          {isDev ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/news/article/${encodeURIComponent(a.slug)}/edit`}>
                  Edit
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        {/* 2. Vocabulary zone (table) */}
        <VocabularySection
          className="mt-10 border-t border-border pt-10"
          items={(a.vocabulary ?? []).map((v) => ({
            word: v.word,
            phonetic: v.phonetic,
            sound: v.sound,
            meaning: v.description_en,
            example: v.example,
            exampleSound: v.exampleSound,
            image: v.image,
          }))}
        />

        {/* 3. Body zone: sticky audio + single flowing text with inline images */}
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Reading
          </h2>
          {a.audio ? (
            <div className="sticky top-0 z-[9999] -mx-4 mt-6 mb-6 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6">
              <div className="text-xs font-medium text-muted-foreground">
                Listen
              </div>
              <audio controls src={a.audio} className="mt-1 w-full" />
            </div>
          ) : null}

          <div className="mt-10 space-y-6 text-base leading-8 sm:text-lg">
            {(a.paragraphs ?? []).length === 0 ? (
              <p className="text-muted-foreground">No content yet.</p>
            ) : (
              (a.paragraphs ?? []).map((p, idx) => (
                <div key={`${idx}-${p.subtitle}-${p.youtube ?? ""}`}>
                  {p.subtitle ? (
                    <p className="mb-2 font-semibold text-foreground">
                      <Describe>{p.subtitle}</Describe>
                    </p>
                  ) : null}
                  <div className="whitespace-pre-wrap text-foreground/90">
                    <Describe>
                      {String(p.content ?? "").trim() || null}
                    </Describe>
                  </div>
                  {p.youtube ? (
                    <div className="mt-4 mb-10">
                      <YouTubeEmbed urlOrId={p.youtube} />
                    </div>
                  ) : null}
                  {p.image ? (
                    <div className="mt-4 mb-10 overflow-hidden rounded-xl border border-border bg-muted/10">
                      <div className="relative aspect-video w-full">
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
                </div>
              ))
            )}
          </div>
        </section>

        {/* 4. Questions */}
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Questions
          </h2>
          {(a.questions ?? []).length === 0 ? (
            <p className="mt-4 text-muted-foreground">No questions yet.</p>
          ) : (
            <ul className="mt-4 list-inside list-disc space-y-4 text-lg leading-relaxed text-muted-foreground">
              {(a.questions ?? []).map((q, i) => (
                <li key={i}>
                  <Describe>{q}</Describe>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 5. Discussion */}
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Discussion
          </h2>
          {(a.discussion ?? []).length === 0 ? (
            <p className="mt-4 text-muted-foreground">No prompts yet.</p>
          ) : (
            <ul className="mt-4 list-inside list-disc space-y-4 text-lg leading-relaxed text-muted-foreground">
              {(a.discussion ?? []).map((q, i) => (
                <li key={i}>
                  <Describe>{q}</Describe>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 6. Related Articles — Learn With Kaja News와 동일 카드(ArticleFeed) */}
        {related.length > 0 ? (
          <section className="mt-20 border-t border-border pt-10">
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              Related Articles
            </h2>
            <div className="mt-4">
              <ArticleFeed articles={related} showMajor={false} />
            </div>
          </section>
        ) : null}

        <ArticleActionsAndComments
          scope="news"
          slug={a.slug}
          shareUrl={canonical}
          shareTitle={a.title}
        />

        <div className="mt-16 flex flex-col items-center gap-3  mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <Logo mode="v2" className="opacity-90" />
            <span aria-hidden="true">·</span>
            <h6 className="font-serif font-medium"> Minjae</h6>
          </div>
        </div>

        <div className="mt-8">
          <Button asChild variant="primary">
            <Link href="/news">Back to News</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
