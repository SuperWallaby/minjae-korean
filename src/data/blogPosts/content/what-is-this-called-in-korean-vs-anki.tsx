/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "what-is-this-called-in-korean-vs-anki";

export const post: BlogPost = {
  slug: SLUG,
  title: `${VOCAB_QUIZ_APP_NAME} vs Anki: Picture Quiz or SRS Decks?`,
  description: `Anki wins for custom spaced repetition. ${VOCAB_QUIZ_APP_NAME} wins for instant picture vocab play with almost no setup. Here’s when each tool fits.`,
  keywords: [
    `${VOCAB_QUIZ_APP_NAME} vs Anki`,
    "Anki vs Korean vocab quiz",
    "Anki alternative Korean",
    "picture quiz vs SRS",
    "Korean flashcards vs quiz",
  ],
  faq: [
    {
      question: "Should I quit Anki for a Korean vocab quiz app?",
      answer:
        "Not if SRS decks already work for you. Add a picture quiz for frictionless days when deck maintenance feels heavy.",
    },
    {
      question: `Is ${VOCAB_QUIZ_APP_NAME} spaced repetition?`,
      answer: `${VOCAB_QUIZ_APP_NAME} focuses on fast picture recognition play. Anki’s scheduling algorithms are deeper for long-term deck science.`,
    },
    {
      question: "Which is faster to start?",
      answer: `A picture quiz like ${VOCAB_QUIZ_APP_NAME} — open and play. Anki needs decks, settings, and often add-ons.`,
    },
    {
      question: "Can beginners use Anki for Korean?",
      answer:
        "Yes, but setup cost is real. Many beginners stick longer with a ready-made picture quiz, then add Anki later.",
    },
  ],
  level: 3,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-what-is-this-called-in-korean-vs-anki-1784605465823_94ld41.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-what-is-this-called-in-korean-vs-anki-1784605465823_94ld41.webp",
  createdAt: "2026-07-12T09:25:00.000Z",
  updatedAt: "2026-07-12T09:25:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            Anki is the power tool for spaced repetition decks;{" "}
            {VOCAB_QUIZ_APP_NAME} is the ready-to-play picture quiz for Korean
            words.
          </strong>
          {" "}
          Use Anki when you want control and scheduling. Use the quiz when you
          want zero setup and a calm 2-minute round.
        </>
      ),
    },
    {
      subtitle: "Quick comparison",
      content: (
        <>
          <strong>{"Setup"}</strong>
          {" → Anki: decks & options · quiz: open and go"}
          <Gap />
          <strong>{"Scheduling"}</strong>
          {" → Anki: advanced SRS · quiz: lightweight play loop"}
          <Gap />
          <strong>{"Pictures + audio"}</strong>
          {" → Anki: if you build them · quiz: built-in"}
          <Gap />
          <strong>{"Ads"}</strong>
          {" → Anki: typically none · quiz: almost none"}
          <Gap />
          <strong>{"Best pocket of time"}</strong>
          {" → Anki: focused review blocks · quiz: elevator / commute crumbs"}
        </>
      ),
    },
    {
      subtitle: "Who should use Anki",
      content: (
        <>
          {"You enjoy optimizing decks, you need custom card types, or you’re "}
          {"already fluent with SRS workflows."}
        </>
      ),
    },
    {
      subtitle: `Who should use ${VOCAB_QUIZ_APP_NAME}`,
      content: (
        <>
          {"You want human-made picture cards immediately, with audio, without "}
          {"becoming a deck engineer tonight."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Anki = control + SRS depth."}
          <br />
          {"• Picture quiz = instant Korean word play."}
          <br />
          {"• They complement more than they replace."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Building a huge Anki deck and never reviewing. Expecting a quiz "}
          {"app to clone Anki’s algorithm. Tool-switching instead of showing up."}
        </>
      ),
    },
    {
      subtitle: "Related comparisons",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-duolingo">
            vs Duolingo
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/korean-vocab-quiz-vs-flashcards">
            Quiz vs flashcards
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-drops">
            vs Drops
          </ContentLink>
        </>
      ),
    },
    {
      subtitle: "Try the picture quiz",
      content: <VocabQuizAppCta slug={SLUG} />,
    },
    {
      subtitle: "FAQ",
      content: (
        <>
          <strong>{"Should I quit Anki for a quiz app?"}</strong>
          <br />
          {"No if SRS works — add a quiz for zero-setup days."}
          <Gap />
          <strong>{`Is ${VOCAB_QUIZ_APP_NAME} spaced repetition?`}</strong>
          <br />
          {"It’s a play loop; Anki goes deeper on scheduling."}
          <Gap />
          <strong>{"Which is faster to start?"}</strong>
          <br />
          {"The picture quiz — open and play."}
          <Gap />
          <strong>{"Can beginners use Anki for Korean?"}</strong>
          <br />
          {"Yes, but setup cost is higher than a ready quiz."}
        </>
      ),
    },
  ],
};
