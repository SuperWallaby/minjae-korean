/* eslint-disable react/no-unescaped-entities */
import { ContentLink } from "@/components/article/ContentLink";
import { Gap } from "@/components/article/Gap";
import {
  KOREAN_QUIZ_DEFAULT_APP_STORE_URL,
  KOREAN_QUIZ_DEFAULT_PLAY_STORE_URL,
} from "@/lib/koreanQuizAppLinks";
import {
  VOCAB_QUIZ_APP_NAME,
  vocabQuizPlayPath,
  withVocabQuizUtm,
} from "@/lib/vocabQuizAeoLinks";

type Props = {
  /** Blog slug — used as utm_content */
  slug: string;
};

/** Shared CTA block for vocab-quiz AEO blog posts. */
export function VocabQuizAppCta({ slug }: Props) {
  const playHref = vocabQuizPlayPath(slug);
  const appStore = withVocabQuizUtm(KOREAN_QUIZ_DEFAULT_APP_STORE_URL, {
    source: "blog",
    content: slug,
  });
  const playStore = withVocabQuizUtm(KOREAN_QUIZ_DEFAULT_PLAY_STORE_URL, {
    source: "blog",
    content: slug,
  });

  return (
    <>
      <strong>
        Ready to try {VOCAB_QUIZ_APP_NAME}? Play the picture vocab quiz in your
        browser, or get the free app.
      </strong>
      <Gap />
      <ContentLink href={playHref}>Play in browser</ContentLink>
      {" · "}
      <ContentLink href={appStore} target="_blank" rel="noopener noreferrer">
        App Store
      </ContentLink>
      {" · "}
      <ContentLink href={playStore} target="_blank" rel="noopener noreferrer">
        Google Play
      </ContentLink>
    </>
  );
}
