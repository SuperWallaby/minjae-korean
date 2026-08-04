"use client";

import * as React from "react";

import { Container } from "@/components/site/Container";
import { MarketingHeader } from "@/components/site/MarketingShell";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";
import type { ExpressionCardSet } from "@/data/expressionCardSets";

import homeStyles from "./home-renewal.module.css";
import styles from "./expression-cards-home.module.css";

const CHARACTER_CREDIT_HREF = "https://www.instagram.com/chico._.pu";
/** Start loading a bit before the section enters the viewport. */
const MEDIA_ROOT_MARGIN = "320px 0px";

type Props = {
  sets: ExpressionCardSet[];
};

function prefetchImage(url: string) {
  if (!url || typeof window === "undefined") return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = url;
}

function SoftImage({
  src,
  alt,
  className,
  width,
  height,
  enabled = true,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** When false, keep the aspect box but do not request the image. */
  enabled?: boolean;
}) {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setLoaded(false);
  }, [src, enabled]);

  return (
    <span
      className={`${styles.softImageWrap} ${loaded ? styles.softImageLoaded : ""}`}
    >
      {enabled ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={className}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setLoaded(true)}
        />
      ) : null}
    </span>
  );
}

function ExpressionCardStage({
  set,
  enabled,
}: {
  set: ExpressionCardSet;
  enabled: boolean;
}) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
  }, [set.id]);

  // Prefetch current + neighbors only after the section is near the viewport.
  React.useEffect(() => {
    if (!enabled) return;
    const urls = [
      set.cards[index]?.imageUrl,
      set.cards[index + 1]?.imageUrl,
      set.cards[index - 1]?.imageUrl,
      set.cards[index + 2]?.imageUrl,
    ].filter(Boolean) as string[];
    for (const url of urls) prefetchImage(url);
  }, [enabled, set.id, set.cards, index]);

  const card = set.cards[index];
  if (!card) return null;

  const isLast = index >= set.cards.length - 1;

  const goNext = () => {
    setIndex((value) => (isLast ? 0 : value + 1));
  };

  const goPrev = () => {
    if (index <= 0) return;
    setIndex((value) => value - 1);
  };

  return (
    <div className={styles.stage}>
      <div className={styles.metaRow}>
        <h3 className={styles.setTitle}>{set.shortTitle}</h3>
        <p className={styles.progress}>
          {index + 1} / {set.cards.length}
        </p>
      </div>

      <button
        type="button"
        className={styles.slideButton}
        onClick={goNext}
        aria-label={isLast ? "Restart set" : "Next slide"}
      >
        <SoftImage
          className={styles.slideImage}
          src={card.imageUrl}
          alt={
            card.hangul
              ? `${card.hangul}${card.english ? ` — ${card.english}` : ""}`
              : set.title
          }
          enabled={enabled}
          width={720}
          height={900}
        />
      </button>

      {(card.hangul || card.english) && (
        <div className={styles.caption}>
          {card.hangul ? (
            <p className={styles.captionHangul}>{card.hangul}</p>
          ) : null}
          {card.romanization ? (
            <p className={styles.captionRom}>[{card.romanization}]</p>
          ) : null}
          {card.english ? (
            <p className={styles.captionEn}>{card.english}</p>
          ) : null}
        </div>
      )}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={goPrev}
          disabled={index === 0}
        >
          Prev
        </button>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navBtnPrimary}`}
          onClick={goNext}
        >
          {isLast ? "Restart" : "Next"}
        </button>
      </div>
    </div>
  );
}

function CharacterCredit() {
  return (
    <p className={styles.credit}>
      Characters by{" "}
      <a
        href={CHARACTER_CREDIT_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.creditLink}
      >
        @chico._.pu
      </a>{" "}
      (Jeomjeommi).
    </p>
  );
}

export function ExpressionCardsHomeSection({ sets }: Props) {
  const [activeId, setActiveId] = React.useState(sets[0]?.id ?? "");
  const [mediaReady, setMediaReady] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const activeSet = sets.find((set) => set.id === activeId) ?? sets[0];

  React.useEffect(() => {
    if (mediaReady) return;
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setMediaReady(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) {
      setMediaReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMediaReady(true);
            observer.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: MEDIA_ROOT_MARGIN, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mediaReady]);

  // Warm the active set only after the section is near view.
  React.useEffect(() => {
    if (!mediaReady || !activeSet) return;
    prefetchImage(activeSet.cards[0]?.imageUrl ?? "");
    prefetchImage(activeSet.cards[1]?.imageUrl ?? "");
  }, [mediaReady, activeSet]);

  if (!activeSet) return null;

  const warmSet = (set: ExpressionCardSet) => {
    if (!mediaReady) return;
    prefetchImage(set.cards[0]?.imageUrl ?? "");
    prefetchImage(set.cards[1]?.imageUrl ?? "");
  };

  return (
    <section
      ref={sectionRef}
      id="expression-cards"
      className={`scroll-mt-24 ${homeStyles.sectionBlock}`}
    >
      <RevealOnScroll>
        <Container>
          <StaggerReveal className={homeStyles.sectionShell}>
            <div className={homeStyles.sectionShellPad}>
              <div className={styles.layout}>
                <div>
                  <MarketingHeader
                    eyebrow="Expression cards"
                    title="IG List flashcards"
                    titleAs="h2"
                  />
                  <p className={styles.lead}>
                    Capybara Instagram list carousels — pick a set, then flip
                    through the slides.
                  </p>
                  <CharacterCredit />

                  <div
                    className={styles.setScroller}
                    role="listbox"
                    aria-label="IG List sets"
                  >
                    {sets.map((set) => {
                      const active = set.id === activeSet.id;
                      return (
                        <button
                          key={set.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`${styles.setTile} ${
                            active ? styles.setTileActive : ""
                          }`}
                          onClick={() => setActiveId(set.id)}
                          onMouseEnter={() => warmSet(set)}
                          onFocus={() => warmSet(set)}
                        >
                          <SoftImage
                            src={set.coverThumbUrl || set.coverUrl}
                            alt=""
                            className={styles.setThumb}
                            enabled={mediaReady}
                            width={160}
                            height={200}
                          />
                          <span className={styles.setTileLabel}>
                            {set.shortTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <ExpressionCardStage set={activeSet} enabled={mediaReady} />
              </div>
            </div>
          </StaggerReveal>
        </Container>
      </RevealOnScroll>
    </section>
  );
}
