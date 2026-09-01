import Link from "next/link";

import { BookHeroClickable } from "@/components/site/BookHeroClickable";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

import styles from "./home-blog.module.css";

export function BookHomeSection() {
  return (
    <RevealOnScroll
      as="section"
      className={`${styles.section} ${styles.bookBand}`}
    >
      <div className={styles.bookColumn}>
        <div className={styles.bookGrid}>
          <div className={styles.bookCover}>
            <BookHeroClickable />
          </div>
          <div>
            <p className={styles.sectionLabel}>Book</p>
            <h2 className={styles.sectionTitle}>Korean, Beyond Translation</h2>
            <p className={styles.sectionBody}>
              For studying Korean beyond dictionary glosses — 100 words that
              teach tone, nuance, and how the language actually lands.
            </p>
            <div className={styles.linkRow}>
              <Link
                href="/book/korean-beyond-translation"
                className={styles.textLink}
              >
                Read sample content
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
