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
      <p className="mixups-banner-kicker">Free trial</p>
      <h2 className={headingClassName}>1:1 Korean Lesson</h2>
      <p className={bodyClassName}>
        Learn Korean with Minjae over the phone. Textbook included.
      </p>
      <div className="global-footer-tutor-actions">
        <Link className="global-btn" href={freeKoreanClassPath("pronounce")}>
          Book a free trial
        </Link>
      </div>
    </>
  );
}
