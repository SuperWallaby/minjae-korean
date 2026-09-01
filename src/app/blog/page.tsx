import type { Metadata } from "next";

import { ArticleFeed } from "@/components/article/ArticleFeed";
import homeStyles from "@/components/site/home-blog.module.css";
import { listBlogPosts } from "@/data/blogPosts";
import { SITE_META_KEYWORD, SITE_NAME } from "@/lib/siteBrand";
import { SITE_ORIGIN } from "@/lib/siteUrl";

export const runtime = "nodejs";

const SITE_URL = SITE_ORIGIN;
const BLOG_TITLE = `Notes on how to study Korean | ${SITE_NAME}`;
const BLOG_DESCRIPTION =
  "Notes on how to study Korean — methods, practice habits, and what actually works. Written by Minjae.";

export const metadata: Metadata = {
  title: { absolute: BLOG_TITLE },
  description: BLOG_DESCRIPTION,
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/brand/og.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_META_KEYWORD}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    images: [`${SITE_URL}/brand/og.png`],
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default async function BlogPage() {
  const feedItems = await listBlogPosts(100);

  return (
    <section className={`${homeStyles.section} ${homeStyles.sectionFirst}`}>
      <div className={homeStyles.column}>
        <div className={homeStyles.blogHead}>
          <div>
            <p className={homeStyles.sectionLabel}>Notes</p>
            <h1 className={homeStyles.sectionTitle}>How to study Korean</h1>
            <p className={homeStyles.sectionBody}>
              Methods, habits, and practice notes — not a course catalog.
            </p>
          </div>
        </div>

        {feedItems.length === 0 ? (
          <p className="mt-8 text-sm text-[#6b6b6b]">No posts yet.</p>
        ) : (
          <div>
            <ArticleFeed
              articles={feedItems}
              basePath="/blog/article"
              showMajor={false}
              showCovers={false}
            />
          </div>
        )}
      </div>
    </section>
  );
}
