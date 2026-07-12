/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { VocabQuizAppCta } from "@/components/article/VocabQuizAppCta";
import { VOCAB_QUIZ_APP_NAME } from "@/lib/vocabQuizAeoLinks";
import type { BlogPost } from "../types";

const SLUG = "korean-vocab-quiz-manual-auto-studio-mode";

export const post: BlogPost = {
  slug: SLUG,
  title: "Manual vs Auto vs Studio Mode in Our Korean Vocab Quiz",
  description:
    "Web quiz modes explained: manual for careful taps, auto for hands-free flow, studio for card-deck focus. Then get What is this called in Korean on your phone.",
  keywords: [
    "Korean vocab quiz modes",
    "studio mode Korean quiz",
    "auto mode Korean vocabulary",
    VOCAB_QUIZ_APP_NAME,
  ],
  faq: [
    {
      question: "What is studio mode?",
      answer:
        "Studio mode is a card-deck style experience on the web — flip, throw, and focus on one picture at a time with a calm stage.",
    },
    {
      question: "What is auto mode?",
      answer:
        "Auto mode advances through prompts with audio timing so you can review with less tapping — good for repetition.",
    },
    {
      question: "Should I start in manual mode?",
      answer:
        "If you’re new, manual gives full control. Switch to studio when you want the card feel, or auto when you want flow.",
    },
  ],
  level: 2,
  createdAt: "2026-07-12T10:30:00.000Z",
  updatedAt: "2026-07-12T10:30:00.000Z",
  paragraphs: [
    {
      subtitle: "Direct answer",
      content: (
        <>
          <strong>
            On the web quiz, manual mode is careful control, auto mode is
            hands-light flow, and studio mode is a focused card deck.
          </strong>
          {" "}
          Same words, different rhythm — then take the habit to{" "}
          {VOCAB_QUIZ_APP_NAME} on your phone.
        </>
      ),
    },
    {
      subtitle: "When to use each",
      content: (
        <>
          <strong>{"Manual"}</strong>
          {" — first days, careful listening, teaching someone else."}
          <Gap />
          <strong>{"Auto"}</strong>
          {" — repetition while you keep your hands freer."}
          <Gap />
          <strong>{"Studio"}</strong>
          {" — card flip energy, one image, throw to skip, calm stage."}
        </>
      ),
    },
    {
      subtitle: "Key Takeaway",
      content: (
        <>
          {"• Mode is pacing, not a different curriculum."}
          <br />
          {"• Studio defaults to focus for many learners."}
          <br />
          {"• The app keeps the same picture-quiz idea mobile."}
        </>
      ),
    },
    {
      subtitle: "Common Mistakes",
      content: (
        <>
          {"Fighting auto timing instead of switching modes. Never trying "}
          {"studio. Studying only on desktop when your dead time is on a phone."}
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
          <ContentLink href="/vocab-quiz">
            Play on the web
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
          <strong>{"What is studio mode?"}</strong>
          <br />
          {"Card-deck web play — flip, focus, throw to skip."}
          <Gap />
          <strong>{"What is auto mode?"}</strong>
          <br />
          {"Timed flow with less tapping."}
          <Gap />
          <strong>{"Should I start in manual mode?"}</strong>
          <br />
          {"Yes if you want full control at first."}
        </>
      ),
    },
  ],
};
