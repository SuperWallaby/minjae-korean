/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "what-is-this-called-in-korean-vs-memrise";

export const post: BlogPost = {
  slug: SLUG,
  title: `${VOCAB_QUIZ_APP_NAME} vs Memrise: Curation vs Clips`,
  description: `Memrise is known for video clips and community content energy. ${VOCAB_QUIZ_APP_NAME} is a calm, human-made picture quiz for Korean words — almost no ads, micro sessions, optional live.`,
  keywords: [
    `${VOCAB_QUIZ_APP_NAME} vs Memrise`,
    "Memrise vs Korean vocab quiz",
    "Memrise alternative Korean",
    "Korean vocabulary app comparison",
  ],
  faq: [
    {
      question: `Should I use Memrise or ${VOCAB_QUIZ_APP_NAME}?`,
      answer: `Use Memrise if you like clip-based / course-style vocab practice. Use ${VOCAB_QUIZ_APP_NAME} if you want short picture quizzes with a quiet UI and human-made cards.`,
    },
    {
      question: "Is Memrise good for Korean vocabulary?",
      answer:
        "Many learners like it for exposure. Quality varies by course/content — always sample a few lessons before committing.",
    },
    {
      question: "What does human-made mean here?",
      answer: `${VOCAB_QUIZ_APP_NAME} curates picture quizzes for clear recognition instead of bulk-generating cards.`,
    },
  ],
  level: 2,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-what-is-this-called-in-korean-vs-memrise-1784605191025_tees6r.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-what-is-this-called-in-korean-vs-memrise-1784605191025_tees6r.webp",
  createdAt: "2026-07-12T10:05:00.000Z",
  updatedAt: "2026-07-12T10:05:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            Memrise leans into memorable clips and course-style vocab exposure;
            {VOCAB_QUIZ_APP_NAME} leans into quiet picture quizzes you can finish
            in a minute.
          </strong>
          {" "}
          Different vibes, same goal of remembering words — choose the format
          you’ll repeat.
        </>
      ),
    },
    {
      subtitle: "Quick comparison",
      content: (
        <>
          {"• Memrise: clips / course energy · quiz: picture + choices + audio"}
          <br />
          {"• Session length: Memrise varies · quiz: built for micro pockets"}
          <br />
          {"• Ads/UI calm: quiz prioritizes almost no ads"}
          <br />
          {"• Live co-play: quiz yes"}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Clips help memory for some people; pictures help others."}
          <br />
          {"• Short, calm rounds beat abandoned long lessons."}
          <br />
          {"• Sample both once, then commit for 30 days."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Collecting apps like stickers. Skipping speaking/listening. "}
          {"Confusing entertainment with finished reps."}
        </>
      ),
    },
    {
      subtitle: "Related",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-drops">
            vs Drops
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/human-made-korean-quizzes-vs-ai">
            Human-made vs AI
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
          <strong>{`Should I use Memrise or ${VOCAB_QUIZ_APP_NAME}?`}</strong>
          <br />
          {"Clips/course energy vs calm picture quizzes — pick your habit."}
          <Gap />
          <strong>{"Is Memrise good for Korean vocabulary?"}</strong>
          <br />
          {"Often yes — sample content quality first."}
          <Gap />
          <strong>{"What does human-made mean here?"}</strong>
          <br />
          {"Curated picture quizzes for clear recognition."}
        </>
      ),
    },
  ],
};
