"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MixupsSubscribeForm } from "@/components/pronounce-site/MixupsSubscribeForm";
import { PRONOUNCE_SITE_NAME } from "@/lib/pronounceSite/brand";
import { pronounceChromeCopy } from "@/lib/pronounceSite/chromeCopy";
import { mixupsCopyForLang, mixupsPath } from "@/lib/pronounceMixups";
import { MinjaeTrialTutorCta } from "@/components/trial/MinjaeTrialTutorCta";
import { isFreeKoreanClassPath } from "@/lib/trial/localhostOnly";

export function PronounceSiteFooter() {
  const pathname = usePathname() || "";
  const copy = pronounceChromeCopy(pathname);
  const mixups = mixupsCopyForLang(copy.lang);
  const onMixupsPage = /\/mix-ups\/?$/.test(pathname);
  const hideTutorAd = isFreeKoreanClassPath(pathname);

  return (
    <footer className="global-footer">
      <div className="global-shell">
        {hideTutorAd ? null : (
          <div className="global-footer-tutor">
            <MinjaeTrialTutorCta />
          </div>
        )}

        {onMixupsPage ? null : (
          <div className="global-footer-subscribe">
            <p className="mixups-banner-kicker">{mixups.kicker}</p>
            <h2 className="global-footer-subscribe-title">
              {mixups.bannerTitle}
            </h2>
            <p className="global-footer-subscribe-body">{mixups.bannerBody}</p>
            <MixupsSubscribeForm
              source={`getpronounce_mixups_footer:${copy.lang}`}
              lang={copy.lang}
              compact
            />
            <p className="mixups-banner-more">
              <Link href={mixupsPath(copy.lang)}>{mixups.howItWorks}</Link>
            </p>
          </div>
        )}

        <p className="global-footer-legal">
          {PRONOUNCE_SITE_NAME} — {copy.blurb}
        </p>
        <p className="global-footer-meta">{copy.tagline}</p>
      </div>
    </footer>
  );
}
