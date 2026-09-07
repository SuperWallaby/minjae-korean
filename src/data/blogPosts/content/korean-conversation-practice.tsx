/* eslint-disable react/no-unescaped-entities */
import { ContentLink } from "@/components/article/ContentLink";
import { ConversationPracticeTable } from "@/components/article/ConversationPracticeTable";
import { Gap } from "@/components/article/Gap";
import { Quoter } from "@/components/article/Quoter";
import type { BlogPost } from "../types";

/**
 * Draft — Track B + evidence links + gpt-5.4 enhance.
 * Markdown: scripts/data/draft-korean-conversation-practice.md
 * Add slug to BLOG_LISTED_SLUGS in listed.ts to publish.
 */
export const post: BlogPost = {
  slug: "korean-conversation-practice",
  title: "How to practice Korean conversation if you're not in Korea",
  description:
    "I've done real practice on r/language_exchange and HelloTalk. Both can work. Finding a serious study partner is the hard part.",
  keywords: [
    "korean speaking practice",
    "korean conversation practice",
    "korean listening practice",
  ],
  level: 3,
  createdAt: "2026-09-02T00:00:00.000Z",
  updatedAt: "2026-09-07T13:52:00.000Z",
  paragraphs: [
    {
      subtitle: "Practice Conversation is easy.",
      content: (
        <>
          People ask how to speak Korean if you're not in Korea.
          <Gap />
          I'm not guessing. I used r/language_exchange. I used HelloTalk for 7
          years. I also tried AI voice tools. Gemini. ChatGPT voice. Some custom
          talking bot. And later, a private tutor.
          <Gap />
          So yes — you can get actual practice on Reddit and HelloTalk. Native
          English speakers especially. Koreans looking for English show up a
          lot. I found partners. We talked.
          <Gap />
          So what was the best way to practice conversation? let's break down
          the options.
        </>
      ),
    },
    {
      subtitle: "Language Exchange is not a Classroom",
      content: (
        <>
          A lot of language exchange is not a classroom. It's people in their
          twenties looking for a friend. Or something that feels like dating
          with a language label on it.
          <Gap />
          HelloTalk especially. Sometimes it felt like a dating app. Photos
          first. Soft chat. Flirting. Study second.
          <Gap />
          I'm not saying every match is like that. I'm saying most of them are
          like that.
          <Gap />
          They play each other. Not always on purpose. One person wants Korean.
          The other wants English and a crush. Or neither wants to correct
          anything hard. Soft English. Soft Korean. Soft nothing.
          <Gap />
          That is not serious language learning. It is social.
          <Gap />
          And a good educational partner — someone who stays in Korean when you
          stumble, who makes you finish the sentence, who comes back next week —
          is really hard to find.
          <Gap />
          You can scroll for hours. But you'll find few teachers in disguise.
        </>
      ),
    },
    {
      subtitle: "Shadowing is not Conversation",
      content: (
        <>
          Speaking alone is fine. Narrate your room. Shadow a YouTube clip.
          Record a voice note.
          <Gap />
          That is rehearsal. Rehearsal is allowed.
          <Gap />
          Studies on shadowing —{" "}
          <ContentLink
            href="https://doi.org/10.1177/1362168815598295"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hamada (2016)
          </ContentLink>
          , for example — say it helps listening and pronunciation. Useful but
          still not a conversation. Because nobody is waiting for your answer.
          <Gap />
          Conversation is different. Someone is waiting. You have to answer in
          time. You get stuck. They ask again. You repair.
          <Gap />
          The study called that "pushed output".
          <Gap />
          'you only notice the sentence you can't finish when a person is
          waiting'.
          <Gap />
          And research on{" "}
          <ContentLink
            href="https://doi.org/10.1111/j.1467-9922.2010.00561.x"
            target="_blank"
            rel="noopener noreferrer"
          >
            corrective feedback
          </ContentLink>{" "}
          (Li, 2010) finds a medium effect that holds over time. Soft chat that
          never interrupts skips that job.
          <Gap />
          Shadowing will not give you that. AI voice often won't either. It
          smiles. It keeps going. It doesn't care if you froze.
        </>
      ),
    },
    {
      subtitle: "If you are shy",
      content: (
        <>
          Shy is not lazy. Some people freeze with strangers. That is normal.
          Research going back to{" "}
          <ContentLink
            href="https://doi.org/10.1111/j.1540-4781.1986.tb05256.x"
            target="_blank"
            rel="noopener noreferrer"
          >
            Horwitz et al. (1986)
          </ContentLink>{" "}
          treats speaking anxiety as something you can measure — not a
          personality insult.
          <Gap />
          Then a paid tutor can help — not magic, just a regular lesson where
          someone is there to make you talk.{" "}
          <ContentLink
            href="https://doi.org/10.1111/j.1540-4781.1998.tb05543.x"
            target="_blank"
            rel="noopener noreferrer"
          >
            MacIntyre and colleagues
          </ContentLink>{" "}
          call this willingness to communicate: readiness to speak with{" "}
          <em>this</em> person, in <em>this</em> moment. A weekly lesson is a
          low-threat slot on purpose.
          <Gap />
          Do not pick the cheapest smile. If they never make you say it again,
          you bought a friend with a lesson title. A tutor who prompts you to
          fix the sentence is doing the useful kind of feedback — not being
          mean.
        </>
      ),
    },
    {
      subtitle: "What I tell people to do",
      content: (
        <>
          Keep it small.
          <Gap />
          <Quoter>
            One live conversation a week. Twenty minutes is enough. The same
            day, if you can.
          </Quoter>
          <Gap />
          Before the call, pick one situation. Not "Korean." How was your
          weekend. What did you eat. Why are you tired. Write five ugly
          sentences.
          <Gap />
          After the call, write down two things you could not say. That is
          tomorrow's study.
          <Gap />
          If you have nobody, that is logistics. Reddit and HelloTalk can still
          work — I did practice there — but hunt like you're hiring. Ask for
          Korean half the time. Ask them to correct you. Drop the flirty ones
          fast.
          <Gap />
          If you do not want to hunt (hunting is time consuming),{" "}
          <ContentLink href="/go/preply">book a Korean tutor</ContentLink>.
        </>
      ),
    },
    {
      subtitle: "Conclusion",
      content: (
        <>
          So far we've broken down the options. Here is the table.
          <Gap />
          <ConversationPracticeTable />
        </>
      ),
    },
    {
      subtitle: "What I would not do",
      content: (
        <>
          I would not wait until my grammar is ready. It will never feel ready.
          <Gap />
          I would not memorize 100 travel phrases and call it conversation.
          <Gap />
          I would not spend a month comparing tutor platforms. One weekly person
          beats a perfect spreadsheet.
          <Gap />
          <strong>
            If you spoke badly to someone this week, that was the practice.
          </strong>
          <Gap />
        </>
      ),
    },
  ],
};
