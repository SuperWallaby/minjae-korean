import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import {
  getGlobalLang,
  globalLangMeta,
  globalSiteBase,
  listGlobalPins,
} from "@/lib/globalSite/catalog";
import { globalGoPath } from "@/lib/globalSite/affiliate";

type Props = { params: Promise<{ code: string }> };

const LANGS = ["es", "fr", "de", "it", "ar", "ja"] as const;

export async function generateStaticParams() {
  return LANGS.map((code) => ({ code }));
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
  const meta = globalLangMeta(code);

  return (
    <div data-lang={code}>
      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href="/">Atlas</Link>
        <span aria-hidden> / </span>
        <span lang={code} dir={meta.dir}>
          {meta.native}
        </span>
      </nav>
      <section className="global-hero">
        <div>
          <p className="global-kicker">{lang.name} · {pins.length} plates</p>
          <h1 className="global-lang-hero-native" lang={code} dir={meta.dir}>
            {meta.native}
          </h1>
          <p>
            Charts for English speakers learning {lang.name}. Audio, example
            sentences, then a tutor when you want to speak.
          </p>
          <div className="global-cta-row">
            <a
              className="global-btn global-btn-stamp"
              href={globalGoPath("preply", { lang: code })}
            >
              Book a {lang.name} tutor · 50% off
            </a>
          </div>
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
        <p className="global-related-lede">Other languages</p>
        <ul className="global-related-links">
          {LANGS.filter((c) => c !== code).map((c) => {
            const l = getGlobalLang(c);
            const m = globalLangMeta(c);
            if (!l) return null;
            return (
              <li key={c}>
                <Link href={`/lang/${c}`} lang={c} dir={m.dir}>
                  {m.native}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
