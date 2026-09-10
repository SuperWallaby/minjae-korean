"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MixupsSubscribeForm } from "@/components/pronounce-site/MixupsSubscribeForm";
import { PRONOUNCE_SITE_NAME } from "@/lib/pronounceSite/brand";
import { pronounceChromeCopy } from "@/lib/pronounceSite/chromeCopy";
import { mixupsCopyForLang, mixupsPath } from "@/lib/pronounceMixups";
import { globalGoPath } from "@/lib/globalSite/affiliate";
import { trackAffiliateClick } from "@/lib/ga";

export function PronounceSiteFooter() {
  const pathname = usePathname() || "";
  const copy = pronounceChromeCopy(pathname);
  const mixups = mixupsCopyForLang(copy.lang);
  const onMixupsPage = /\/mix-ups\/?$/.test(pathname);
  const preplyHref = globalGoPath("preply", { lang: copy.lang });
  const italkiHref = globalGoPath("italki", { lang: copy.lang });

  return (
    <footer className="global-footer">
      <div className="global-shell">
        <div className="global-footer-tutor">
          <p className="mixups-banner-kicker">Live practice</p>
          <h2 className="global-footer-tutor-title">
            Practice with a {mixups.langName} tutor
          </h2>
          <p className="global-footer-tutor-body">
            After you listen here, use a short lesson to say it back with a real
            person.
          </p>
          <div className="global-footer-tutor-actions">
            <a
              className="global-btn"
              href={preplyHref}
              onClick={() =>
                trackAffiliateClick({
                  partner: "preply",
                  placement: "pronounce_footer_tutor",
                  lang: copy.lang,
                })
              }
            >
              Preply · 50% off first lesson
            </a>
            <a
              className="global-btn global-btn-secondary"
              href={italkiHref}
              onClick={() =>
                trackAffiliateClick({
                  partner: "italki",
                  placement: "pronounce_footer_tutor",
                  lang: copy.lang,
                })
              }
            >
              italki · $10 off
            </a>
          </div>
        </div>

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
