import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArticleActionsAndComments } from "@/components/article/ArticleActionsAndComments";
import { ArticleFeed } from "@/components/article/ArticleFeed";
import { BookmarkNavIcon } from "@/components/article/BookmarkNavIcon";
import { YouTubeEmbed } from "@/components/article/YouTubeEmbed";
import { Container } from "@/components/site/Container";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/Button";
import { getBlogPost, listBlogPosts } from "@/data/blogPosts";

export const runtime = "nodejs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

function buildDescription(a: Awaited<ReturnType<typeof getBlogPost>>): string {
  if (!a) return "";
  const raw = a.paragraphs?.[0]?.content;
  const firstContent = typeof raw === "string" ? raw.trim() : "";
  if (firstContent) {
    const plain = firstContent.replace(/\s+/g, " ").slice(0, 155);
    return plain + (plain.length >= 155 ? "…" : "");
  }
  return `${a.title}. Blog post.`;
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
  const mainImage = a.imageLarge?.trim() || a.imageThumb?.trim();
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/blog/article/${encodeURIComponent(a.slug)}`;

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
    author: {
      "@type": "Person",
      name: "Minjae",
      url: baseUrl,
    },
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/blog`,
      },
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListJsonLd),
        }}
      />
      <Container className="max-w-4xl">
        {mainImage ? (
          <div className="md:-mx-4 mb-12 overflow-hidden rounded-2xl border border-border bg-muted/10 sm:-mx-6">
            <div className="relative aspect-video w-full sm:aspect-vd">
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

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {isDev ? (
              <div className="mb-2">
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/blog/article/${encodeURIComponent(a.slug)}/edit`}
                  >
                    Edit images
                  </Link>
                </Button>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
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
                {a.title}
              </h1>
              <BookmarkNavIcon />
            </div>
          </div>
        </div>

        <section className="mt-12 border-t border-border pt-10">
          {a.audio ? (
            <div className="sticky top-0 z-[9999] -mx-4 mt-6 mb-6 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6">
              <div className="text-xs font-medium text-muted-foreground">
                Listen
              </div>
              <audio controls src={a.audio} className="mt-1 w-full" />
            </div>
          ) : null}

          <div className="space-y-14 text-base leading-8 sm:text-lg">
            {(a.paragraphs ?? []).length === 0 ? (
              <p className="text-muted-foreground">No content yet.</p>
            ) : (
              (a.paragraphs ?? []).map((p, idx) => (
                <div
                  key={`${idx}-${p.subtitle}-${p.youtube ?? ""}-${p.audio ?? ""}`}
                  className="space-y-3"
                >
                  {p.subtitle ? (
                    <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {p.subtitle}
                    </h2>
                  ) : null}
                  {p.audio ? (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <audio
                        controls
                        src={p.audio}
                        className="h-10 flex-1 min-w-0"
                      />
                    </div>
                  ) : null}
                  <div className="whitespace-pre-wrap text-foreground/90">
                    {p.content}
                  </div>
                  {p.image ? (
                    <div className="mt-4 mb-4 overflow-hidden rounded-xl border border-border bg-muted/10">
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
                  {p.youtube ? (
                    <div className="mt-4 mb-10">
                      <YouTubeEmbed urlOrId={p.youtube} />
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <div className="mt-16 flex flex-col items-center gap-3 mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <Logo mode="v2" className="opacity-90" />
            <span aria-hidden="true">·</span>
            <h6 className="font-serif font-medium"> Minjae</h6>
          </div>
        </div>

        <ArticleActionsAndComments
          scope="blog"
          slug={a.slug}
          shareUrl={canonical}
          shareTitle={a.title}
        />

        {related.length > 0 ? (
          <section className="mt-20 border-t border-border pt-10">
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              Related Posts
            </h2>
            <div className="mt-4">
              <ArticleFeed
                articles={related}
                showMajor={false}
                basePath="/blog/article"
              />
            </div>
          </section>
        ) : null}

        <div className="mt-8">
          <Button asChild variant="primary">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
