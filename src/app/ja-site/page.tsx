import type { Metadata } from "next";

import { GlobalAmazonTextbookPanel } from "@/components/global-site/GlobalAmazonTextbookPanel";
import { JaPinCard } from "@/components/ja-site/JaPinCard";
import { JaTutorPair } from "@/components/ja-site/JaTutorPair";
import { AMAZON_ASSOCIATE_DISCLOSURE_JA } from "@/lib/affiliateAmazon";
import {
  EIGOCHART_DESCRIPTION,
  EIGOCHART_NAME,
  eigoChartHomeTitle,
  eigoChartOrigin,
} from "@/lib/jaSite/brand";
import {
  jaPinPageImagePath,
  listJaPinsPublic,
  type JaEnPinPage,
} from "@/lib/jaSite/catalog";

const HOME_TITLE = eigoChartHomeTitle();
const HOME_DESC = EIGOCHART_DESCRIPTION;

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESC,
  alternates: { canonical: `${eigoChartOrigin()}/` },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESC,
    url: `${eigoChartOrigin()}/`,
    siteName: EIGOCHART_NAME,
    type: "website",
    locale: "ja_JP",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 60;

const FEATURED_IDS = [
  "mid_idioms__workplace",
  "mid_grammar__used-to",
  "mid_wasei__false-friends",
];

function pickHeroPins(pins: JaEnPinPage[], limit = 3): JaEnPinPage[] {
  const byId = new Map(pins.map((p) => [p.id, p]));
  const out: JaEnPinPage[] = [];
  for (const id of FEATURED_IDS) {
    const pin = byId.get(id);
    if (pin) out.push(pin);
    if (out.length >= limit) return out;
  }
  for (const p of pins) {
    if (out.some((x) => x.id === p.id)) continue;
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

export default async function JaHomePage() {
  const catalogPins = await listJaPinsPublic();
  const pins = catalogPins.map((p) => ({
    id: p.id,
    titleJa: p.titleJa,
    imagePath: p.imagePath,
    wordCount: p.words.length,
  }));
  const hero = pickHeroPins(catalogPins);
  const base = eigoChartOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: EIGOCHART_NAME,
    inLanguage: "ja",
    url: base,
    description: HOME_DESC,
  };

  return (
    <>
      {hero[0] ? (
        <link
          rel="preload"
          as="image"
          href={jaPinPageImagePath(hero[0].imagePath)}
          type="image/webp"
          fetchPriority="high"
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="ja-hero">
        <div className="ja-hero-copy">
          <p className="global-kicker">英語 · 中級〜準1級</p>
          <h1>
            学校英語の、
            <br />
            その先へ。
          </h1>
          <p className="ja-hero-lede">
            チャートで意味を見て、アメリカ・イギリス・オーストラリア英語の発音を聞き比べ。
          </p>
          <ul className="ja-hero-chips">
            <li>アメリカ · イギリス · オーストラリア</li>
            <li>チャートで学ぶ</li>
            <li>TOEIC 600+</li>
          </ul>
          <div className="global-cta-row">
            <a className="global-btn global-btn-stamp" href="#charts">
              チャートを見る
            </a>
            <a className="global-btn global-btn-secondary" href="#tutors">
              1対1の講師
            </a>
          </div>
        </div>
        {hero.length > 0 ? (
          <div className="ja-hero-desk" aria-label="注目のチャート">
            {hero.map((pin, i) => (
              <a
                key={pin.id}
                className={`ja-hero-plate ja-hero-plate-${i}`}
                href={`/pin/${encodeURIComponent(pin.id)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={jaPinPageImagePath(pin.imagePath)}
                  alt={`${pin.titleJa} 英単語チャート`}
                  width={i === 0 ? 360 : 240}
                  height={i === 0 ? 540 : 360}
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
                <span>{pin.titleJa}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="ja-hero-desk ja-hero-desk-empty">
            <p>チャートを準備しています</p>
          </div>
        )}
      </section>

      <JaTutorPair />

      <GlobalAmazonTextbookPanel
        lang="en-ja"
        langName="英語"
        placement="ja_home_textbooks"
        kicker="次に学ぶ"
        heading="おすすめの英語教材"
        lede="スワイプして教材を見る（Amazon）"
        disclosure={AMAZON_ASSOCIATE_DISCLOSURE_JA}
      />

      <div className="global-section-head" id="charts">
        <h2 className="global-section-title">英単語チャート</h2>
        <p>
          {pins.length > 0
            ? `${pins.length}枚 · 単語ごとに発音音声`
            : "最初のチャートを準備中です"}
        </p>
      </div>

      {pins.length > 0 ? (
        <div className="global-pin-grid">
          {pins.map((pin, i) => (
            <JaPinCard key={pin.id} pin={pin} priority={i < 2} />
          ))}
        </div>
      ) : null}
    </>
  );
}
