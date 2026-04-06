import Image from "next/image";
import { Gap } from "@/components/article/Gap";
import { BlogPost } from "../types";
import { Describe } from "@/components/article/Describe";

export const post: BlogPost = {
  slug: "why-korean-translation-loses-meaning",
  title: "Why Does Meaning Disappear When You Translate Korean?",
  level: 3,
  imageThumb: "/brand/og.png",
  imageLarge: "/brand/og.png",
  createdAt: "2026-03-18",
  paragraphs: [
    {
      subtitle: "Translation is not a zip file",
      content: (
        <>
          Many learners hope that if they know the English
          &quot;equivalent&quot; of a Korean sentence, they have understood the
          Korean. Often they have only understood a summary.
          <Gap />
          Meaning lives in grammar, context, relationship, and what the language
          forces you to notice. When you squeeze Korean into English wording,
          part of that information simply has nowhere to go.
          <p className="not-prose mt-8 text-sm font-medium text-muted-foreground">
            The image below is a screenshot from the Netflix video of BTS’s
            comeback stage.
          </p>
          <div className="not-prose my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <figure className="overflow-hidden rounded-xl border border-border bg-muted/10">
              <Image
                src="/mistrans.webp"
                alt="Humorous mistranslation example: pushing Korean into English flattens nuance"
                width={1268}
                height={1262}
                className="h-auto w-full object-contain"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </figure>
            <figure className="overflow-hidden rounded-xl border border-border bg-muted/10">
              <Image
                src="/mistrans2.webp"
                alt="Second example of how literal translation can miss the real meaning"
                width={1268}
                height={1262}
                className="h-auto w-full object-contain"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </figure>
          </div>
          <p className="not-prose mb-2 text-sm font-medium text-muted-foreground">
            BTS 컴백 무대 Netflix 영상 화면이다.
          </p>
        </>
      ),
    },
    {
      subtitle: "Korean stacks meaning in different places",
      content: (
        <>
          English often puts the main point in subject–verb–object order and
          function words like <strong>the</strong> or <strong>did</strong>.
          Korean often uses topic–comment structure and particles such as{" "}
          <Describe>은/는</Describe> and <Describe>이/가</Describe> to steer
          what the listener should focus on.
          <Gap />
          One English sentence can hide several Korean versions that differ only
          in particles or word order—but those versions are <strong>
            not
          </strong>{" "}
          interchangeable in real conversation.
        </>
      ),
    },
    {
      subtitle: "What is 'left out' is still there in Korean",
      content: (
        <>
          Korean frequently drops subjects and objects when they are clear from
          context. A short line like <Describe>갔어?</Describe> might be
          &quot;Did you go?&quot; or &quot;Did they go?&quot; in English,
          depending on who was already in the conversation.
          <Gap />A translation has to <strong>choose</strong> one reading. The
          other possibilities disappear from the page—even though Korean leaves
          them open on purpose.
        </>
      ),
    },
    {
      subtitle: "Politeness is part of the message",
      content: (
        <>
          Endings such as <Describe>–요</Describe>, <Describe>–습니다</Describe>
          , or plain speech are not &quot;extra decoration.&quot; They tell the
          listener how close you are, how formal the setting is, and sometimes
          whether you are upset or joking.
          <Gap />
          English might use tone or extra phrases to do some of this work, but
          the mapping is never one-to-one. If you ignore endings while
          translating, you lose a layer native speakers hear instantly.
        </>
      ),
    },
    {
      subtitle: "Words carry culture, not just dictionary glosses",
      content: (
        <>
          Expressions tied to food, family, school, or work in Korea often
          assume shared experience. A gloss like &quot;fighting&quot; for{" "}
          <Describe>화이팅</Describe> or a literal breakdown of an idiom may
          explain the letters without conveying why people say it <em>here</em>.
          <Gap />
          That is not a bad translation—it is a different job. Explanation needs
          more room than a single replacement word.
        </>
      ),
    },
    {
      subtitle: "What helps more than word-for-word",
      content: (
        <>
          Notice <strong>who is talking to whom</strong>, what was said in the
          previous line, and which particle marks the topic. When you study,
          pair Korean sentences with situations, not only with English strings.
          <Gap />
          If you treat Korean as its own way of pointing and framing—not as
          English wearing a different costume—much less meaning will
          &quot;vanish&quot; between the two languages.
          <Describe>
            번역은 이해의 끝이 아니라, 이해를 위한 출발점에 가깝습니다.
          </Describe>
        </>
      ),
    },
  ],
};
