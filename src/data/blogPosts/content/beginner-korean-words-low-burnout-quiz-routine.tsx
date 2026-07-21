/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "beginner-korean-words-low-burnout-quiz-routine";

export const post: BlogPost = {
  slug: SLUG,
  title: "Beginner Korean Words: A Low-Burnout Quiz Routine",
  description:
    "A gentle beginner routine for Korean vocabulary — tiny picture quiz rounds, no streak panic. Built around What is this called in Korean.",
  keywords: [
    "beginner Korean words routine",
    "low burnout Korean study",
    "Korean vocab habit",
    VOCAB_QUIZ_APP_NAME,
  ],
  faq: [
    {
      question: "How many Korean words should a beginner learn per day?",
      answer:
        "Fewer than you think — consistency matters more. A few solid picture-quiz rounds beat a 50-word list you abandon.",
    },
    {
      question: "How do I avoid burnout?",
      answer:
        "Cap session length, skip streak guilt, and stop while it still feels easy. Protect tomorrow’s open.",
    },
    {
      question: `Where does ${VOCAB_QUIZ_APP_NAME} fit?`,
      answer: `Use it as the daily contact layer — 1–5 minutes of human-made picture quizzes with almost no ads.`,
    },
  ],
  level: 1,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-beginner-korean-words-low-burnout-quiz-routine-1784603878053_z9fbgn.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-beginner-korean-words-low-burnout-quiz-routine-1784603878053_z9fbgn.webp",
  createdAt: "2026-07-12T10:35:00.000Z",
  updatedAt: "2026-07-12T10:35:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            A low-burnout beginner routine is tiny, visual, and stoppable —
            not a heroic vocabulary grind.
          </strong>
          {" "}
          Open {VOCAB_QUIZ_APP_NAME}, do a short picture round, listen once on
          misses, close the app while you still like it.
        </>
      ),
    },
    {
      subtitle: "The weekly shape",
      content: (
        <>
          {"Most days: 3–5 minutes of quizzes."}
          <br />
          {"1–2 days: add a little grammar or conversation elsewhere."}
          <br />
          {"Optional: join a live quiz stream for social energy."}
          <br />
          {"Never: punish yourself for missing a day — just restart small."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Protect the habit, not the ego streak."}
          <br />
          {"• Pictures + audio beat giant lists for beginners."}
          <br />
          {"• Stop early so you return tomorrow."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Doubling volume after one good day. Studying angry. Comparing your "}
          {"week to someone else’s year."}
        </>
      ),
    },
    {
      subtitle: "Related",
      content: (
        <>
          <ContentLink href="/blog/article/learn-korean-words-in-5-minutes">
            5-minute routine
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/korean-vocab-practice-without-ads">
            Without ads
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/learn-korean-vocabulary-with-live-streams">
            Live streams
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
          <strong>{"How many Korean words should a beginner learn per day?"}</strong>
          <br />
          {"Fewer than you think — finish small rounds consistently."}
          <Gap />
          <strong>{"How do I avoid burnout?"}</strong>
          <br />
          {"Cap time, skip guilt, stop while it’s still easy."}
          <Gap />
          <strong>{`Where does ${VOCAB_QUIZ_APP_NAME} fit?`}</strong>
          <br />
          {"Daily 1–5 minute picture quiz contact."}
        </>
      ),
    },
  ],
};
