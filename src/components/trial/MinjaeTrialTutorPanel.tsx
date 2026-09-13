import Link from "next/link";

import { freeKoreanClassPath } from "@/lib/trial/localhostOnly";

/** Pin-page tutor promo on GetPronounce — our offer, not Preply / italki. */
export function MinjaeTrialTutorPanel() {
  const href = freeKoreanClassPath("pronounce");
  return (
    <aside className="global-tutor-panel">
      <div className="global-tutor-preply">
        <div className="global-tutor-preply-copy">
          <p className="global-tutor-kicker">30-minute free trial</p>
          <h2>Learn Korean 1-on-1 with Minjae</h2>
          <p>Phone lesson, textbook included. Then $5 per session.</p>
          <Link className="global-btn" href={href}>
            Book a free trial
          </Link>
        </div>
        <Link className="global-tutor-ad" href={href} aria-label="Book a free trial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/jjibara-phone-lesson.png?v=4"
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
