import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSoundPin,
  relatedSoundPins,
  soundPinAbsoluteUrl,
  soundPinForCard,
  soundPinPageImagePath,
} from "@/lib/soundSite/catalog";
import {
  soundPinKicker,
  soundRelatedHeading,
} from "@/lib/seo/soundPatterns";
import {
  buildSoundPinMetadata,
  soundPinJsonLd,
  soundPinSeoTitle,
} from "@/lib/soundSite/seo";
import {
  SoundAccentToggle,
  SoundPlayAllButton,
  SoundSlowNormalButton,
  SoundSpeedControl,
  SoundVoiceToggle,
} from "@/components/sound-site/SoundPlayback";
import { SoundPinCard } from "@/components/sound-site/SoundPinCard";
import { SoundShareButton } from "@/components/sound-site/SoundShareButton";
import { SoundTtsButton } from "@/components/sound-site/SoundTtsButton";
import { SoundTrackText } from "@/components/sound-site/SoundTrackText";
import { SoundTutorPair } from "@/components/sound-site/SoundTutorPair";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;
/** New CDN catalog pins resolve without a redeploy. */
export const dynamicParams = true;

export async function generateStaticParams() {
  // Bundled snapshot only — avoids build-time CDN dependency.
  const { getSoundCatalogBundled } = await import("@/lib/soundSite/catalog");
  return getSoundCatalogBundled()
    .pages.filter((p) => p.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pin = await getSoundPin(slug);
  if (!pin) return { title: "Other ways to say it" };
  return buildSoundPinMetadata(pin);
}

export default async function SoundOfPinPage({ params }: Props) {
  const { slug } = await params;
  const pin = await getSoundPin(slug);
  if (!pin) notFound();

  const examples = pin.examples || [];
  const related = (await relatedSoundPins(pin, 6)).map(soundPinForCard);
  const jsonLd = soundPinJsonLd(pin);
  const image = soundPinPageImagePath(pin.imagePath);
  const shareUrl = soundPinAbsoluteUrl(pin);
  const shareTitle = soundPinSeoTitle(pin);
  const showChartTitle =
    pin.titleEn.trim().toLowerCase() !== shareTitle.trim().toLowerCase();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href="/">Charts</Link>
        <span aria-hidden> / </span>
        <span>{shareTitle}</span>
      </nav>

      <article className="sound-pin-layout">
        <div className="sound-pin-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={shareTitle}
            width={1000}
            height={1500}
          />
          <SoundShareButton url={shareUrl} title={shareTitle} />
        </div>

        <div className="sound-pin-copy">
          <p className="sound-listen-kicker">{soundPinKicker(pin)}</p>
          <h1>{shareTitle}</h1>
          {showChartTitle ? (
            <p className="sound-pin-chart-title">{pin.titleEn}</p>
          ) : null}

          <aside className="sound-listen-banner" aria-label="Listening controls">
            <div className="sound-hero-controls">
              <SoundAccentToggle />
              <SoundVoiceToggle />
              <SoundSpeedControl />
              <SoundPlayAllButton
                items={pin.words.map((w, i) => ({
                  ...w,
                  highlightKey: `w-${i}`,
                }))}
              />
            </div>
          </aside>

          <h2 className="global-subhead">Words to pronounce</h2>
          <ul className="global-word-list">
            {pin.words.map((w, i) => (
              <li key={`${w.english}-${i}`}>
                <span className="global-word-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="global-word-main">
                  <SoundTrackText
                    className="global-word-target"
                    lang="en"
                    highlightKey={`w-${i}`}
                  >
                    {w.english}
                  </SoundTrackText>
                  {w.ipa ? (
                    <span className="global-word-roma">/{w.ipa}/</span>
                  ) : null}
                </div>
                {w.gloss ? (
                  <span className="global-word-en">{w.gloss}</span>
                ) : (
                  <span className="global-word-en" />
                )}
                <span className="sound-word-actions">
                  <SoundTtsButton
                    item={w}
                    label={w.english}
                    highlightKey={`w-${i}`}
                  />
                  <SoundSlowNormalButton
                    item={w}
                    highlightKey={`w-${i}`}
                  />
                </span>
              </li>
            ))}
          </ul>

          {examples.length > 0 ? (
            <section className="global-examples" aria-labelledby="ex-heading">
              <h2 id="ex-heading" className="global-subhead">
                Examples
              </h2>
              <ol className="global-example-list">
                {examples.map((ex, i) => (
                  <li key={`${ex.english}-${i}`}>
                    <div className="global-example-target-row">
                      <SoundTrackText
                        as="p"
                        className="global-example-target"
                        lang="en"
                        highlightKey={`ex-${i}`}
                      >
                        {ex.english}
                      </SoundTrackText>
                      <span className="sound-word-actions">
                        <SoundTtsButton
                          item={ex}
                          label={`Example ${i + 1}`}
                          highlightKey={`ex-${i}`}
                        />
                        <SoundSlowNormalButton
                          item={ex}
                          highlightKey={`ex-${i}`}
                        />
                      </span>
                    </div>
                    {ex.gloss ? (
                      <p className="global-example-en">{ex.gloss}</p>
                    ) : null}
                    {ex.ipa ? (
                      <p className="global-example-en" lang="en">
                        /{ex.ipa}/
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <SoundTutorPair pinId={pin.id} />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="global-related" aria-labelledby="related-heading">
          <h2 id="related-heading" className="global-section-title">
            {soundRelatedHeading(pin)}
          </h2>
          <div className="global-pin-grid">
            {related.map((r) => (
              <SoundPinCard key={r.id} pin={r} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
