import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGlobalPin,
  globalLangMeta,
  globalPinPageImagePath,
  listGlobalPins,
  relatedGlobalPins,
} from "@/lib/globalSite/catalog";
import { globalGoPath, type AffiliatePartner } from "@/lib/globalSite/affiliate";
import { buildPinMetadata, pinJsonLd } from "@/lib/globalSite/seo";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import { GlobalPinImage } from "@/components/global-site/GlobalPinImage";
import { GlobalTtsButton } from "@/components/global-site/GlobalTtsButton";
import { GlobalAmazonTextbookPanel } from "@/components/global-site/GlobalAmazonTextbookPanel";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  return listGlobalPins().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) return { title: "Chart" };
  return buildPinMetadata(pin);
}

export default async function GlobalPinPage({ params }: Props) {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) notFound();

  const partner = (
    pin.partner === "italki" ? "italki" : "preply"
  ) as AffiliatePartner;
  const offer =
    partner === "italki"
      ? "$10 off your first lesson"
      : "50% off your first lesson";
  const goHref = globalGoPath(partner, { lang: pin.lang, pin: pin.id });
  const related = relatedGlobalPins(pin, 10);
  const relatedSameLang = related.filter((p) => p.lang === pin.lang);
  const relatedOtherLang = related.filter((p) => p.lang !== pin.lang);
  const examples = pin.examples || [];
  const jsonLd = pinJsonLd(pin);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={globalPinPageImagePath(pin.imagePath)}
        type="image/webp"
        fetchPriority="high"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href="/">Atlas</Link>
        <span aria-hidden> / </span>
        <Link href={`/lang/${pin.lang}`} lang={pin.lang} dir={globalLangMeta(pin.lang).dir}>
          {globalLangMeta(pin.lang).native}
        </Link>
        <span aria-hidden> / </span>
        <span>{pin.titleEn}</span>
      </nav>

      <article className="global-pin-layout" data-lang={pin.lang}>
        <div className="global-pin-visual">
          <GlobalPinImage
            imagePath={pin.imagePath}
            alt={`${pin.titleEn} — vocabulary chart for English speakers`}
            variant="page"
            priority
            width={1000}
            height={1500}
          />
        </div>

        <div className="global-pin-copy">
          <h1>{pin.titleEn}</h1>
          <p className="global-pin-lede">
            {pin.explanationEn || pin.description}
          </p>

          <h2 className="global-subhead">Glossary · {pin.langName}</h2>
          <ul className="global-word-list">
            {pin.words.map((w, i) => (
              <li key={`${w.english}-${w.target}-${i}`}>
                <span className="global-word-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="global-word-main">
                  <span className="global-word-target" lang={pin.lang}>
                    {w.target}
                  </span>
                  <span className="global-word-roma">
                    {w.romanization ? `[${w.romanization}]` : ""}
                  </span>
                </div>
                {w.ttsUrl ? (
                  <GlobalTtsButton
                    src={w.ttsUrl}
                    label={`Play ${w.target} in ${pin.langName}`}
                  />
                ) : null}
                <span className="global-word-en">{w.english}</span>
              </li>
            ))}
          </ul>

          {examples.length > 0 ? (
            <section className="global-examples" aria-labelledby="examples-heading">
              <h2 id="examples-heading" className="global-subhead">
                Example sentences
              </h2>
              <ol className="global-example-list">
                {examples.map((ex, i) => (
                  <li key={`${ex.target}-${i}`}>
                    <div className="global-example-target-row">
                      <p className="global-example-target" lang={pin.lang}>
                        {ex.target}
                      </p>
                      {ex.ttsUrl ? (
                        <GlobalTtsButton
                          src={ex.ttsUrl}
                          label={`Play example ${i + 1} in ${pin.langName}`}
                        />
                      ) : null}
                    </div>
                    <p className="global-example-en">{ex.english}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <aside className="global-tutor-panel">
            <p className="global-tutor-kicker">{offer}</p>
            <h2>Practice with a {pin.langName} tutor</h2>
            <p>
              Charts get you started — conversation locks it in. Book a{" "}
              {pin.langName} tutor and use these words in a real lesson.
            </p>
            <a className="global-btn" href={goHref}>
              Continue · {partner === "italki" ? "italki" : "Preply"}
            </a>
          </aside>

          <GlobalAmazonTextbookPanel
            lang={pin.lang}
            langName={pin.langName}
            placement="global_pin_textbooks"
            pinId={pin.id}
          />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="global-related" aria-labelledby="related-heading">
          <h2 id="related-heading" className="global-section-title">
            More vocabulary charts
          </h2>
          {relatedOtherLang.length > 0 ? (
            <>
              <p className="global-related-lede">
                Same topic in other languages
              </p>
              <ul className="global-related-links">
                {relatedOtherLang.map((p) => (
                  <li key={p.id}>
                    <Link href={`/pin/${p.id}`} data-lang={p.lang}>
                      {p.titleEn}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {relatedSameLang.length > 0 ? (
            <>
              <p className="global-related-lede">More {pin.langName} charts</p>
              <div className="global-pin-grid global-related-grid">
                {relatedSameLang.map((p) => (
                  <GlobalPinCard
                    key={p.id}
                    pin={p}
                    heading="h3"
                    meta={`${p.words.length} words`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
