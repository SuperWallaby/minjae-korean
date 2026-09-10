import Link from "next/link";
import { globalLangMeta } from "@/lib/globalSite/langMeta";
import { globalPinPageImagePath } from "@/lib/globalSite/pinImages";
import {
  listingCardMeta,
  relatedGlobalPins,
  type GlobalPinPage,
} from "@/lib/globalSite/catalog";
import { firstSentence } from "@/lib/globalSite/copy";
import { pinJsonLd } from "@/lib/globalSite/seo";
import { atlasLangPath, atlasPinPath } from "@/lib/atlasRoutes";
import { GlobalPinCard } from "@/components/global-site/GlobalPinCard";
import { GlobalPinImage } from "@/components/global-site/GlobalPinImage";
import { GlobalPinListenBanner } from "@/components/global-site/GlobalPinListenBanner";
import { ReadingPinPlayer } from "@/components/global-site/ReadingPinPlayer";
import { GlobalPinWordList } from "@/components/global-site/GlobalPinWordList";
import { GlobalPinExampleList } from "@/components/global-site/GlobalPinExampleList";
import { GlobalAmazonTextbookPanel } from "@/components/global-site/GlobalAmazonTextbookPanel";
import { GlobalTutorPanel } from "@/components/global-site/GlobalTutorPanel";
import { SpanishAccentProvider } from "@/components/global-site/SpanishAccentToggle";
import { FrenchAccentProvider } from "@/components/global-site/FrenchAccentToggle";
import { AMAZON_ASSOCIATE_DISCLOSURE_PRONOUNCE } from "@/lib/affiliateAmazon";
import { isPronounceSiteDeployment } from "@/lib/pronounceSite/brand";

type Props = { pin: GlobalPinPage };

export async function GlobalPinDetail({ pin }: Props) {
  const related = await relatedGlobalPins(pin, 10);
  const relatedSameLang = related.filter((p) => p.lang === pin.lang);
  const relatedOtherLang = related.filter((p) => p.lang !== pin.lang);
  const examples = pin.examples || [];
  const reading = pin.reading;
  const jsonLd = pinJsonLd(pin);
  const langMeta = globalLangMeta(pin.lang);
  // Korean Atlas pages stay chart-first: no intro paragraph under the H1.
  const lede =
    pin.lang === "ko"
      ? ""
      : firstSentence(pin.explanationEn || pin.description);

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
        <Link href={atlasLangPath(pin.lang)}>Home</Link>
        <span aria-hidden> / </span>
        <Link href={atlasLangPath(pin.lang)} lang={pin.lang} dir={langMeta.dir}>
          {langMeta.native}
        </Link>
        <span aria-hidden> / </span>
        <span>{reading ? "Korean Audio Story" : pin.titleEn}</span>
      </nav>

      <article
        className="global-pin-layout"
        data-lang={pin.lang}
        data-kind={reading ? "reading" : "chart"}
      >
        <div className="global-pin-intro">
          <h1>
            {reading ? "🎧 Korean Audio Story" : pin.titleEn}
          </h1>
          {reading?.sceneEn ? (
            <p className="global-pin-lede">{reading.sceneEn}</p>
          ) : lede ? (
            <p className="global-pin-lede">{lede}</p>
          ) : null}
        </div>

        <div className="global-pin-listen">
          {reading ? (
            <ReadingPinPlayer reading={reading}>
              {reading.lines.some((line) => line.en?.trim()) ? (
                <section
                  id="reading-meaning"
                  className="reading-meaning"
                  aria-labelledby="reading-meaning-heading"
                >
                  <h2 id="reading-meaning-heading">Meaning</h2>
                  <ol>
                    {reading.lines.map((line, i) =>
                      line.en?.trim() ? (
                        <li key={`${i}-${line.en}`}>
                          {line.speakerKo || line.speaker ? (
                            <span className="reading-meaning-speaker">
                              {line.speakerKo || line.speaker}
                            </span>
                          ) : null}
                          <span className="reading-meaning-en">{line.en}</span>
                        </li>
                      ) : null,
                    )}
                  </ol>
                </section>
              ) : null}
            </ReadingPinPlayer>
          ) : (
            <div className="global-pin-controls">
              <p className="sound-listen-kicker">🎧 Listen</p>
              <GlobalPinListenBanner
                lang={pin.lang}
                langName={pin.langName}
                words={pin.words}
                examples={examples}
              />
            </div>
          )}
        </div>

        {reading ? null : (
          <div className="global-pin-words">
            <GlobalPinWordList
              lang={pin.lang}
              langName={pin.langName}
              words={pin.words}
            />
          </div>
        )}

        <div className="global-pin-visual">
          <GlobalPinImage
            imagePath={pin.imagePath}
            alt={
              reading
                ? `${pin.titleEn} — Korean reading pin`
                : `${pin.titleEn} — vocabulary chart for English speakers`
            }
            variant="page"
            priority
            width={1000}
            height={reading ? 2000 : 1500}
          />
        </div>

        {reading ? null : (
          <div className="global-pin-examples">
            <GlobalPinExampleList
              lang={pin.lang}
              langName={pin.langName}
              examples={examples}
            />
          </div>
        )}

        <div className="global-pin-copy">
          <GlobalTutorPanel
            lang={pin.lang}
            langName={pin.langName}
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
                    <Link href={atlasPinPath(p)} data-lang={p.lang} prefetch={false}>
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
                    meta={listingCardMeta(p)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      <GlobalAmazonTextbookPanel
        lang={pin.lang}
        langName={pin.langName}
        placement="global_pin_textbooks"
        pinId={pin.id}
        kicker="Books"
        disclosure={
          isPronounceSiteDeployment()
            ? AMAZON_ASSOCIATE_DISCLOSURE_PRONOUNCE
            : undefined
        }
      />
    </>
  );

  if (pin.lang === "es") {
    return <SpanishAccentProvider>{body}</SpanishAccentProvider>;
  }
  if (pin.lang === "fr") {
    return <FrenchAccentProvider>{body}</FrenchAccentProvider>;
  }
  return body;
}
