import Link from "next/link";

import { freeKoreanClassPath } from "@/lib/trial/localhostOnly";

/** Pin-page tutor promo on GetPronounce — our offer, not Preply / italki. */
export function MinjaeTrialTutorPanel() {
  const href = freeKoreanClassPath("pronounce");
  return (
    <aside className="global-tutor-panel">
      <div className="global-tutor-preply">
        <div className="global-tutor-preply-copy">
          <p className="global-tutor-kicker">Free trial</p>
          <h2>1:1 Korean Lesson</h2>
          <p>Learn Korean with Minjae over the phone. Textbook included.</p>
          <Link className="global-btn" href={href}>
            Book a free trial
          </Link>
        </div>
        <Link className="global-tutor-ad" href={href} aria-label="Book a free trial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/jjibara-phone-lesson.png?v=5"
            alt="Jjibara on a phone lesson"
            width={300}
            height={300}
            loading="lazy"
            decoding="async"
          />
        </Link>
      </div>
    </aside>
  );
}
