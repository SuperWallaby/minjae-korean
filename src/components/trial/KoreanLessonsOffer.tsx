"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import {
  KAKAO_OPEN_CHAT,
  LESSON_COPY,
  LESSON_PACKS,
  formatPackPrice,
  type LessonSurface,
} from "@/data/lessonOffers";
import { freeKoreanClassPath } from "@/lib/trial/localhostOnly";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import styles from "./FreeKoreanClassOffer.module.css";

const KAJA_PRICES = "https://kajakorean.com/korean-lessons#prices";

export function KoreanLessonsOffer({ surface }: { surface: LessonSurface }) {
  const trialHref = freeKoreanClassPath(surface);

  return (
    <article className={styles.page}>
      <Link className={styles.backLink} href={trialHref}>
        ← Back to free trial
      </Link>
      <p className={styles.kicker}>1:1 Korean with Minjae</p>
      <div className={styles.intro}>
        <div className={styles.profile}>
          <Image
            src="/placeholders/minjae-desk.jpg"
            alt="Minjae"
            fill
            className={styles.profileImg}
            sizes="108px"
            priority
          />
        </div>
        <h1 className={styles.title} id="prices">
          Lesson prices
        </h1>
      </div>
      <p className={styles.body}>
        $8 per 30-minute session. Buy more at once and each lesson costs less.
        One credit books one session.
      </p>

      <div className={styles.packs}>
        {LESSON_PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`${styles.pack} ${pack.featured ? styles.packFeatured : ""}`}
          >
            <div className={styles.packTop}>
              <p className={styles.packLabel}>{pack.label}</p>
              <p className={styles.packPrice}>{formatPackPrice(pack)}</p>
            </div>
            <p className={styles.packMeta}>
              {pack.perSession} each
              {pack.save ? (
                <>
                  {" · "}
                  <span className={styles.packSave}>{pack.save}</span>
                </>
              ) : null}
              {pack.note ? ` · ${pack.note}` : null}
            </p>
            <div className={styles.packBuy}>
              {surface === "pronounce" ? (
                <a className={styles.submit} href={KAJA_PRICES}>
                  Buy {pack.credits} credit{pack.credits === 1 ? "" : "s"}
                </a>
              ) : (
                <Suspense
                  fallback={
                    <button className={styles.submit} type="button" disabled>
                      Buy credits
                    </button>
                  }
                >
                  <CheckoutButton
                    product={pack.id}
                    className={styles.submit}
                    size="lg"
                  >
                    Buy {`${pack.credits} credit${pack.credits === 1 ? "" : "s"}`}
                  </CheckoutButton>
                </Suspense>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className={styles.note}>
        Sign in, pay with Stripe, then book on your account. Credits are spent
        one per 30-minute lesson.
      </p>
      <p className={styles.body}>
        {LESSON_COPY.trialLine}{" "}
        <Link className={styles.priceLink} href={trialHref}>
          Book the free trial
        </Link>
        .
      </p>
      <a
        className={styles.kakao}
        href={KAKAO_OPEN_CHAT}
        target="_blank"
        rel="noopener noreferrer"
      >
        {LESSON_COPY.kakaoCta}
      </a>
    </article>
  );
}
