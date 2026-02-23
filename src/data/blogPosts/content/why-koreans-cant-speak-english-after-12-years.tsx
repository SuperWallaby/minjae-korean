/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Describe } from "@/components/article/Describe";
import { Quoter } from "@/components/article/Quoter";
import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "why-koreans-cant-speak-english-after-12-years",
  title: "Why Koreans Struggle to Speak English After 12 Years of Study",
  level: 2,
  createdAt: "2026-02-23T00:00:00.000Z",
  updatedAt: "2026-02-23T00:00:00.000Z",
  paragraphs: [
    {
      subtitle: "The Strange Reality",
      content: (
        <span>
          Koreans study English for about <b>12 years</b>.
          <br />
          Elementary school, middle school, high school English is always there.
          <br />
          <br />
          But many people are still afraid to talk to foreigners.
          <br />
          And even one simple sentence feels hard.
          <br />
          <br />
          So… what happened?
        </span>
      ),
    },
    {
      subtitle: "The Real Cause",
      content: (
        <span>
          I think the reason is simple.
          <br />
          <br />
          <b>We learned in the wrong direction.</b>
          <br />
          It’s the system.
          <br />
          <Quoter>
            If you train for tests, you get test skills. <br />
            If you train for talking, you get talking skills.
          </Quoter>
        </span>
      ),
    },
    {
      subtitle: "We learned English as a “subject”",
      content: (
        <span>
          In school, English is treated like a subject with correct answers.
          <br />
          The goal becomes
          <br />
          <br />
          “Make a perfect sentence.”
          <br />
          “Do not make mistakes.”
          <br />
          “Get the score.”
          <br />
          <br />
          But conversation doesn’t work like that.
          <br />
          Conversation is not perfection.
          <br />
          It’s <b>connection 🫶</b>.
        </span>
      ),
    },
    {
      subtitle: "Why fear grows",
      content: (
        <span>
          Fear is not about English.
          <br />
          Fear is about <b>timing</b>.
          <br />
          <br />
          In real conversation, the moment comes fast.
          <br />
          But many Koreans try to build a full sentence in the head first.
          <br />
          <br />
          While the brain is building the sentence,
          <br />
          the moment is gone.
          <br />
          <br />
          That failure repeats.
          <br />
          And the brain learns
          <br />
          <b>“Talking is dangerous.”</b>
        </span>
      ),
    },
    {
      subtitle: "The direction that actually works",
      content: (
        <span>
          The solution is not “study more.”
          <br />
          It’s “change the target.”
          <br />
          <br />
          Replace this goal
          <br />
          From Perfect grammar
          <br />
          <br />
          To Meaning first
          <br />
          Meaning first
          <br />
          Speed second
          <br />
          Accuracy later
          <br />
          <br />
          We can't become fluent by avoiding mistakes.
          <br />
          We become fluent by making <b>small mistakes fast</b> and correcting
          them.
        </span>
      ),
    },
    {
      subtitle: "Minjae Says",
      content: (
        <span>
          Start conversations, not studies. 💪<br></br> and love our
          mistakes.{" "}
        </span>
      ),
    },
  ],
};
