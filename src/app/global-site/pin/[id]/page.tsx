import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGlobalPin,
  listGlobalPins,
  relatedGlobalPins,
} from "@/lib/globalSite/catalog";
import { globalGoPath, type AffiliatePartner } from "@/lib/globalSite/affiliate";
import { buildPinMetadata, pinJsonLd } from "@/lib/globalSite/seo";
import { GlobalTtsButton } from "@/components/global-site/GlobalTtsButton";

type Props = { params: Promise<{ id: string }> };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden> / </span>
        <Link href={`/lang/${pin.lang}`}>{pin.langName}</Link>
        <span aria-hidden> / </span>
        <span>{pin.titleEn}</span>
      </nav>

      <article className="global-pin-layout">
        <div className="global-pin-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pin.imagePath}
            alt={`${pin.titleEn} — vocabulary chart for English speakers`}
            width={1000}
            height={1500}
          />
        </div>

        <div className="global-pin-copy">
          <h1>{pin.titleEn}</h1>
          <p className="global-pin-lede">
            {pin.explanationEn || pin.description}
          </p>

          <h2 className="global-subhead">Word list · tap play for {pin.langName}</h2>
          <ul className="global-word-list">
            {pin.words.map((w, i) => (
              <li key={`${w.english}-${w.target}-${i}`}>
                <div className="global-word-main">
                  <span className="global-word-target">{w.target}</span>
                  {w.ttsUrl ? (
                    <GlobalTtsButton
                      src={w.ttsUrl}
                      label={`Play ${w.target} in ${pin.langName}`}
                    />
                  ) : null}
                </div>
                <span className="global-word-roma">
                  {w.romanization ? `[${w.romanization}]` : ""}
                </span>
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
            <h2>Practice with a {pin.langName} tutor</h2>
            <p>
              Charts get you started — conversation locks it in. Book a{" "}
              {pin.langName} tutor and use these words in a real lesson.
            </p>
            <p>
              <strong>{offer}</strong> via our partner.
            </p>
            <a className="global-btn" href={goHref}>
              Continue · {partner === "italki" ? "italki" : "Preply"}
            </a>
          </aside>
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
                    <Link href={`/pin/${p.id}`}>{p.titleEn}</Link>
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
                  <Link
                    key={p.id}
                    className="global-pin-card"
                    href={`/pin/${p.id}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imagePath}
                      alt={p.titleEn}
                      loading="lazy"
                      width={400}
                      height={600}
                    />
                    <div className="global-pin-card-body">
                      <h3>{p.titleEn}</h3>
                      <div className="global-pin-card-meta">
                        {p.words.length} words
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
