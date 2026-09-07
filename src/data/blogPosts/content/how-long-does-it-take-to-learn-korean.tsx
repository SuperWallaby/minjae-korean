/* eslint-disable react/no-unescaped-entities */
import { ContentLink } from "@/components/article/ContentLink";
import { Describe } from "@/components/article/Describe";
import { Gap } from "@/components/article/Gap";
import { LearnerPaceTable } from "@/components/article/LearnerPaceTable";
import { Quoter } from "@/components/article/Quoter";
import type { BlogPost } from "../types";

/** Published — listed in BLOG_LISTED_SLUGS. */
export const post: BlogPost = {
  slug: "how-long-does-it-take-to-learn-korean",
  title:
    "How long does it take to learn Korean? I've been watching learners over a decade.",
  description:
    "I've been meeting so many Korean learners. I've been watching them over a decade. Here is the real timeline.",
  keywords: [
    "how long does it take to learn korean",
    "how long to learn korean",
    "korean study plan",
  ],
  faq: [
    {
      question: "How long does it take to learn Korean?",
      answer:
        "It depends on the kind of learner. In Minjae's experience, the fastest outliers can talk in daily life in about 3 months to a year. Ordinary good learners (about an hour a day) usually take around 3 years. Laid-back learners often take 10 years or more.",
    },
    {
      question: "Can I learn Korean in 3 months?",
      answer:
        "Yes, but that is outlier speed — about 3% of learners in Minjae's experience. The fastest case studied hard in a local academy in Canada, with lots of speaking homework and a Korean partner every day.",
    },
    {
      question: "What do ordinary good Korean learners do?",
      answer:
        "Online courses (like Sejong), YouTube courses, sometimes a private tutor, SNS creators they like, and Korean partners online. Books help starters, but alone they don't teach speaking.",
    },
    {
      question: "Is Duolingo enough to learn Korean?",
      answer:
        "Duolingo is a great way to start, but not the best way to learn if you never use Korean with a real person. Laid-back learners often stay on the app and don't practice with someone.",
    },
    {
      question: "Should I get a Korean tutor?",
      answer:
        "If you can find a nice tutor, great — it costs money. For serious learners, Minjae recommends italki because tutors there tend to be more qualified than on many other platforms.",
    },
  ],
  level: 3,
  createdAt: "2026-09-02T00:00:00.000Z",
  updatedAt: "2026-09-02T07:00:00.000Z",
  paragraphs: [
    {
      subtitle: "How much Korean do you want to learn?",
      content: (
        <>
          Most Korean learners' goal is to learn enough to have a daily
          conversation.
          <Gap />
          So how long does it take?
          <Gap />I only talk about learners from countries with alphabet-based
          languages. (Chinese and Japanese learn faster).
        </>
      ),
    },

    {
      subtitle: "Outlier vs Ordinary good vs Laid-back",
      // IMAGE SLOT 1 — upload via /blog/article/.../edit (dev)
      image: undefined,
      content: (
        <>
          I saw one student who studied for 3 months and was able to talk with
          me in daily life. This was the fastest I've seen. So this person was
          an outlier. Outliers can often reach that level in one to two years.
          <Gap />
          Ordinary good learners usually take 3 years to have daily
          conversations in Korean. But here what I am calling ordinary learners
          are actually very good learners. They study for about an hour a day.
          <Gap />
          Laid-back learners take 10 years or more to have everyday
          conversations with me. They don't take language learning seriously.
          <Gap />
          <LearnerPaceTable />
          <Gap />
          <Quoter>
            That 3% / 20% / 77% split is just from my experience — not a
            scientific test.
          </Quoter>
        </>
      ),
    },
    {
      subtitle: "How to be an Outlier",
      content: (
        <>
          The fastest learner I saw studied at a great local academy in Canada.
          What I've noticed is that she was forced to do many speaking tasks
          every day. not only in class but also as homework. And she was looking
          for a Korean partner every day.
          <Gap />
          Did she have plenty of time to learn? No. She was busy with her pilot
          exam course too. But I noticed that she texted me in Korean whenever
          she had a break.
          <Gap />
          Find a really good academy — maybe a bit expensive, but it will be
          worth it. Finding a texting partner is nice. But you need to send them
          messages in Korean. Not english.
          <Gap />
          Another outlier was studying from YouTube and Twitch with her favorite
          channels. She was very passionate about studying Korean. Sounds fun?
          Yes, but she was weak at words. She could speak really naturally, but
          didn't know some words like <Describe>박물관</Describe> which
          YouTubers rarely mention.
          <Gap />I think YouTube and Twitch are great. But you need to find a
          good channel.
        </>
      ),
    },
    {
      subtitle: "What did ordinary but good learners do?",
      // IMAGE SLOT 2 — upload via /blog/article/.../edit (dev)
      image: undefined,
      content: (
        <>
          Actually I don't think people can do like outliers — they are actually
          genius. So the realistic way to learn Korean fast is the ordinary way
          <Gap />
          They normally said they studied with online courses. (But not all of
          them.) There are some free online courses such as
          <ContentLink
            href="https://www.sejonghakdang.org/home/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sejong Hakdang
          </ContentLink>
          , also many YouTube channels that provide online courses.
          <Gap />
          Sometimes they have private tutors too. If you can find a nice tutor,
          great, but it will cost money. If you're a serious learner I would
          recommend <ContentLink href="/go/italki">italki</ContentLink> because
          they tend to be more qualified compared with other tutor platforms.
          <Gap />
          Also ordinary learners studied with their favorite creators, on SNS.
          <Gap />
          Good speakers actively find Korean partners online to practice
          speaking and improve their skills.
          <Gap />
          Books? Ummm books are great for starters but they don't teach you how
          to speak. I saw many beginners asked me about books. But people
          usually get stuck in intermediate level and can't speak. So i don't
          cover about books in this article.
        </>
      ),
    },
    {
      subtitle: "What Did Laid-Back Learners Do?",
      content: (
        <>
          Most learners stay here. They're just enjoying K-drama. I'm not saying
          it's a bad method. But they really enjoy it. Not studying it. Didn't
          try to check the grammar the actors use. Didn't pause, didn't repeat.
          Just enjoyed it.
          <Gap />
          After 10 years they still can't speak Korean well. They're only good
          at speaking some simple sentences.
          <Gap />
          They were actually good students at the beginning, when they studied
          Hangul and basic grammar, they put in a lot of effort. But they didn't
          push hard enough after that or couldn't find a nice way to study.
          <Gap />
          Those who didn't push themselves enough tend to speak English to me.
          They love to be friends with Koreans. But they don't question much
          about Korean. They're not forcing themselves to chat with me in Korean
          — they use English.
          <Gap />
          They use apps like Duolingo, but compared to good learners they don't
          try to use what they learned with someone. Another reason they stuck
          in this level is that they are not constant. Ten years was long enough
          but they in and out often.
        </>
      ),
    },

    {
      subtitle: "Balance of joy and study is the key way I think",
      content: (
        <>
          All the fast learners are very fascinated to study Korean. (obviously)
          <Gap />
          But they also enjoy the process.
          <Gap />
          They don't force themselves to study. They just really like to study
          Korean.
          <Gap />
          So how to maintain the curiosity and enjoy the process? I think I
          should write another article about this.{" "}
          <strong>
            But for now I'd say find a real person to use what you learned is
            the best.
          </strong>
          <Gap />
          But if you're too begginer don't push yourself to speak with a real
          person too fast.
          <Gap />
          This is all from my experience for over 10 years. You may have had a
          different experience. If you don't agree with me, you're absolutely
          right.
        </>
      ),
    },
  ],
};
