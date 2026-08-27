import Link from "next/link";
import {
  globalLangMeta,
  globalPinPageImagePath,
  relatedGlobalPins,
  type GlobalPinPage,
} from "@/lib/globalSite/catalog";
import { firstSentence } from "@/lib/globalSite/copy";
import { globalGoPath, type AffiliatePartner } from "@/lib/globalSite/affiliate";
import { pinJsonLd } from "@/lib/globalSite/seo";
import { atlasLangPath, atlasPinPath } from "@/lib/atlasRoutes";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import { GlobalPinImage } from "@/components/global-site/GlobalPinImage";
import { GlobalPinListenBanner } from "@/components/global-site/GlobalPinListenBanner";
import { GlobalPinWordList } from "@/components/global-site/GlobalPinWordList";
import { GlobalPinExampleList } from "@/components/global-site/GlobalPinExampleList";
import { GlobalAmazonTextbookPanel } from "@/components/global-site/GlobalAmazonTextbookPanel";
import {
  SpanishAccentProvider,
  SpanishAccentToggle,
} from "@/components/global-site/SpanishAccentToggle";

type Props = { pin: GlobalPinPage };

export function GlobalPinDetail({ pin }: Props) {
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
  const langMeta = globalLangMeta(pin.lang);
  const lede = firstSentence(pin.explanationEn || pin.description);

  const body = (
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
        <Link href="/">Home</Link>
        <span aria-hidden> / </span>
        <Link href={atlasLangPath(pin.lang)} lang={pin.lang} dir={langMeta.dir}>
          {langMeta.native}
        </Link>
        <span aria-hidden> / </span>
        <span>{pin.titleEn}</span>
      </nav>

      <article className="global-pin-layout" data-lang={pin.lang}>
        {/*
          Mobile order: title → listen (sticky) → words → chart → examples → offers.
          Desktop: chart sticky left; copy column stacks the rest.
        */}
        <div className="global-pin-intro">
          <h1>{pin.titleEn}</h1>
          {lede ? <p className="global-pin-lede">{lede}</p> : null}
          {pin.lang === "es" ? (
            <div className="global-accent-row">
              <span className="global-accent-label">Accent</span>
              <SpanishAccentToggle />
            </div>
          ) : null}
        </div>

        <div className="global-pin-controls">
          <GlobalPinListenBanner
            lang={pin.lang}
            langName={pin.langName}
            words={pin.words}
            examples={examples}
          />
        </div>

        <div className="global-pin-words">
          <GlobalPinWordList
            lang={pin.lang}
            langName={pin.langName}
            words={pin.words}
          />
        </div>

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

        <div className="global-pin-examples">
          <GlobalPinExampleList
            lang={pin.lang}
            langName={pin.langName}
            examples={examples}
          />
        </div>

        <div className="global-pin-copy">
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
              <p className="global-related-lede">Same topic in other languages</p>
              <ul className="global-related-links">
                {relatedOtherLang.map((p) => (
                  <li key={p.id}>
                    <Link href={atlasPinPath(p)} data-lang={p.lang}>
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

  if (pin.lang === "es") {
    return <SpanishAccentProvider>{body}</SpanishAccentProvider>;
  }
  return body;
}
