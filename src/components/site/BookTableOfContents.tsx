import {
  BOOK_SELECTION_CRITERIA,
  BOOK_SELECTION_CRITERIA_INTRO,
  BOOK_TOC_PARTS,
  BOOK_TOC_SUBTITLE,
  wordNumberForPart,
} from "@/data/bookTableOfContents";
import styles from "@/components/site/home-blog.module.css";
import { cn } from "@/lib/utils";

export function BookTableOfContents({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <p className={styles.bookSectionLabel}>Table of contents</p>
      <h2 className={styles.bookSectionTitle}>Korean, Beyond Translation</h2>
      <p className={styles.bookSectionBody}>{BOOK_TOC_SUBTITLE}</p>

      <div className="mt-8">
        {BOOK_TOC_PARTS.map((part, partIndex) => (
          <div key={part.id} className={styles.bookTocPart}>
            <h3 className={styles.bookTocPartTitle}>{part.title}</h3>
            <p className={styles.bookTocPartIntro}>{part.intro}</p>
            <ul className={styles.bookTocWords}>
              {part.words.map((word, wordIndex) => (
                <li key={`${part.id}-${wordIndex}`}>
                  <span>
                    {wordNumberForPart(partIndex, wordIndex)}.
                  </span>{" "}
                  {word}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.bookCriteria}>
        <p className={styles.bookReviewName}>{BOOK_SELECTION_CRITERIA_INTRO}</p>
        <p className={styles.bookSectionBody}>
          How each entry earned a place in the 100:
        </p>
        <ol>
          {BOOK_SELECTION_CRITERIA.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
