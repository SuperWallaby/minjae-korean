import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingPage } from "@/components/site/MarketingShell";
import { listBlogPosts } from "@/data/blogPosts";
import {
  getPhotoQuizById,
  listPhotoQuizIds,
  photoQuizResultPath,
} from "@/lib/photoQuizCatalog";
import { SITE_NAME } from "@/lib/siteBrand";
import { siteUrl } from "@/lib/siteUrl";

import { PhotoQuizResultClient } from "./PhotoQuizResultClient";
import styles from "./photo-quiz-result.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return listPhotoQuizIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const quiz = getPhotoQuizById(id);
  const title = quiz
    ? `Korean quiz · ${quiz.sentence || quiz.id}`
    : `Korean quiz · ${SITE_NAME}`;
  return {
    title,
    description: "Picture quiz — fill in the blank. Not indexed.",
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    alternates: {
      canonical: siteUrl(photoQuizResultPath(id)),
    },
  };
}

export default async function PhotoQuizResultPage({ params }: Props) {
  const { id } = await params;
  const quiz = getPhotoQuizById(id);
  if (!quiz) notFound();

  const posts = await listBlogPosts(8);

  return (
    <MarketingPage>
      <div className={styles.page}>
        <PhotoQuizResultClient quiz={quiz} />

        <section className={styles.blogSection} aria-label="Blog notes">
          <div className={styles.blogHead}>
            <h2 className={styles.blogTitle}>Notes from the blog</h2>
            <Link className={styles.blogMore} href="/blog">
              All notes →
            </Link>
          </div>
          <ul className={styles.blogList}>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  className={styles.blogItem}
                  href={`/blog/article/${encodeURIComponent(post.slug)}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.blogThumb}
                    src={post.imageThumb || "/brand/og.png"}
                    alt=""
                    width={72}
                    height={48}
                    loading="lazy"
                  />
                  <div>
                    <p className={styles.blogItemTitle}>{post.title}</p>
                    {post.excerpt ? (
                      <p className={styles.blogItemMeta}>{post.excerpt}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </MarketingPage>
  );
}
