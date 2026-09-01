import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlobalAmazonTextbookPanel } from "@/components/global-site/GlobalAmazonTextbookPanel";
import { GlobalPinImage } from "@/components/global-site/GlobalPinImage";
import { JaAccentTts } from "@/components/ja-site/JaAccentTts";
import { JaPinCard } from "@/components/ja-site/JaPinCard";
import { JaSpeedControl } from "@/components/ja-site/JaPlayback";
import { JaTutorPair } from "@/components/ja-site/JaTutorPair";
import { BuyMeCoffeePinSupport } from "@/components/site/BuyMeCoffeePinSupport";
import { AMAZON_ASSOCIATE_DISCLOSURE_JA } from "@/lib/affiliateAmazon";
import {
  getJaPin,
  jaPinPageImagePath,
  relatedJaPins,
} from "@/lib/jaSite/catalog";
import { buildJaPinMetadata, jaPinJsonLd } from "@/lib/jaSite/seo";
import { firstSentence } from "@/lib/globalSite/copy";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { getJaCatalogBundled } = await import("@/lib/jaSite/catalog");
  return getJaCatalogBundled().pages.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = await getJaPin(id);
  if (!pin) return { title: "チャート" };
  return buildJaPinMetadata(pin);
}

export default async function JaPinPage({ params }: Props) {
  const { id } = await params;
  const pin = await getJaPin(id);
  if (!pin) notFound();

  const related = await relatedJaPins(pin, 8);
  const examples = pin.examples || [];
  const jsonLd = jaPinJsonLd(pin);
  const image = jaPinPageImagePath(pin.imagePath);
  // Skip catalog `description` — it often dumps every word. Keep one short line.
  const lede = firstSentence(pin.explanationJa);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={image}
        type="image/webp"
        fetchPriority="high"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="global-crumbs" aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <span aria-hidden> / </span>
        <span>{pin.titleJa}</span>
      </nav>

      <article className="global-pin-layout ja-pin-layout">
        <div className="global-pin-intro">
          <h1>{pin.titleJa}</h1>
          {lede ? <p className="global-pin-lede">{lede}</p> : null}
          <aside className="ja-listen-banner" aria-label="再生コントロール">
            <div className="ja-listen-top">
              <p className="ja-listen-kicker">再生速度</p>
              <JaSpeedControl />
            </div>
            <p className="ja-listen-hint">
              各単語をアメリカ・イギリス・オーストラリア英語で聞き比べできます
            </p>
          </aside>
        </div>

        <div className="global-pin-visual">
          <GlobalPinImage
            imagePath={pin.imagePath}
            alt={`${pin.titleJa} 英単語チャート`}
            variant="page"
            priority
            width={1000}
            height={1500}
          />
        </div>

        <div className="global-pin-words">
          <h2 className="global-subhead">単語</h2>
          <ul className="global-word-list">
            {pin.words.map((w, i) => (
              <li key={`${w.english}-${i}`}>
                <span className="global-word-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="global-word-main">
                  <span className="global-word-target" lang="en">
                    {w.english}
                  </span>
                  {w.kana ? (
                    <span className="global-word-roma">{w.kana}</span>
                  ) : null}
                </div>
                {w.ja ? (
                  <span className="global-word-en" lang="ja">
                    {w.ja}
                  </span>
                ) : (
                  <span className="global-word-en" />
                )}
                <JaAccentTts item={w} wordLabel={w.english} />
              </li>
            ))}
          </ul>
        </div>

        {examples.length > 0 ? (
          <div className="global-pin-examples">
            <h2 className="global-subhead">例文</h2>
            <ol className="global-example-list">
              {examples.map((ex, i) => (
                <li key={`${ex.english}-${i}`}>
                  <div className="global-example-target-row">
                    <p className="global-example-target" lang="en">
                      {ex.english}
                    </p>
                    <JaAccentTts item={ex} wordLabel={`例文 ${i + 1}`} />
                  </div>
                  {ex.ja ? (
                    <p className="global-example-en" lang="ja">
                      {ex.ja}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="global-pin-copy">
          <JaTutorPair pinId={pin.id} />
          <BuyMeCoffeePinSupport variant="eigochart" />
          <GlobalAmazonTextbookPanel
            lang="en-ja"
            langName="英語"
            placement={`ja_pin_${pin.id}`}
            pinId={pin.id}
            kicker="次に学ぶ"
            heading="おすすめの英語教材"
            lede="チャートの続きは教材で（Amazon）"
            disclosure={AMAZON_ASSOCIATE_DISCLOSURE_JA}
          />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="global-related" aria-labelledby="related-heading">
          <h2 id="related-heading" className="global-section-title">
            関連チャート
          </h2>
          <div className="global-pin-grid global-related-grid">
            {related.map((r) => (
              <JaPinCard
                key={r.id}
                pin={{
                  id: r.id,
                  titleJa: r.titleJa,
                  imagePath: r.imagePath,
                  wordCount: r.words.length,
                }}
                heading="h3"
                meta={`${r.words.length}語`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
