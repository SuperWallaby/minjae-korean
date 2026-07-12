/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "learn-korean-vocabulary-with-live-streams";

export const post: BlogPost = {
  slug: SLUG,
  title: "Learn Korean Vocabulary with Live Streams",
  description: `Solo streaks aren’t the only way. ${VOCAB_QUIZ_APP_NAME} pairs picture vocab quizzes with live sessions where you solve cards together — low pressure, social focus.`,
  keywords: [
    "learn Korean vocabulary live",
    "Korean vocab live stream",
    "live Korean quiz",
    VOCAB_QUIZ_APP_NAME,
  ],
  faq: [
    {
      question: "Can you learn Korean vocab in a live stream?",
      answer:
        "Yes — live quiz walkthroughs keep attention high and make short practice feel social instead of lonely.",
    },
    {
      question: `Does ${VOCAB_QUIZ_APP_NAME} do live streams?`,
      answer: `Yes. Live sessions go through picture quizzes together so practice stays light and focused on words.`,
    },
    {
      question: "Do I need to watch live to use the app?",
      answer:
        "No. Play anytime in the app or browser. Live is optional company for the same card style.",
    },
  ],
  level: 2,
  createdAt: "2026-07-12T10:25:00.000Z",
  updatedAt: "2026-07-12T10:25:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            Live streams turn Korean vocab quizzes into a shared room — you
            still answer cards, but you’re not alone with a streak counter.
          </strong>
          {" "}
          {VOCAB_QUIZ_APP_NAME} is built for solo micro sessions and for live
          play-alongs that keep the focus on pictures and words.
        </>
      ),
    },
    {
      subtitle: "Why live helps (without becoming a class)",
      content: (
        <>
          {"Accountability without homework theater. You hear pacing, jokes, "}
          {"and corrections in real time, then continue solo later with the "}
          {"same quiz style."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Live = optional social layer on the same quiz."}
          <br />
          {"• Solo micro sessions still matter most days."}
          <br />
          {"• Keep the focus on cards, not chat chaos."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Only watching without answering. Skipping solo practice between "}
          {"streams. Treating live like entertainment only."}
        </>
      ),
    },
    {
      subtitle: "Related",
      content: (
        <>
          <ContentLink href="/blog/article/what-is-this-called-in-korean-app">
            What is the app?
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
          <strong>{"Can you learn Korean vocab in a live stream?"}</strong>
          <br />
          {"Yes — shared quiz energy helps many learners show up."}
          <Gap />
          <strong>{`Does ${VOCAB_QUIZ_APP_NAME} do live streams?`}</strong>
          <br />
          {"Yes — picture quizzes together, still word-focused."}
          <Gap />
          <strong>{"Do I need to watch live to use the app?"}</strong>
          <br />
          {"No — play anytime; live is optional."}
        </>
      ),
    },
  ],
};
