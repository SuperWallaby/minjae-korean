import type { Metadata } from "next";
import Link from "next/link";
import {
  getGlobalCatalog,
  globalSiteBase,
  listGlobalPins,
} from "@/lib/globalSite/catalog";

export const metadata: Metadata = {
  title: "Kaja Global · Vocabulary charts that stick",
  description:
    "Free language vocabulary charts for English speakers learning Spanish, French, German, Italian, Arabic, and Japanese — with pronunciation audio and examples.",
  alternates: { canonical: "https://global.kajakorean.com/" },
  openGraph: {
    title: "Kaja Global · Vocabulary charts that stick",
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
  const pins = listGlobalPins();
  const base = globalSiteBase();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kaja Global",
    url: base,
    description: metadata.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/lang/{language}`,
      "query-input": "required name=language",
    },
  };

  return (
    <>
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
          const count = pins.filter((p) => p.lang === lang.code).length;
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
        Latest charts
      </h2>
      <div className="global-pin-grid">
        {pins.map((pin) => (
          <Link
            key={pin.id}
            className="global-pin-card"
            href={`/pin/${pin.id}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pin.imagePath}
              alt={`${pin.titleEn} vocabulary chart`}
              loading="lazy"
              width={400}
              height={600}
            />
            <div className="global-pin-card-body">
              <h2>{pin.titleEn}</h2>
              <div className="global-pin-card-meta">{pin.langName}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
