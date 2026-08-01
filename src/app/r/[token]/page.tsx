import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingPage } from "@/components/site/MarketingShell";
import {
  decodeShareResultToken,
  shareResultSupportiveLine,
} from "@/lib/koreanQuiz/shareResultToken";
import { getKoreanQuizAppStoreLinks } from "@/lib/koreanQuizAppLinks";
import { SITE_NAME } from "@/lib/siteBrand";
import { siteUrl } from "@/lib/siteUrl";
import { withVocabQuizUtm } from "@/lib/vocabQuizAeoLinks";
import quizStyles from "@/components/vocab-quiz/vocab-quiz.module.css";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const payload = decodeShareResultToken(token);
  if (!payload) {
    return { title: `Shared result · ${SITE_NAME}` };
  }
  const title = `I got ${payload.c}/${payload.t} on Kaja Korean`;
  const description = `${shareResultSupportiveLine(payload.c, payload.t)}. Try a 7-question Korean quiz.`;
  const url = siteUrl(`/r/${token}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharedResultPage({ params }: Props) {
  const { token } = await params;
  const payload = decodeShareResultToken(token);
  if (!payload) notFound();

  const line = shareResultSupportiveLine(payload.c, payload.t);
  const perfect = payload.c >= payload.t;
  const moreHref = withVocabQuizUtm("/vocab-quiz", {
    source: "share",
    content: `result:${payload.c}-${payload.t}`,
  });
  const stores = getKoreanQuizAppStoreLinks();

  return (
    <MarketingPage>
      <div className={quizStyles.sharePageWrap}>
        <div className={quizStyles.resultShareCard}>
          <p className={quizStyles.shareDoneEyebrow}>Set complete</p>
          <p
            className={[
              quizStyles.resultShareScore,
              perfect ? quizStyles.resultShareScorePerfect : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {payload.c}/{payload.t}
          </p>
          <h1 className={quizStyles.shareDoneTitle}>{line}</h1>
          {payload.d != null && payload.d > 0 ? (
            <p className={quizStyles.shareDoneBody}>Day streak · {payload.d}</p>
          ) : (
            <p className={quizStyles.shareDoneBody}>
              A friend finished a 7-question Korean set on {SITE_NAME}.
            </p>
          )}
          <div className={quizStyles.shareDoneActions}>
            <Link className={quizStyles.sharePrimaryCta} href={moreHref}>
              Try a quiz
            </Link>
            <a
              className={quizStyles.shareSecondaryCta}
              href={stores.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get the app
            </a>
          </div>
        </div>
      </div>
    </MarketingPage>
  );
}
