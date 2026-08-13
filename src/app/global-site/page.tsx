import type { Metadata } from "next";
import Link from "next/link";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import { GlobalPinImage } from "@/components/global-site/GlobalPinImage";
import {
  featuredHomePins,
  getGlobalCatalog,
  globalLangMeta,
  globalPinCardImagePath,
  globalSiteBase,
  listGlobalPins,
} from "@/lib/globalSite/catalog";

const HOME_TITLE = "Kaja Global · Vocabulary charts that stick";
const HOME_DESC =
  "Free language vocabulary charts for English speakers learning Spanish, French, German, Italian, Arabic, and Japanese — with pronunciation audio and examples.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESC,
  alternates: { canonical: "https://global.kajakorean.com/" },
  openGraph: {
    title: HOME_TITLE,
    description:
      "Save-worthy word charts with audio, examples, and tutor offers.",
    url: "https://global.kajakorean.com/",
    siteName: "Kaja Global",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

export default function GlobalHomePage() {
  const catalog = getGlobalCatalog();
  const allPins = listGlobalPins();
  const pins = featuredHomePins(2);
  const poster = pins[0];
  const grid = pins.slice(1);
  const base = globalSiteBase();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kaja Global",
    url: base,
    description: HOME_DESC,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/lang/{language}`,
      "query-input": "required name=language",
    },
  };

  return (
    <>
      {poster ? (
        <link
          rel="preload"
          as="image"
          href={globalPinCardImagePath(poster.imagePath)}
          type="image/webp"
          fetchPriority="high"
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="global-hero">
        <div>
          <p className="global-kicker">Word atlas · 6 languages</p>
          <h1>Charts you can pin — and actually remember.</h1>
          <p>
            Free plates for English speakers: Spanish, French, German, Italian,
            Arabic, Japanese. Hear the word, read a sentence, then talk to a
            tutor when you&apos;re ready.
          </p>
          <div className="global-cta-row">
            <a className="global-btn global-btn-stamp" href="/go/preply">
              Book a tutor · 50% off
            </a>
            <a className="global-btn global-btn-secondary" href="#charts">
              Browse the atlas
            </a>
          </div>
        </div>
        {poster ? (
          <Link
            className="global-hero-poster"
            href={`/pin/${poster.id}`}
            data-lang={poster.lang}
          >
            <figure>
              <GlobalPinImage
                imagePath={poster.imagePath}
                alt={`${poster.titleEn} vocabulary chart`}
                variant="card"
                priority
                width={480}
                height={720}
              />
              <figcaption>
                {globalLangMeta(poster.lang).native} · {poster.titleEn}
              </figcaption>
            </figure>
          </Link>
        ) : null}
      </section>

      <div className="global-lang-index">
        {catalog.languages.map((lang) => {
          const count = allPins.filter((p) => p.lang === lang.code).length;
          const meta = globalLangMeta(lang.code);
          return (
            <Link
              key={lang.code}
              className="global-lang-chip"
              href={`/lang/${lang.code}`}
              data-lang={lang.code}
            >
              <strong lang={lang.code} dir={meta.dir}>
                {meta.native}
              </strong>
              <span>
                {lang.name} · {count} charts
              </span>
            </Link>
          );
        })}
      </div>

      <div className="global-section-head" id="charts">
        <h2 className="global-section-title">From the atlas</h2>
        <p>Selected plates</p>
      </div>
      <div className="global-pin-grid">
        {grid.map((pin) => (
          <GlobalPinCard key={pin.id} pin={pin} />
        ))}
      </div>
    </>
  );
}
