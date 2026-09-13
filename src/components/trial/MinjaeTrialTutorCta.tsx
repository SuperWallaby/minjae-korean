import Link from "next/link";

import { freeKoreanClassPath } from "@/lib/trial/localhostOnly";

/** GetPronounce 1:1 slot — our trial instead of Preply / italki. */
export function MinjaeTrialTutorCta({
  headingClassName = "global-footer-tutor-title",
  bodyClassName = "global-footer-tutor-body",
}: {
  headingClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <>
      <p className="mixups-banner-kicker">1-on-1 Korean</p>
      <h2 className={headingClassName}>Learn Korean 1-on-1 with Minjae</h2>
      <p className={bodyClassName}>
        30-minute free trial over the phone. Textbook included. Then $5 per
        session.
      </p>
      <div className="global-footer-tutor-actions">
        <Link className="global-btn" href={freeKoreanClassPath("pronounce")}>
          Book a free trial
        </Link>
      </div>
    </>
  );
}
