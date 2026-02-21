import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Container } from "@/components/site/Container";
import { getClosingForRecap, getEncourageForRecap } from "@/lib/encouragesRepo";
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
    descParts.push(
      `Expressions: ${recap.expression
        .map((e) => e.text)
        .slice(0, 2)
        .join(", ")}`,
    );
  }
  if (recap.vocabulary.length > 0) {
    descParts.push(
      `Vocabulary: ${recap.vocabulary
        .map((v) => v.text)
        .slice(0, 3)
        .join(", ")}`,
    );
  }
  if (recap.grammarPoint.length > 0) {
    descParts.push(
      `Grammar: ${recap.grammarPoint
        .map((g) => g.text)
        .slice(0, 2)
        .join(", ")}`,
    );
  }
  const description =
    descParts.length > 0
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
      images: [
        { url: ogImage, width: 1200, height: 630, alt: "Korean Lesson Recap" },
      ],
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
  const [recap, encourage, closing] = await Promise.all([
    getRecapById(id),
    getEncourageForRecap(id),
    getClosingForRecap(id),
  ]);
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
        <header className="mb-8 text-center">
          <div className="flex flex-col text-center flex-wrap items-center gap-3 gap-y-2">
            <Image
              src="/acheive-4.webp"
              alt=""
              width={80}
              height={80}
              className="shrink-0 bg-included-2/80 rounded-full p-3"
              aria-hidden
            />
            <div className="flex flex-col flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-primary">
                {recap.studentName?.length > 1 ? recap.studentName : ""} Recap
                Note
              </h1>
            </div>
          </div>
          {encourage ? (
            <p className="mt-2 text-sm  text-foreground/80">{encourage}</p>
          ) : null}
        </header>
        <RecapPublicContent recap={publicRecap} closingMessage={closing} />
      </Container>
    </div>
  );
}
