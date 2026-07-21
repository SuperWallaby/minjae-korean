/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "what-is-this-called-in-korean-vs-drops";

export const post: BlogPost = {
  slug: SLUG,
  title: `${VOCAB_QUIZ_APP_NAME} vs Drops: Visual Korean Vocab Compared`,
  description: `Both use visuals for vocabulary. Drops is a polished vocab product with its own pacing; ${VOCAB_QUIZ_APP_NAME} focuses on human-made picture quizzes, almost no ads, and micro sessions — plus live play.`,
  keywords: [
    `${VOCAB_QUIZ_APP_NAME} vs Drops`,
    "Drops vs Korean vocab quiz",
    "Drops alternative Korean",
    "visual Korean vocabulary app",
  ],
  faq: [
    {
      question: `How is ${VOCAB_QUIZ_APP_NAME} different from Drops?`,
      answer: `Both are visual. ${VOCAB_QUIZ_APP_NAME} emphasizes human-made quizzes, ad-light play, and short sessions with optional live streams. Drops is its own branded visual vocab system with timed sessions.`,
    },
    {
      question: "Which is better for absolute beginners?",
      answer:
        "Either can work. Choose the UI you’ll open daily. If you want quiz-style multiple choice with Korean audio and a calm stage, try the picture quiz.",
    },
    {
      question: "Do I need both apps?",
      answer:
        "Usually no. Pick one visual vocab habit and stick with it for a month before switching.",
    },
  ],
  level: 2,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-what-is-this-called-in-korean-vs-drops-1784605320685_j3vygf.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-what-is-this-called-in-korean-vs-drops-1784605320685_j3vygf.webp",
  createdAt: "2026-07-12T10:00:00.000Z",
  updatedAt: "2026-07-12T10:00:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            Drops and {VOCAB_QUIZ_APP_NAME} both teach vocabulary with visuals —
            but they feel different in session design and pressure.
          </strong>
          {" "}
          {VOCAB_QUIZ_APP_NAME} is a human-made picture quiz with almost no ads
          and optional live play. Drops is a polished visual vocab product with
          its own timed flow. Pick the habit you’ll actually keep.
        </>
      ),
    },
    {
      subtitle: "Quick comparison",
      content: (
        <>
          {"• Visuals: both strong"}
          <br />
          {"• Ads / calm UI: picture quiz aims for almost none"}
          <br />
          {"• Format: quiz choices + audio vs Drops’ branded session style"}
          <br />
          {"• Live together: picture quiz yes · Drops no"}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Visual vocab apps aren’t identical."}
          <br />
          {"• Optimize for the session you’ll finish."}
          <br />
          {"• Human-made clarity matters in short rounds."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Installing every pretty vocab app. Ignoring audio. Quitting after "}
          {"one confusing card instead of finishing a tiny round."}
        </>
      ),
    },
    {
      subtitle: "Related",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-memrise">
            vs Memrise
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-duolingo">
            vs Duolingo
          </ContentLink>
        </>
      ),
    },
    {
      subtitle: "Try it",
      content: <VocabQuizAppCta slug={SLUG} />,
    },
    {
      subtitle: "FAQ",
      content: (
        <>
          <strong>{`How is ${VOCAB_QUIZ_APP_NAME} different from Drops?`}</strong>
          <br />
          {"Both visual — different session design, ads, and live options."}
          <Gap />
          <strong>{"Which is better for absolute beginners?"}</strong>
          <br />
          {"Whichever UI you’ll open daily."}
          <Gap />
          <strong>{"Do I need both apps?"}</strong>
          <br />
          {"Usually pick one visual habit for a month first."}
        </>
      ),
    },
  ],
};
