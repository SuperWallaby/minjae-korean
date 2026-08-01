import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { MarketingPage } from "@/components/site/MarketingShell";
import { findKoreanQuizById } from "@/lib/koreanQuiz/store";
import { toKoreanQuizPrepared } from "@/lib/koreanQuiz/public";
import { SITE_NAME } from "@/lib/siteBrand";
import { siteUrl } from "@/lib/siteUrl";
import { withVocabQuizUtm } from "@/lib/vocabQuizAeoLinks";
import quizStyles from "@/components/vocab-quiz/vocab-quiz.module.css";

import { SharedQuizClient } from "./SharedQuizClient";

type Props = {
  params: Promise<{ id: string }>;
};

async function loadApprovedQuiz(id: string) {
  const item = await findKoreanQuizById(id);
  if (!item || item.status !== "approved") return null;
  return toKoreanQuizPrepared(item);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const quiz = await loadApprovedQuiz(id);
  const gloss =
    quiz?.illustrationEnglish?.trim() ||
    quiz?.choices.find((choice) => choice.id === quiz.correctChoiceId)?.english?.trim() ||
    "this Korean word";
  const title = `Try this Korean quiz · ${SITE_NAME}`;
  const description = `Can you say “${gloss}” in Korean? Play this shared quiz on ${SITE_NAME}.`;
  const url = siteUrl(`/q/${id}`);
  const image = quiz?.imageUrl?.trim() || "/brand/og.png";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: gloss }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SharedQuizPage({ params }: Props) {
  const { id } = await params;
  const quiz = await loadApprovedQuiz(id);
  if (!quiz) notFound();

  const moreHref = withVocabQuizUtm("/vocab-quiz", {
    source: "share",
    content: `q-header:${id}`,
  });

  return (
    <MarketingPage>
      <div className={quizStyles.sharePageWrap}>
        <p style={{ textAlign: "center", margin: "0 0 0.75rem" }}>
          <Link href={moreHref} style={{ color: "#0066cc", fontWeight: 700 }}>
            Kaja Korean quiz
          </Link>
        </p>
        <SharedQuizClient quiz={quiz} />
      </div>
    </MarketingPage>
  );
}
