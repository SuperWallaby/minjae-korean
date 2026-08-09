import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGlobalLang, listGlobalPins } from "@/lib/globalSite/catalog";
import { globalGoPath } from "@/lib/globalSite/affiliate";

type Props = { params: Promise<{ code: string }> };

export async function generateStaticParams() {
  return ["es", "fr", "de", "it", "ar", "ja"].map((code) => ({ code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const lang = getGlobalLang(code);
  if (!lang) return { title: "Language" };
  return {
    title: `${lang.name} vocabulary charts`,
    description: `Clear ${lang.name} word charts for English speakers — with pronunciation and tutor offers.`,
  };
}

export default async function GlobalLangPage({ params }: Props) {
  const { code } = await params;
  const lang = getGlobalLang(code);
  if (!lang) notFound();
  const pins = listGlobalPins({ lang: code });

  return (
    <>
      <p className="global-crumbs">
        <Link href="/">Home</Link> / {lang.name}
      </p>
      <section className="global-hero">
        <h1>{lang.name} vocabulary charts</h1>
        <p>
          Charts made for English speakers learning {lang.name}. Save them,
          practice the words, then book a {lang.name} tutor when you want to
          speak.
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
          {pins.map((pin) => (
            <Link
              key={pin.id}
              className="global-pin-card"
              href={`/pin/${pin.id}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pin.imagePath} alt={pin.titleEn} loading="lazy" />
              <div className="global-pin-card-body">
                <h2>{pin.titleEn}</h2>
                <div className="global-pin-card-meta">
                  {pin.words.length} words
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
