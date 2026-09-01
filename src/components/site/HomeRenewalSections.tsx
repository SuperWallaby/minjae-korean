import Link from "next/link";

import { ArticleFeed } from "@/components/article/ArticleFeed";
import type { ArticleFeedItem } from "@/components/article/ArticleFeed";

import styles from "./home-blog.module.css";

type Props = {
  blog: ArticleFeedItem[];
};

/** Compact recent notes — home is identity first, /blog is the archive. */
export function HomeRenewalSections({ blog }: Props) {
  return (
    <section id="notes" className={styles.sectionTight}>
      <div className={styles.column}>
        <div className={styles.notesHead}>
          <h2 className={styles.notesTitle}>Latest notes</h2>
          <Link href="/blog" className={styles.textLink}>
            See all
          </Link>
        </div>

        {blog.length > 0 ? (
          <ArticleFeed
            articles={blog}
            basePath="/blog/article"
            showMajor={false}
            showCovers={false}
            compact
          />
        ) : null}
      </div>
    </section>
  );
}
