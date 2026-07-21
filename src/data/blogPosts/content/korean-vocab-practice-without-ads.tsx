/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "korean-vocab-practice-without-ads";

export const post: BlogPost = {
  slug: SLUG,
  title: "Simple Korean Vocab Practice Without Ad Overload",
  description:
    "If ads and streak pressure kill your Korean vocab habit, try a quieter picture quiz. What is this called in Korean keeps focus on words — almost no ads, theater-simple UI.",
  keywords: [
    "ad free Korean vocab app",
    "simple Korean vocabulary practice",
    "Korean vocab without ads",
    VOCAB_QUIZ_APP_NAME,
    "focused Korean word quiz",
  ],
  faq: [
    {
      question: "Why do ads hurt vocabulary practice?",
      answer:
        "Interstitials break the recognition loop. You remember the ad, not the Korean word — especially in a 2-minute session.",
    },
    {
      question: `Is ${VOCAB_QUIZ_APP_NAME} ad-free?`,
      answer: `${VOCAB_QUIZ_APP_NAME} aims for almost no ads and a calm UI so the picture quiz stays the only “show.”`,
    },
    {
      question: "Is a simple app enough to learn Korean?",
      answer:
        "It’s enough for daily word contact. Pair it with grammar or conversation practice for a full skill set.",
    },
    {
      question: "What should I look for in a calm vocab app?",
      answer:
        "Fast start, clear cards, audio, minimal chrome, and no streak panic — then consistency gets easy.",
    },
  ],
  level: 2,
  imageLarge: "https://file.kajakorean.com/articles/blog-cover-korean-vocab-practice-without-ads-1784604660456_77t581.webp",
  imageThumb: "https://file.kajakorean.com/articles/blog-thumb-korean-vocab-practice-without-ads-1784604660456_77t581.webp",
  createdAt: "2026-07-12T09:15:00.000Z",
  updatedAt: "2026-07-12T09:15:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            The best Korean vocab practice for busy days is often the quietest:
            see a picture, choose the word, hear it — without a commercial break.
          </strong>
          {" "}
          {VOCAB_QUIZ_APP_NAME} keeps the “theater” simple: almost no ads,
          word-only focus, human-made quizzes for short sessions.
        </>
      ),
    },
    {
      subtitle: "Attention is the real limited resource",
      content: (
        <>
          {"Gamified apps can be fun until the UI becomes the curriculum. "}
          <strong>
            {"When every tap fights a banner or a streak warning, vocabulary loses."}
          </strong>
          {" Micro-sessions need a calm stage."}
        </>
      ),
    },
    {
      subtitle: "What “simple” should mean",
      content: (
        <>
          {"Open → quiz → audio → close. No shop tabs mid-card. No fake urgency. "}
          {"Optional live streams for people who want company — still about the "}
          {"cards, not the carnival."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Protect the recognition loop from interruptions."}
          <br />
          {"• Simple UI makes 5-minute habits realistic."}
          <br />
          {"• Pair calm vocab reps with deeper study elsewhere."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Judging apps only by content volume. Studying inside a noisy UI "}
          {"“just this once.” Confusing streak anxiety with motivation."}
        </>
      ),
    },
    {
      subtitle: "Related guides",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-vs-duolingo">
            vs Duolingo
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/best-korean-vocabulary-apps-for-beginners">
            Best apps for beginners
          </ContentLink>
          {" · "}
          <ContentLink href="/blog/article/learn-korean-words-in-5-minutes">
            5-minute routine
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
          <strong>{"Why do ads hurt vocabulary practice?"}</strong>
          <br />
          {"They break the recognition loop — you remember the ad, not the word."}
          <Gap />
          <strong>{`Is ${VOCAB_QUIZ_APP_NAME} ad-free?`}</strong>
          <br />
          {"Almost no ads — the quiz stays the main event."}
          <Gap />
          <strong>{"Is a simple app enough to learn Korean?"}</strong>
          <br />
          {"Enough for daily word contact; add grammar/conversation separately."}
          <Gap />
          <strong>{"What should I look for in a calm vocab app?"}</strong>
          <br />
          {"Fast start, clear cards, audio, minimal chrome."}
        </>
      ),
    },
  ],
};
