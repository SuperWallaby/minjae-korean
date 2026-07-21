/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "what-is-this-called-in-korean-vs-lingodeer";

export const post: BlogPost = {
  slug: SLUG,
  title: `${VOCAB_QUIZ_APP_NAME} vs LingoDeer: Course Path or Micro Quiz?`,
  description: `LingoDeer is strong for structured Korean lessons. ${VOCAB_QUIZ_APP_NAME} is a picture vocab quiz for 1–5 minute sessions. Use the course for roadmap — the quiz for word snacks.`,
  keywords: [
    `${VOCAB_QUIZ_APP_NAME} vs LingoDeer`,
    "LingoDeer vs Korean vocab quiz",
    "LingoDeer alternative",
    "structured Korean course vs quiz",
  ],
  faq: [
    {
      question: `Is ${VOCAB_QUIZ_APP_NAME} a replacement for LingoDeer?`,
      answer:
        "No. LingoDeer covers structured lessons; the picture quiz covers short vocab recognition. They can sit side by side.",
    },
    {
      question: "Which is better for grammar?",
      answer:
        "LingoDeer (or textbooks/teachers). The quiz is intentionally word-focused.",
    },
    {
      question: "Which is better between meetings?",
      answer: `${VOCAB_QUIZ_APP_NAME} — open a few picture cards and stop.`,
    },
  ],
  level: 2,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-what-is-this-called-in-korean-vs-lingodeer-1784606058801_auesd0.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-what-is-this-called-in-korean-vs-lingodeer-1784606058801_auesd0.webp",
  createdAt: "2026-07-12T10:10:00.000Z",
  updatedAt: "2026-07-12T10:10:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            LingoDeer fits learners who want a structured Korean course path;
            {VOCAB_QUIZ_APP_NAME} fits learners who want micro picture quizzes
            between real life.
          </strong>
          {" "}
          Don’t force one tool to do both jobs.
        </>
      ),
    },
    {
      subtitle: "Quick comparison",
      content: (
        <>
          {"• Roadmap/grammar: LingoDeer stronger"}
          <br />
          {"• 1–5 min word-only: picture quiz stronger"}
          <br />
          {"• Ads/calm stage: quiz prioritizes almost none"}
          <br />
          {"• Human-made picture cards: quiz focus"}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Course apps teach breadth."}
          <br />
          {"• Micro quizzes protect daily contact."}
          <br />
          {"• Combine without guilt."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Dropping a good course because a quiz feels easier. Expecting a "}
          {"vocab quiz to explain every grammar ending."}
        </>
      ),
    },
    {
      subtitle: "Related",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-duolingo">
            vs Duolingo
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/best-korean-vocabulary-apps-for-beginners">
            Beginner roundup
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
          <strong>{`Is ${VOCAB_QUIZ_APP_NAME} a replacement for LingoDeer?`}</strong>
          <br />
          {"No — course vs micro vocab quiz."}
          <Gap />
          <strong>{"Which is better for grammar?"}</strong>
          <br />
          {"Structured courses / teachers — not a word quiz."}
          <Gap />
          <strong>{"Which is better between meetings?"}</strong>
          <br />
          {"The picture quiz for tiny pockets of time."}
        </>
      ),
    },
  ],
};
