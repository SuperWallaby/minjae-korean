import { globalGoPath } from "@/lib/globalSite/affiliate";

type Props = {
  pinId?: string;
};

/** Stable A/B: one partner per pin (never both). */
function pickPartner(pinId?: string): "preply" | "italki" {
  const seed = String(pinId || "ja-home");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return (h & 1) === 0 ? "preply" : "italki";
}

export function JaTutorPair({ pinId }: Props) {
  const partner = pickPartner(pinId);
  const href = globalGoPath(partner, { lang: "en-ja", pin: pinId });
  const isPreply = partner === "preply";

  return (
    <aside
      className="ja-tutor-pair"
      id="tutors"
      aria-labelledby="ja-tutor-heading"
    >
      <p className="ja-tutor-pair-kicker">マンツーマン</p>
      <h2 id="ja-tutor-heading">1対1の英語講師、必要ですか？</h2>
      <p className="ja-tutor-pair-lede">
        次は会話で。1対1の英語講師と練習できます。
      </p>
      <div className="ja-tutor-pair-grid ja-tutor-pair-grid-single">
        <a
          className="ja-tutor-banner"
          href={href}
          data-affiliate={partner}
          data-ga-event="affiliate_cta"
          data-placement={isPreply ? "ja_tutor_banner" : "ja_tutor_italki"}
        >
          <picture>
            <source
              type="image/webp"
              srcSet={
                isPreply
                  ? "/brand/affiliate/preply-300x250.webp"
                  : "/brand/affiliate/italki-square.webp"
              }
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                isPreply
                  ? "/brand/affiliate/preply-300x250.jpg"
                  : "/brand/affiliate/italki-square.jpg"
              }
              alt={
                isPreply
                  ? "Preply — 英語のライブ講師と学ぶ。初回レッスン50% OFF"
                  : "italki — 英語のライブ講師と学ぶ。初回 $10 OFF"
              }
              width={isPreply ? 300 : 1024}
              height={isPreply ? 250 : 924}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <span className="ja-tutor-banner-caption">
            {isPreply ? "Preply · 初回 50% OFF" : "italki · 初回 $10 OFF"}
          </span>
        </a>
      </div>
    </aside>
  );
}
