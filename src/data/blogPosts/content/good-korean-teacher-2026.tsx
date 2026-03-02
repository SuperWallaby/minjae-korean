import Image from "next/image";
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import { BlogPost } from "../types";
import { Describe } from "@/components/article/Describe";

export const post: BlogPost = {
  slug: "good-korean-teacher-2026",
  title: "What is a good Korean teacher in 2026?",
  level: 3,
  createdAt: "2026-02-26",
  paragraphs: [
    {
      subtitle: "A question in the age of AI",
      content: (
        <>
          I’ve been asking myself this question
          <br />
          <strong>What kind of Korean teacher should I become?</strong>{" "}
          <br></br>
          <strong>나는 어떤 한국어 선생님이 되어야 할까?</strong>
          <Gap />
          These days, AI can do so many things.
          <br />
          So I think my role as a Korean teacher will change.
        </>
      ),
    },
    {
      subtitle: "First. Part of your daily routine",
      content: (
        <>
          I want to become part of your daily routine.
          <br />
          You can study alone. But there’s a reason people still go to classes.
          <Gap />
          When you meet a teacher and learn together, you feel something
          different —
          <br />
          a sense of connection, empathy, and confidence that you’re on the
          right path.
          <Gap />
          Those are things that are hard to feel when you study alone. <br></br>
          <strong>
            <Describe>같이 배우는 선생님이 되어줄게요.</Describe>
          </strong>
        </>
      ),
    },
    {
      subtitle: "Second. A human who truly feels with you",
      content: (
        <>
          I can feel with you.
          <br />
          Maybe one day, AI will express emotions even better than humans.
          <Gap />
          But they doesn’t truly feel those emotions.
          <br />
          It only knows how to simulate them.
          <Gap />
          As a human, I want to understand you, relate to you, laugh with, and
          growth together.
          <br />
          <strong>공감 하고 있어요.</strong>
        </>
      ),
    },
    {
      subtitle: "Third. A time you look forward to",
      content: (
        <>
          I want our time to be enjoyable.
          <br />
          When you come to me after a long day,
          <br />
          I don’t want it to feel like “extra studying.”
          <Gap />
          I want it to feel like something you look forward to.
          <Gap />
          I’d love to talk about your daily life too. That would make me happy.
          <br />
          <strong>즐거운 시간을 만들어 줄게요.</strong>
        </>
      ),
    },
    {
      subtitle: "Fourth. Lessons built around conversation",
      content: (
        <>
          My lessons will focus on conversation.
          <br />
          Because nothing helps you improve speaking more than actually speaking
          with another person.
          <Gap />
          But to have meaningful conversations, we need something to talk about.
          <Gap />
          That’s why I write{" "}
          <ContentLink href="/news">daily news articles</ContentLink>, and also
          those <ContentLink href="/drama">Drama</ContentLink> and{" "}
          <ContentLink href="/songs">Song</ContentLink> articles.
          <br />
          We will talk about the topics together.
          <Gap />
          We can share thoughts, opinions, and ideas.
          <br />
          <strong>같이 이야기해요.</strong>
        </>
      ),
    },
    {
      subtitle: "The people who like me will find me",
      content: (
        <>
          Finally. I believe the people who like me will find me.
          <Gap />
          Thank you for being here with me. 😄
          <br />
          I truly support you.
          <Gap />— <strong>Minjae</strong>
          <Image
            src="/meme/offical/thank-you.webp"
            width={208}
            height={208}
            className="w-52 h-auto"
            alt="Thank you meme"
          />
        </>
      ),
    },
  ],
};
