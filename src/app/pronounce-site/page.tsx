import type { Metadata } from "next";
import Link from "next/link";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import {
  featuredHomePins,
  getGlobalCatalog,
  globalLangMeta,
  globalSiteBase,
  listGlobalPins,
} from "@/lib/globalSite/catalog";
import { atlasLangPath, PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";
import { pronounceSiteOrigin } from "@/lib/pronounceSite/brand";

const HOME_TITLE = "GetPronounce · Mandarin pronunciation for English speakers";
const HOME_DESC =
  "Mandarin charts with pinyin and audio for English speakers.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESC,
  alternates: { canonical: `${pronounceSiteOrigin()}/` },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESC,
    url: `${pronounceSiteOrigin()}/`,
    siteName: "GetPronounce",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

export default function PronounceHomePage() {
  const catalog = getGlobalCatalog();
  const zhPins = listGlobalPins({ lang: "zh" });
  const featured = featuredHomePins(1).filter((p) => p.lang === "zh");
  const pins = zhPins.length ? zhPins : featured;
  const base = globalSiteBase();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GetPronounce",
    url: base,
    description: HOME_DESC,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="global-hero global-hero-text-only">
        <p className="global-kicker">中文 · Mandarin pronunciation</p>
        <h1>Hears the native sounds</h1>
        <p className="global-hero-lede">
          Mainland Mandarin and pinyin on every chart. CN voices first; TW/HK optional.
        </p>
        <div className="global-cta-row">
          <Link className="global-btn global-btn-secondary" href="/pinyin/">
            Pinyin hub
          </Link>
          <Link className="global-btn global-btn-secondary" href="/words/ni-hao/">
            Example: 你好
          </Link>
          <a className="global-btn global-btn-stamp" href="/go/preply?lang=zh">
            Book a tutor · 50% off
          </a>
        </div>
      </section>

      <div className="global-lang-index">
        <Link className="global-lang-chip" href="/" data-lang="zh">
          <strong lang="zh">中文</strong>
          <span>Chinese · {zhPins.length} charts</span>
        </Link>
        {PRONOUNCE_PREFIX_LANGS.map((code) => {
          const lang = catalog.languages.find((l) => l.code === code);
          if (!lang) return null;
          const count = listGlobalPins({ lang: code }).length;
          const meta = globalLangMeta(code);
          return (
            <Link
              key={code}
              className="global-lang-chip"
              href={atlasLangPath(code)}
              data-lang={code}
            >
              <strong lang={code} dir={meta.dir}>
                {meta.native}
              </strong>
              <span>
                {lang.name} · {count} charts
              </span>
            </Link>
          );
        })}
      </div>

      {pins.length > 0 ? (
        <>
          <div className="global-section-head" id="charts">
            <h2 className="global-section-title">Chinese charts</h2>
            <p>Vocabulary plates with audio</p>
          </div>
          <div className="global-pin-grid">
            {pins.map((pin) => (
              <GlobalPinCard key={pin.id} pin={pin} />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
