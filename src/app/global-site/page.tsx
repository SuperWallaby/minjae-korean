import type { Metadata } from "next";
import Link from "next/link";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import {
  featuredHomePins,
  getGlobalCatalog,
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

export default function GlobalHomePage() {
  const catalog = getGlobalCatalog();
  const allPins = listGlobalPins();
  const pins = featuredHomePins(2);
  const lcp = pins[0];
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
      {lcp ? (
        <link
          rel="preload"
          as="image"
          href={globalPinCardImagePath(lcp.imagePath)}
          type="image/webp"
          fetchPriority="high"
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="global-hero">
        <h1>Vocabulary charts that make language stick</h1>
        <p>
          Free, scannable word lists for English speakers — Spanish, French,
          German, Italian, Arabic, Japanese. Hear pronunciations, read example
          sentences, then book a real tutor when you&apos;re ready to practice.
        </p>
        <div className="global-cta-row">
          <a className="global-btn global-btn-hot" href="/go/preply">
            Book a tutor · 50% off first lesson
          </a>
          <a className="global-btn global-btn-secondary" href="#charts">
            Browse charts
          </a>
        </div>
      </section>

      <div className="global-lang-grid">
        {catalog.languages.map((lang) => {
          const count = allPins.filter((p) => p.lang === lang.code).length;
          return (
            <Link
              key={lang.code}
              className="global-lang-chip"
              href={`/lang/${lang.code}`}
            >
              <strong>{lang.name}</strong>
              <span>
                {count} chart{count === 1 ? "" : "s"}
              </span>
            </Link>
          );
        })}
      </div>

      <h2 id="charts" className="global-section-title">
        Featured charts
      </h2>
      <div className="global-pin-grid">
        {pins.map((pin, i) => (
          <GlobalPinCard key={pin.id} pin={pin} priority={i === 0} />
        ))}
      </div>
    </>
  );
}
