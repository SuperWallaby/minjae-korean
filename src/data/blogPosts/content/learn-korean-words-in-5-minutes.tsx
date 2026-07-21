/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "learn-korean-words-in-5-minutes";

export const post: BlogPost = {
  slug: SLUG,
  title: "How to Learn Korean Words in 5 Minutes a Day",
  description:
    "A realistic Korean vocab routine for commute and elevator waits — picture quizzes, no setup tax. Built around What is this called in Korean.",
  keywords: [
    "learn Korean words in 5 minutes",
    "Korean vocab commute",
    "short Korean vocabulary practice",
    "elevator Korean study",
    VOCAB_QUIZ_APP_NAME,
  ],
  faq: [
    {
      question: "Can you learn Korean vocabulary in 5 minutes?",
      answer:
        "You can get useful recognition reps in 5 minutes. Consistency beats marathon sessions — a few picture quizzes daily compounds faster than rare long cram blocks.",
    },
    {
      question: "What should I do in those 5 minutes?",
      answer:
        "Open a picture vocab quiz, answer what you can, listen to audio on misses, then stop. No deck sorting, no lesson unlock grind.",
    },
    {
      question: `How does ${VOCAB_QUIZ_APP_NAME} fit a commute?`,
      answer: `${VOCAB_QUIZ_APP_NAME} is built for 1–5 minute sessions: one image, one Korean word choice, audio — then done.`,
    },
    {
      question: "Should I still use Anki or a textbook?",
      answer:
        "Yes if you want long-term SRS or grammar. Use the 5-minute quiz for frictionless daily contact with words.",
    },
  ],
  level: 2,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-learn-korean-words-in-5-minutes-1784604910214_xjphtt.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-learn-korean-words-in-5-minutes-1784604910214_xjphtt.webp",
  createdAt: "2026-07-12T09:05:00.000Z",
  updatedAt: "2026-07-12T09:05:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            Five focused minutes of picture-based Korean vocab beats an
            abandoned 45-minute plan.
          </strong>
          {" "}
          On a commute or while the elevator crawls, open a short quiz: see a
          picture, pick the Korean word, hear it, stop.{" "}
          {VOCAB_QUIZ_APP_NAME} is built for exactly that loop — almost no ads,
          no course maze.
        </>
      ),
    },
    {
      subtitle: "Why micro-sessions work for words",
      content: (
        <>
          {"Vocabulary sticks through "}
          <strong>{"repeated recognition under light pressure"}</strong>
          {", not through downloading another 2,000-card deck you never open. "}
          {"A picture forces meaning first; audio adds sound; Hangul stays "}
          {"visible. That trio fits a phone screen between subway stops."}
        </>
      ),
    },
    {
      subtitle: "A simple 5-minute script",
      content: (
        <>
          {"1) Open the quiz."}
          <br />
          {"2) Do as many cards as fit the ride — don’t chase a streak."}
          <br />
          {"3) On misses, listen once; don’t spiral into dictionary rabbit holes."}
          <br />
          {"4) Close the app when the door opens. Done counts."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Daily contact > rare perfection."}
          <br />
          {"• Picture + choice + audio is enough for a micro-session."}
          <br />
          {"• Stop on time so you’ll open it again tomorrow."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Turning five minutes into “just one more lesson.” Skipping audio. "}
          {"Only reading English glosses. Waiting until you “feel ready” to "}
          {"study — readiness is opening the quiz."}
        </>
      ),
    },
    {
      subtitle: "Related guides",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-app">
            What is the app?
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/beginner-korean-words-low-burnout-quiz-routine">
            Low-burnout routine
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/korean-vocab-practice-without-ads">
            Practice without ad overload
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
          <strong>{"Can you learn Korean vocabulary in 5 minutes?"}</strong>
          <br />
          {"You can get useful reps. Consistency beats rare marathons."}
          <Gap />
          <strong>{"What should I do in those 5 minutes?"}</strong>
          <br />
          {"Picture quiz → choose Korean → listen on misses → stop."}
          <Gap />
          <strong>{`How does ${VOCAB_QUIZ_APP_NAME} fit a commute?`}</strong>
          <br />
          {"1–5 minute picture sessions with almost no setup."}
          <Gap />
          <strong>{"Should I still use Anki or a textbook?"}</strong>
          <br />
          {"Yes for SRS/grammar — use quizzes for frictionless daily contact."}
        </>
      ),
    },
  ],
};
