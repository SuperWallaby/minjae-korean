"use client";

import Image from "next/image";

import {
  getKoreanQuizAppStoreLinks,
  KOREAN_QUIZ_PLAY_STORE_PENDING_MESSAGE,
} from "@/lib/koreanQuizAppLinks";
import {
  withVocabQuizUtm,
  type VocabQuizUtmSource,
} from "@/lib/vocabQuizAeoLinks";

import styles from "./app-store-badges.module.css";

type Props = {
  className?: string;
  /** `dark` = white App Store badge for colored hero backgrounds. */
  theme?: "light" | "dark";
  size?: "md" | "lg";
  /** Optional UTM tagging for AEO / growth analytics. */
  utmSource?: VocabQuizUtmSource;
  utmContent?: string;
};

const SIZES = {
  md: { h: 40, appW: 120, playW: 134 },
  lg: { h: 52, appW: 156, playW: 174 },
} as const;

export function AppStoreBadges({
  className,
  theme = "light",
  size = "md",
  utmSource,
  utmContent,
}: Props) {
  const links = getKoreanQuizAppStoreLinks();
  const appStoreUrl = utmSource
    ? withVocabQuizUtm(links.appStoreUrl, {
        source: utmSource,
        content: utmContent,
      })
    : links.appStoreUrl;
  const playStoreUrl = links.playStoreUrl
    ? utmSource
      ? withVocabQuizUtm(links.playStoreUrl, {
          source: utmSource,
          content: utmContent,
        })
      : links.playStoreUrl
    : null;
  const dims = SIZES[size];
  const appStoreSrc =
    theme === "dark"
      ? "/brand/store-badges/app-store-white.svg"
      : "/brand/store-badges/app-store.svg";

  const appStoreBadge = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className={styles.badgeImg}
      src={appStoreSrc}
      alt="Download on the App Store"
      width={dims.appW}
      height={dims.h}
      loading="lazy"
      decoding="async"
    />
  );

  const playStoreBadge = (
    <Image
      className={styles.badgeImg}
      src="/brand/store-badges/google-play.png"
      alt="Get it on Google Play"
      width={dims.playW}
      height={dims.h}
      loading="lazy"
    />
  );

  const onPlayStorePending = () => {
    window.alert(KOREAN_QUIZ_PLAY_STORE_PENDING_MESSAGE);
  };

  return (
    <div
      className={[
        styles.row,
        size === "lg" ? styles.rowLg : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a
        href={appStoreUrl}
        className={`${styles.badgeLink} ${styles.badgeAppStore}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download on the App Store"
      >
        {appStoreBadge}
      </a>

      {playStoreUrl ? (
        <a
          href={playStoreUrl}
          className={`${styles.badgeLink} ${styles.badgePlayStore}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get it on Google Play"
        >
          {playStoreBadge}
        </a>
      ) : (
        <button
          type="button"
          className={`${styles.badgeLink} ${styles.badgePlayStore} ${styles.badgePending}`}
          onClick={onPlayStorePending}
          aria-label="Google Play — Android version coming soon"
        >
          {playStoreBadge}
        </button>
      )}
    </div>
  );
}
