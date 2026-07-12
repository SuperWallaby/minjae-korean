/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "korean-vocab-quiz-vs-flashcards";

export const post: BlogPost = {
  slug: SLUG,
  title: "Korean Vocab Quiz vs Flashcards: Which Helps More?",
  description:
    "Flashcards are great for self-paced recall. A Korean picture vocab quiz adds choices, audio, and speed — ideal for short sessions. Compare both and see where What is this called in Korean fits.",
  keywords: [
    "Korean vocab quiz vs flashcards",
    "picture quiz vs flashcards",
    "Korean vocabulary practice methods",
    VOCAB_QUIZ_APP_NAME,
    "learn Korean words",
  ],
  faq: [
    {
      question: "Is a vocab quiz better than flashcards?",
      answer:
        "For short, guided rounds with pictures and multiple choice, a quiz often feels easier to start. Flashcards win when you want open recall and custom decks.",
    },
    {
      question: "Do flashcards still matter for Korean?",
      answer:
        "Yes — especially for production (typing/saying the word with no options). Quizzes shine for recognition under time pressure.",
    },
    {
      question: `How does ${VOCAB_QUIZ_APP_NAME} relate to flashcards?`,
      answer: `${VOCAB_QUIZ_APP_NAME} is a picture quiz first: image, choices, audio. It’s closer to a game round than a blank flashcard.`,
    },
    {
      question: "Can I combine quizzes and flashcards?",
      answer:
        "Yes. Use quizzes for daily contact; use flashcards when you want harder recall without options.",
    },
  ],
  level: 2,
  createdAt: "2026-07-12T09:30:00.000Z",
  updatedAt: "2026-07-12T09:30:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            Flashcards train open recall; a Korean vocab quiz trains fast
            recognition with pictures, choices, and audio.
          </strong>
          {" "}
          Neither replaces the other. For a one-minute wait, a quiz like{" "}
          {VOCAB_QUIZ_APP_NAME} usually starts faster than shuffling a deck.
        </>
      ),
    },
    {
      subtitle: "What each format asks your brain",
      content: (
        <>
          {"Flashcards: “Produce or judge this word.” Quizzes: “Pick the right "}
          {"Korean for this picture — quickly.” "}
          <strong>
            {"Recognition under light pressure is a different muscle than blank recall."}
          </strong>
        </>
      ),
    },
    {
      subtitle: "When quizzes win",
      content: (
        <>
          {"Short sessions, noisy environments, beginners who need meaning "}
          {"anchored by images, and days when setup friction would kill the habit."}
        </>
      ),
    },
    {
      subtitle: "When flashcards win",
      content: (
        <>
          {"You want no multiple-choice hints, custom lists, or strict SRS "}
          {"scheduling you control card-by-card."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Quiz = guided recognition + speed."}
          <br />
          {"• Flashcards = open recall + customization."}
          <br />
          {"• Use both across a week if you can."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Only multiple-choice forever (never test production). Only "}
          {"flashcards with no audio. Building tools instead of finishing rounds."}
        </>
      ),
    },
    {
      subtitle: "Related guides",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-anki">
            vs Anki
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/picture-audio-vs-text-korean-memorization">
            Picture + audio vs text
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/learn-korean-words-in-5-minutes">
            5-minute routine
          </ContentLink>
        </>
      ),
    },
    {
      subtitle: "Try a picture quiz",
      content: <VocabQuizAppCta slug={SLUG} />,
    },
    {
      subtitle: "FAQ",
      content: (
        <>
          <strong>{"Is a vocab quiz better than flashcards?"}</strong>
          <br />
          {"Depends on the job — speed recognition vs open recall."}
          <Gap />
          <strong>{"Do flashcards still matter for Korean?"}</strong>
          <br />
          {"Yes for production practice without options."}
          <Gap />
          <strong>{`How does ${VOCAB_QUIZ_APP_NAME} relate to flashcards?`}</strong>
          <br />
          {"It’s a picture quiz round, not a blank card."}
          <Gap />
          <strong>{"Can I combine quizzes and flashcards?"}</strong>
          <br />
          {"Yes — daily quiz contact + harder flashcard recall."}
        </>
      ),
    },
  ],
};
