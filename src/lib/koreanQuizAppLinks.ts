const PLAY_STORE_PACKAGE = "com.neoproject.korean_quiz_app";

export const KOREAN_QUIZ_DEFAULT_APP_STORE_URL =
  "https://apps.apple.com/app/6784340207";

export const KOREAN_QUIZ_DEFAULT_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.neoproject.korean_quiz_app";

export const KOREAN_QUIZ_PLAY_STORE_PENDING_MESSAGE =
  "The Android version is coming soon.";

export type KoreanQuizAppStoreLinks = {
  appStoreUrl: string;
  playStoreUrl: string | null;
};

/** Mobile app store URLs. Env values can override the defaults. */
export function getKoreanQuizAppStoreLinks(): KoreanQuizAppStoreLinks {
  const appStoreUrl =
    process.env.NEXT_PUBLIC_KOREAN_QUIZ_APP_STORE_URL?.trim() ||
    KOREAN_QUIZ_DEFAULT_APP_STORE_URL;
  const playStoreUrl =
    process.env.NEXT_PUBLIC_KOREAN_QUIZ_PLAY_STORE_URL?.trim() ||
    KOREAN_QUIZ_DEFAULT_PLAY_STORE_URL;

  return { appStoreUrl, playStoreUrl };
}

/** @deprecated package id for env override docs */
export const KOREAN_QUIZ_PLAY_STORE_PACKAGE = PLAY_STORE_PACKAGE;
