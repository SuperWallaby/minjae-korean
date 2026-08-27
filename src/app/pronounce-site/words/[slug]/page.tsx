import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPronouncePin,
  listPronouncePins,
  pronouncePinAbsoluteUrl,
  pronouncePinFocusTerm,
  pronouncePinPageImagePath,
  relatedPronouncePins,
} from "@/lib/pronounceSite/catalog";
import {
  buildPronouncePinMetadata,
  pronouncePinJsonLd,
  pronouncePinSeoTitle,
} from "@/lib/pronounceSite/seo";
import {
  PronouncePlayAllButton,
  PronounceRegionToggle,
  PronounceSlowNormalButton,
  PronounceSpeedControl,
  PronounceTtsButton,
  PronounceVoiceToggle,
} from "@/components/pronounce-site/PronouncePlayback";
import { PronouncePinCard } from "@/components/pronounce-site/PronouncePinCard";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return listPronouncePins().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pin = getPronouncePin(slug);
  if (!pin) return { title: "Pronunciation" };
  return buildPronouncePinMetadata(pin);
}

export default async function PronounceWordPage({ params }: Props) {
  const { slug } = await params;
  const pin = getPronouncePin(slug);
  if (!pin) notFound();

  const focus = pronouncePinFocusTerm(pin);
  const word = pin.words?.[0];
  const jsonLd = pronouncePinJsonLd(pin);
  const image = pronouncePinPageImagePath(pin.imagePath);
  const seoTitle = pronouncePinSeoTitle(pin);
  const shareUrl = pronouncePinAbsoluteUrl(pin);
  const related = relatedPronouncePins(pin, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="global-crumbs" aria-label="Breadcrumb">
        <Link href="/">Charts</Link>
        <span aria-hidden> / </span>
        <span lang="zh">{focus}</span>
      </nav>

      <article className="sound-pin-layout">
        <div className="sound-pin-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={`How to pronounce ${focus}${word?.pinyin ? ` (${word.pinyin})` : ""}`}
            width={1000}
            height={1500}
            fetchPriority="high"
          />
        </div>

        <div className="sound-pin-copy">
          <p className="sound-listen-kicker">Pronounce · listen</p>
          <h1>{seoTitle}</h1>
          {pin.description ? (
            <p className="sound-pin-lede">{pin.description}</p>
          ) : null}

          <aside className="sound-listen-banner" aria-label="Listening controls">
            <p className="sound-listen-kicker">Sound desk</p>
            <div className="sound-hero-controls">
              <PronounceVoiceToggle />
              <PronounceRegionToggle />
              <PronounceSpeedControl />
              {word ? (
                <>
                  <PronouncePlayAllButton items={[word]} label="Play word" />
                  <PronounceSlowNormalButton item={word} />
                </>
              ) : null}
            </div>
            <p className="sound-listen-hint">
              CN / TW / HK × female / male — slow down until the tones click.
            </p>
          </aside>

          <section className="global-word-list" aria-label="Word">
            {word ? (
              <div className="global-word-row">
                <div>
                  <span className="global-word-target" lang="zh">
                    {word.chinese}
                  </span>
                  {word.pinyin ? (
                    <span className="global-word-roman">{word.pinyin}</span>
                  ) : null}
                  <span className="global-word-en">{word.english}</span>
                </div>
                <PronounceTtsButton
                  item={word}
                  label={`${word.chinese} ${word.pinyin || ""}`}
                />
              </div>
            ) : null}
          </section>

          <p className="global-footer-meta">
            Share:{" "}
            <a href={shareUrl} rel="noopener">
              {shareUrl}
            </a>
          </p>
        </div>
      </article>

      {related.length ? (
        <section className="global-related" aria-label="More charts">
          <h2>More pronunciation charts</h2>
          <div className="global-pin-grid global-pin-grid-compact">
            {related.map((p) => (
              <PronouncePinCard key={p.id} pin={p} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
