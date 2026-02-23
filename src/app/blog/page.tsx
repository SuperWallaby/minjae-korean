import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import {
  displayLevel,
  formatNewsDate,
  levelBadgeClass,
  levelLabel,
  type ReadingLevel,
} from "@/lib/levelDisplay";
import { listBlogPosts } from "@/data/blogPosts";
import { cn } from "@/lib/utils";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes and posts about Korean learning, teaching, and practice.",
  openGraph: {
    title: "Blog | Kaja",
    description:
      "Notes and posts about Korean learning, teaching, and practice.",
    url: `${SITE_URL}/blog`,
    siteName: "Kaja",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/brand/og.png`,
        width: 1200,
        height: 630,
        alt: "Kaja Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Kaja",
    description:
      "Notes and posts about Korean learning, teaching, and practice.",
    images: [`${SITE_URL}/brand/og.png`],
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default async function BlogPage() {
  const items = await listBlogPosts(100);
  const major = items[0];
  const rest = items.slice(1);

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              KAJA! Korean Blog
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              The posting of emphasis on Korean learning and practice.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            No posts yet.
          </div>
        ) : (
          <>
            {major ? (
              <Link
                href={`/blog/article/${encodeURIComponent(major.slug)}`}
                className="group mt-10 block overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/20 sm:aspect-2/1">
                  {major.imageLarge?.trim() || major.imageThumb?.trim() ? (
                    <Image
                      src={
                        major.imageLarge?.trim() ||
                        major.imageThumb?.trim() ||
                        ""
                      }
                      alt=""
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 1024px"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl">
                      {major.title}
                    </h2>
                    <p className="mt-1 text-xs text-white/80">
                      {formatNewsDate(major.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ) : null}

            {rest.length > 0 ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/blog/article/${encodeURIComponent(a.slug)}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
                      {a.imageThumb?.trim() || a.imageLarge?.trim() ? (
                        <Image
                          src={
                            a.imageThumb?.trim() || a.imageLarge?.trim() || ""
                          }
                          alt=""
                          fill
                          className="object-cover transition group-hover:scale-[1.02]"
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <span
                        className={cn(
                          "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          levelBadgeClass((a.level ?? 1) as ReadingLevel),
                        )}
                      >
                        {displayLevel((a.level ?? 1) as ReadingLevel)}{" "}
                        {levelLabel((a.level ?? 1) as ReadingLevel)}
                      </span>
                      <h3 className="mt-2 font-serif font-semibold tracking-tight line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="mt-auto pt-2 text-xs text-muted-foreground">
                        {formatNewsDate(a.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        )}
      </Container>
    </div>
  );
}
