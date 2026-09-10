import type { Metadata } from "next";
import Link from "next/link";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import { GlobalHubPager } from "@/components/global-site/GlobalHubPager";
import { GlobalAmazonTextbookPanel } from "@/components/global-site/GlobalAmazonTextbookPanel";
import {
  featuredHomePins,
  getGlobalCatalog,
  globalSiteBase,
  listGlobalListings,
  listingCardMeta,
  paginateGlobalHub,
} from "@/lib/globalSite/catalog";
import { globalLangMeta } from "@/lib/globalSite/langMeta";
import { atlasLangPath, PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";
import { pronounceSiteOrigin } from "@/lib/pronounceSite/brand";
import { AMAZON_ASSOCIATE_DISCLOSURE_PRONOUNCE } from "@/lib/affiliateAmazon";

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

export default async function PronounceHomePage() {
  const catalog = await getGlobalCatalog();
  const listings = await listGlobalListings();
  const zhAll = listings.filter((p) => p.lang === "zh");
  const zhPins = zhAll.length
    ? zhAll
    : (await featuredHomePins(1)).filter((p) => p.lang === "zh");
  const paged = paginateGlobalHub(zhPins, 1);
  const base = globalSiteBase();
  const countByLang = new Map<string, number>();
  for (const row of listings) {
    const lang = row.lang.toLowerCase();
    countByLang.set(lang, (countByLang.get(lang) || 0) + 1);
  }

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
        <Link className="global-lang-chip" href="/" data-lang="zh" prefetch={false}>
          <strong lang="zh">中文</strong>
          <span>Chinese · {countByLang.get("zh") || zhPins.length} charts</span>
        </Link>
        {PRONOUNCE_PREFIX_LANGS.map((code) => {
          const lang = catalog.languages.find((l) => l.code === code);
          if (!lang) return null;
          const count = countByLang.get(code) || 0;
          const meta = globalLangMeta(code);
          return (
            <Link
              key={code}
              className="global-lang-chip"
              href={atlasLangPath(code)}
              data-lang={code}
              prefetch={false}
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

      <GlobalAmazonTextbookPanel
        lang="zh"
        langName="Chinese"
        placement="pronounce_home_textbooks"
        kicker="Books"
        lede="Graded readers, HSK, and beginner coursebooks for Mandarin."
        disclosure={AMAZON_ASSOCIATE_DISCLOSURE_PRONOUNCE}
      />

      {paged.items.length > 0 ? (
        <>
          <div className="global-section-head" id="charts">
            <h2 className="global-section-title">Chinese charts</h2>
            <p>Vocabulary plates with audio</p>
          </div>
          <div className="global-pin-grid">
            {paged.items.map((pin, i) => (
              <GlobalPinCard
                key={pin.id}
                pin={pin}
                priority={i === 0}
                meta={listingCardMeta(pin)}
              />
            ))}
          </div>
          <GlobalHubPager
            lang="zh"
            page={1}
            totalPages={paged.totalPages}
            total={paged.total}
          />
        </>
      ) : null}
    </>
  );
}
