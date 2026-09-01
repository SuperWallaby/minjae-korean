import Image from "next/image";

import styles from "./home-blog.module.css";

export function AboutMeHomeSection() {
  return (
    <section
      id="approach"
      className={`scroll-mt-24 ${styles.sectionFirst} ${styles.homeIntroSection}`}
    >
      <div className={styles.column}>
        <div className={styles.homeIntro}>
          <div className={styles.photo}>
            <Image
              src="/placeholders/minjae-desk.jpg"
              alt="Minjae"
              fill
              className="object-cover object-[center_18%]"
              sizes="108px"
              priority
            />
          </div>
          <div>
            <p className={styles.sectionLabel}>How to study Korean</p>
            <h1 className={styles.homeName}>Minjae</h1>
            <div className={styles.homeLede}>
              <p>Hello. I&apos;m Minjae, living in Busan.</p>
              <p>
                I write about how to study Korean — methods, habits, and what
                actually helps. I&apos;m studying English too.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
