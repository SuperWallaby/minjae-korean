import { globalGoPath } from "@/lib/globalSite/affiliate";

type Props = {
  pinId?: string;
};

export function SoundTutorPair({ pinId }: Props) {
  const q = { lang: "en", pin: pinId };
  const preplyHref = globalGoPath("preply", q);
  const italkiHref = globalGoPath("italki", q);

  return (
    <aside
      className="sound-tutor-pair"
      id="tutors"
      aria-labelledby="sound-tutor-heading"
    >
      <p className="sound-tutor-kicker">Practice out loud</p>
      <h2 id="sound-tutor-heading">Book a 1:1 English tutor</h2>
      <p className="sound-tutor-lede">
        Charts train your ear. A tutor locks in your speaking — try a discounted
        first lesson.
      </p>
      <div className="sound-tutor-grid">
        <a
          className="sound-tutor-card"
          href={preplyHref}
          data-affiliate="preply"
        >
          <span className="sound-tutor-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/affiliate/preply-wordmark.svg"
              alt="Preply"
              width={97}
              height={26}
            />
          </span>
          <span className="sound-tutor-offer">50% off first lesson</span>
          <span className="sound-tutor-cta">Continue on Preply</span>
        </a>
        <a
          className="sound-tutor-card"
          href={italkiHref}
          data-affiliate="italki"
        >
          <span className="sound-tutor-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/affiliate/italki-wordmark.svg"
              alt="italki"
              width={56}
              height={36}
            />
          </span>
          <span className="sound-tutor-offer">$10 off first lesson</span>
          <span className="sound-tutor-cta">Continue on italki</span>
        </a>
      </div>
    </aside>
  );
}
