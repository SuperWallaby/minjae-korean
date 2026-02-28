import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import { SongPageContent } from "./SongPageContent";
import { getSong } from "@/lib/songsRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSong(slug);
  if (!s) return { title: "Song Not Found" };

  const title = `${s.title} - ${s.artist}`;
  const description = `Learn Korean with "${s.title}" by ${s.artist}. Click on lyrics to see translations and explanations.`;
  const mainImage = s.images?.large?.trim() || s.images?.thumb?.trim();
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/songs/${encodeURIComponent(slug)}`;

  const keywords = [s.level, ...(s.tags ?? [])].filter(Boolean).join(", ");
  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      ...(mainImage && {
        images: [{ url: mainImage, width: 1200, height: 630, alt: title }],
      }),
      siteName: "Kaja",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(mainImage && { images: [mainImage] }),
    },
  };
}

export default async function SongPage({ params }: Props) {
  const { slug } = await params;
  const s = await getSong(slug);
  if (!s) return notFound();

  const videoId = s.source?.provider === "youtube" ? s.source.videoId : undefined;

  const videoIdStr = videoId ? String(videoId).trim() : "";
  const baseUrl = SITE_URL.replace(/\/+$/, "");
  const canonical = `${baseUrl}/songs/${encodeURIComponent(slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: s.title,
    byArtist: { "@type": "MusicGroup", name: s.artist },
    url: canonical,
    description: `Learn Korean with "${s.title}" by ${s.artist}. Click on lyrics to see translations and explanations.`,
    ...(s.images?.large?.trim() && { image: s.images.large.trim() }),
  };
  const breadcrumbListJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Songs", item: `${baseUrl}/songs` },
      { "@type": "ListItem", position: 3, name: s.title, item: canonical },
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
      <Container className="max-w-3xl">
        <SongPageContent
          videoId={videoIdStr}
          chunks={s.chunks}
          lexicon={s.lexicon}
          slug={slug}
        >
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link href="/songs" className="hover:text-foreground transition-colors">
                Songs
              </Link>
              <span aria-hidden>/</span>
              <span className="font-medium text-foreground" aria-current="page">
                {s.title}
              </span>
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {s.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">{s.artist}</p>
          </div>
        </SongPageContent>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/songs">← Back to Songs</Link>
          </Button>
          {process.env.NODE_ENV !== "production" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/songs/new?slug=${encodeURIComponent(slug)}`}>
                Edit
              </Link>
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
}
