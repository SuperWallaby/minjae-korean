import Link from "next/link";
import { SITE_NAME } from "@/lib/siteBrand";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { Button } from "@/components/ui/Button";
import { DramaPageContent } from "./DramaPageContent";
import { getDrama } from "@/lib/dramaRepo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

const META_KEYWORD = "Study Korean with Dramas";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDrama(slug);
  if (!d) return { title: "Drama Not Found" };

  const title = `${d.title} - ${d.artist}`;
  const description = `Study Korean with Dramas: learn Korean with "${d.title}" (${d.artist}). Click on lines to see translations and explanations.`;
  const mainImage = d.images?.large?.trim() || d.images?.thumb?.trim();
  const canonical = `${SITE_URL.replace(/\/+$/, "")}/drama/${encodeURIComponent(slug)}`;
  const metaTitle = `${title} | ${META_KEYWORD} | What is this in Korean`;

  const keywords = [d.level, ...(d.tags ?? [])].filter(Boolean).join(", ");
  return {
    title: metaTitle,
    description,
    ...(keywords && { keywords }),
    alternates: { canonical },
    openGraph: {
      title: metaTitle,
      description,
      type: "article",
      url: canonical,
      ...(mainImage && {
        images: [{ url: mainImage, width: 1200, height: 630, alt: title }],
      }),
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      ...(mainImage && { images: [mainImage] }),
    },
  };
}

export default async function DramaSlugPage({ params }: Props) {
  const { slug } = await params;
  const d = await getDrama(slug);
  if (!d) return notFound();

  const videoId =
    d.source?.provider === "youtube" ? d.source.videoId : undefined;
  const videoIdStr = videoId ? String(videoId).trim() : "";
  const baseUrl = SITE_URL.replace(/\/+$/, "");
  const canonical = `${baseUrl}/drama/${encodeURIComponent(slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: d.title,
    description: `Learn Korean with "${d.title}" (${d.artist}).`,
    url: canonical,
    ...(d.images?.large?.trim() && { thumbnailUrl: d.images.large.trim() }),
  };
  const breadcrumbListJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Drama", item: `${baseUrl}/drama` },
      { "@type": "ListItem", position: 3, name: d.title, item: canonical },
    ],
  };

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }}
      />
      <MarketingShell>
        <MarketingShellBody>
        <DramaPageContent
          videoId={videoIdStr}
          chunks={d.chunks}
          lexicon={d.lexicon}
          slug={slug}
        >
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link href="/drama" className="hover:text-foreground transition-colors">
                Drama
              </Link>
              <span aria-hidden>/</span>
              <span className="font-medium text-foreground" aria-current="page">
                {d.title}
              </span>
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {d.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">{d.artist}</p>
          </div>
        </DramaPageContent>

        <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/drama">← Back to Drama</Link>
          </Button>
          {process.env.NODE_ENV !== "production" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/drama/new?slug=${encodeURIComponent(slug)}`}>
                Edit
              </Link>
            </Button>
          )}
        </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
