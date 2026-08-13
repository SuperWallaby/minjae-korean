import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import {
  getGlobalLang,
  globalSiteBase,
  listGlobalPins,
} from "@/lib/globalSite/catalog";
import { globalGoPath } from "@/lib/globalSite/affiliate";

type Props = { params: Promise<{ code: string }> };

export async function generateStaticParams() {
  return ["es", "fr", "de", "it", "ar", "ja"].map((code) => ({ code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const lang = getGlobalLang(code);
  if (!lang) return { title: "Language" };
  const base = globalSiteBase();
  const url = `${base}/lang/${code}`;
  const description = `Free ${lang.name} vocabulary charts for English speakers — word lists with pronunciation audio, example sentences, and tutor booking.`;
  return {
    title: `${lang.name} vocabulary charts with audio`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${lang.name} vocabulary charts · Kaja Global`,
      description,
      url,
      siteName: "Kaja Global",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function GlobalLangPage({ params }: Props) {
  const { code } = await params;
  const lang = getGlobalLang(code);
  if (!lang) notFound();
  const pins = listGlobalPins({ lang: code });

  return (
    <>
      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden> / </span>
        <span>{lang.name}</span>
      </nav>
      <section className="global-hero">
        <h1>{lang.name} vocabulary charts</h1>
        <p>
          Charts made for English speakers learning {lang.name}. Each chart
          includes word audio, example sentences, and a path to practice with a
          tutor.
        </p>
        <div className="global-cta-row">
          <a
            className="global-btn global-btn-hot"
            href={globalGoPath("preply", { lang: code })}
          >
            Book a {lang.name} tutor · 50% off
          </a>
        </div>
      </section>

      {pins.length === 0 ? (
        <p className="global-pin-lede">More charts coming soon.</p>
      ) : (
        <div className="global-pin-grid">
          {pins.map((pin, i) => (
            <GlobalPinCard
              key={pin.id}
              pin={pin}
              priority={i === 0}
              meta={`${pin.words.length} words${
                pin.examples?.length ? " · examples" : ""
              }${pin.words.some((w) => w.ttsUrl) ? " · audio" : ""}`}
            />
          ))}
        </div>
      )}

      <section className="global-related">
        <h2 className="global-section-title">Other languages</h2>
        <ul className="global-related-links">
          {["es", "fr", "de", "it", "ar", "ja"]
            .filter((c) => c !== code)
            .map((c) => {
              const l = getGlobalLang(c);
              if (!l) return null;
              return (
                <li key={c}>
                  <Link href={`/lang/${c}`}>{l.name} vocabulary</Link>
                </li>
              );
            })}
        </ul>
      </section>
    </>
  );
}
