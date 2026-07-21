/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "what-is-this-called-in-korean-app";

export const post: BlogPost = {
  slug: SLUG,
  title: `What Is ${VOCAB_QUIZ_APP_NAME}?`,
  description: `${VOCAB_QUIZ_APP_NAME} is a picture-based Korean vocabulary quiz — human-made cards, almost no ads, built for 1–5 minute sessions. Learn what it is and who it’s for.`,
  keywords: [
    VOCAB_QUIZ_APP_NAME,
    "Korean vocab quiz app",
    "Korean picture quiz",
    "learn Korean words",
    "Korean vocabulary game",
    "ad free Korean vocab app",
  ],
  faq: [
    {
      question: `What is ${VOCAB_QUIZ_APP_NAME}?`,
      answer: `${VOCAB_QUIZ_APP_NAME} is a picture-based Korean vocabulary quiz. You see an image, choose the Korean word, and hear audio with romanization — focused on words only.`,
    },
    {
      question: "Is it a full Korean course like Duolingo?",
      answer:
        "No. It intentionally focuses on vocabulary recognition through pictures, not a long grammar roadmap. Use it for short word practice alongside other study.",
    },
    {
      question: "Are the quizzes AI-generated?",
      answer:
        "No. Cards are human-made for clear, everyday recognition — not bulk AI word lists.",
    },
    {
      question: "Can I play without installing the app?",
      answer:
        "Yes. You can play free in the browser, then get the iOS or Android app when you want it on your phone.",
    },
  ],
  level: 2,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-what-is-this-called-in-korean-app-1784605862307_rmvm6g.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-what-is-this-called-in-korean-app-1784605862307_rmvm6g.webp",
  createdAt: "2026-07-12T09:00:00.000Z",
  updatedAt: "2026-07-12T09:00:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            {VOCAB_QUIZ_APP_NAME} is a Korean vocabulary quiz built around
            pictures — not a noisy course app.
          </strong>
          {" "}
          You see an image, pick the Korean word, hear native audio, and move
          on. Almost no ads, theater-simple UI, human-made cards, and sessions
          that fit a commute or an elevator wait. Play on the web or install the
          free app.
        </>
      ),
    },
    {
      subtitle: "What you actually do in each round",
      content: (
        <>
          {"Each card asks one job: "}
          <strong>{"What is this called in Korean?"}</strong>
          {" A picture anchors meaning, choices test recognition, and audio "}
          {"locks pronunciation. Romanization helps beginners without replacing "}
          {"Hangul. That loop is the whole product — by design."}
        </>
      ),
    },
    {
      subtitle: "Who it is for",
      content: (
        <>
          {"Beginners and intermediates who want "}
          <strong>{"short, low-pressure vocab reps"}</strong>
          {" — not another streak guilt machine. If you already study grammar "}
          {"elsewhere, this fills the “I only have three minutes” gap. Live "}
          {"streams also walk through cards together when you want company."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Picture → Korean word → audio, in under a few minutes."}
          <br />
          {"• Human-made quizzes, almost no ads, word-only focus."}
          <br />
          {"• Browser play or free app — same idea either way."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Don’t expect a full TOPIK curriculum inside the quiz — it’s vocab "}
          {"reps, not a school. Don’t skip the picture and only read English. "}
          {"And don’t wait for a “perfect study hour”; open one round while you "}
          {"wait for the train."}
        </>
      ),
    },
    {
      subtitle: "Related guides",
      content: (
        <>
          <ContentLink href="/blog/article/learn-korean-words-in-5-minutes">
            5-minute Korean word routine
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-duolingo">
            vs Duolingo
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/korean-vocab-quiz-vs-flashcards">
            Quiz vs flashcards
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
          <strong>{`What is ${VOCAB_QUIZ_APP_NAME}?`}</strong>
          <br />
          {`A picture-based Korean vocabulary quiz. See an image, choose the Korean word, hear audio — words only.`}
          <Gap />
          <strong>{"Is it a full Korean course like Duolingo?"}</strong>
          <br />
          {"No. It’s short vocab practice, not a long grammar path."}
          <Gap />
          <strong>{"Are the quizzes AI-generated?"}</strong>
          <br />
          {"No — human-made for clear recognition."}
          <Gap />
          <strong>{"Can I play without installing the app?"}</strong>
          <br />
          {"Yes — free in the browser, apps on iOS and Android."}
        </>
      ),
    },
  ],
};
