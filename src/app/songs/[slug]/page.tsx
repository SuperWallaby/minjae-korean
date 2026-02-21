import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Container } from "@/components/site/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SongChunkCard } from "@/components/song/SongChunkCard";
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
  const mainImage = s.imageLarge?.trim() || s.imageThumb?.trim();
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/songs/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
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

  const videoId = s.source?.videoId;

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/songs" className="hover:text-foreground transition-colors">
              Songs
            </Link>
            <span>/</span>
            <span>{s.artist}</span>
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {s.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{s.artist}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="muted">Level {s.level}</Badge>
            {s.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* YouTube Player */}
        {videoId ? (
          <div className="mb-10 overflow-hidden rounded-xl border border-border bg-black">
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`${s.title} - ${s.artist}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        ) : null}

        {/* Lyrics Chunks */}
        <section>
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl mb-4">
            Lyrics
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Click on any section to see translation, explanation, and vocabulary.
          </p>

          {s.chunks.length === 0 ? (
            <p className="text-muted-foreground">No lyrics yet.</p>
          ) : (
            <div className="space-y-3">
              {s.chunks.map((chunk) => (
                <SongChunkCard key={chunk.id} chunk={chunk} />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <Button asChild variant="outline">
            <Link href="/songs">← Back to Songs</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
