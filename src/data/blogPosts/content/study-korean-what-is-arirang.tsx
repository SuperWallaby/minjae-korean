import { Gap } from "@/components/article/Gap";
import { BlogPost } from "../types";
import { Describe } from "@/components/article/Describe";

export const post: BlogPost = {
  slug: "study-korean-what-is-arirang",
  title: "What Is Arirang?",
  level: 2,
  imageThumb: "/brand/og.png",
  imageLarge: "/brand/og.png",
  createdAt: "2026-03-17",
  paragraphs: [
    {
      youtube: "https://youtu.be/H_2yhCjGQuQ?t=14",
      subtitle: "A famous Korean folk song",
      content: (
        <>
          Arirang 아리랑 is one of the most famous traditional Korean folk songs
          and an important symbol of Korean culture.
          <Gap />
          For many Koreans, it is more than just a song. It represents Korean
          emotions, history, and identity.
        </>
      ),
    },
    {
      subtitle: "Not just one song",
      content: (
        <>
          One interesting thing about Arirang is that it is not just one single
          song.
          <Gap />
          There are many different versions depending on the region, such as
          Jeongseon Arirang, Miryang Arirang, and Jindo Arirang.
          <Gap />
          The melody and lyrics can vary, but they all share a similar emotional
          feeling.
        </>
      ),
    },
    {
      subtitle: "A song full of emotion",
      content: (
        <>
          Arirang is often associated with sadness, longing, separation, and
          hope.
          <Gap />
          Its melody is simple and memorable, but it carries deep emotion.
          <Gap />
          Because of this, it has been loved for a long time as a song that
          comforts people.
        </>
      ),
    },
    {
      subtitle: "Arirang, Arirang, Arariyo",
      content: (
        <>
          The most well-known part is the refrain, 아리랑 아리랑 아리랑아리랑{" "}
          <strong>“Arirang, Arirang, Arariyo.”</strong>
          <Gap />
          Even though its exact meaning is not always clear, it has become a
          powerful expression of Korean feeling and rhythm.
        </>
      ),
    },
    {
      subtitle: "A song for Koreans abroad",
      content: (
        <>
          Arirang has also been an important song for Koreans living abroad.
          <Gap />
          For them, it often reminds them of home and their cultural roots.
        </>
      ),
    },
    {
      subtitle: "The heart of Korea",
      content: (
        <>
          In the end, Arirang is not just an old folk song.
          <Gap />
          It is a song that reflects the heart of Korea.
          <Describe>한국인 이라면 모두가 아리랑을 알고 있어요.</Describe>
        </>
      ),
    },
  ],
};
