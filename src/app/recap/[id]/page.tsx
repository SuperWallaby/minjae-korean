import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { getRecapById } from "@/lib/recapRepo";
import { RecapPublicContent } from "./RecapPublicContent";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recap = await getRecapById(id);
  if (!recap) {
    return { title: "Recap Not Found" };
  }

  const date = recap.createdAt
    ? new Date(recap.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const title = `Korean Lesson Recap${date ? ` - ${date}` : ""}`;

  const descParts: string[] = [];
  if (recap.expression.length > 0) {
    descParts.push(`Expressions: ${recap.expression.map((e) => e.text).slice(0, 2).join(", ")}`);
  }
  if (recap.vocabulary.length > 0) {
    descParts.push(`Vocabulary: ${recap.vocabulary.map((v) => v.text).slice(0, 3).join(", ")}`);
  }
  if (recap.grammarPoint.length > 0) {
    descParts.push(`Grammar: ${recap.grammarPoint.map((g) => g.text).slice(0, 2).join(", ")}`);
  }
  const description = descParts.length > 0
    ? descParts.join(" | ")
    : "Korean lesson recap notes with expressions, vocabulary, and grammar points.";

  const ogImage = "/kaja-recap.png";

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Korean Lesson Recap" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default async function RecapPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recap = await getRecapById(id);
  if (!recap) return notFound();

  const publicRecap = {
    id: recap.id,
    bookingId: recap.bookingId,
    level: recap.level,
    expression: recap.expression,
    grammarPoint: recap.grammarPoint,
    vocabulary: recap.vocabulary,
    mistake: recap.mistake,
    pronounce: recap.pronounce,
    createdAt: recap.createdAt,
    updatedAt: recap.updatedAt,
  };

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-6">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-muted-foreground">
            Recap
          </h1>
          {recap.createdAt ? (
            <span className="text-sm text-muted-foreground">
              {formatDate(recap.createdAt)}
            </span>
          ) : null}
        </div>
        <RecapPublicContent recap={publicRecap} />
      </Container>
    </div>
  );
}
