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
/** How many neighbors around the active slide may fetch images. */
const SLIDE_LOAD_RADIUS = 1;

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
          draggable={false}
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
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const ignoreScrollSync = React.useRef(false);

  React.useEffect(() => {
    setIndex(0);
    const el = scrollerRef.current;
    if (el) {
      ignoreScrollSync.current = true;
      el.scrollTo({ left: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        ignoreScrollSync.current = false;
      });
    }
  }, [set.id]);

  // Prefetch current + neighbors only after the section is near the viewport.
  React.useEffect(() => {
    if (!enabled) return;
    for (let i = index - SLIDE_LOAD_RADIUS; i <= index + SLIDE_LOAD_RADIUS; i++) {
      const url = set.cards[i]?.imageUrl;
      if (url) prefetchImage(url);
    }
  }, [enabled, set.id, set.cards, index]);

  const scrollToIndex = React.useCallback((next: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.children[next] as HTMLElement | undefined;
    if (!slide) return;
    ignoreScrollSync.current = true;
    el.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    setIndex(next);
    window.setTimeout(() => {
      ignoreScrollSync.current = false;
    }, 380);
  }, []);

  const onScroll = () => {
    if (ignoreScrollSync.current) return;
    const el = scrollerRef.current;
    if (!el || el.clientWidth <= 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    const clamped = Math.max(0, Math.min(set.cards.length - 1, next));
    if (clamped !== index) setIndex(clamped);
  };

  const card = set.cards[index];
  if (!card) return null;

  const isFirst = index <= 0;
  const isLast = index >= set.cards.length - 1;

  return (
    <div className={styles.stage}>
      <div className={styles.metaRow}>
        <h3 className={styles.setTitle}>{set.shortTitle}</h3>
        <p className={styles.progress}>
          {index + 1} / {set.cards.length}
        </p>
      </div>

      <div
        ref={scrollerRef}
        className={styles.slideTrack}
        onScroll={onScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${set.shortTitle} slides`}
      >
        {set.cards.map((slide, i) => {
          const near = Math.abs(i - index) <= SLIDE_LOAD_RADIUS;
          return (
            <div
              key={`${set.id}-${slide.imageUrl}-${i}`}
              className={styles.slidePane}
              aria-hidden={i !== index}
            >
              <SoftImage
                className={styles.slideImage}
                src={slide.imageUrl}
                alt={
                  slide.hangul
                    ? `${slide.hangul}${slide.english ? ` — ${slide.english}` : ""}`
                    : set.title
                }
                enabled={enabled && near}
                width={720}
                height={900}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.dots} aria-hidden>
        {set.cards.map((_, i) => (
          <button
            key={`${set.id}-dot-${i}`}
            type="button"
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            onClick={() => scrollToIndex(i)}
            tabIndex={-1}
          />
        ))}
      </div>

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
          onClick={() => scrollToIndex(index - 1)}
          disabled={isFirst}
        >
          Prev
        </button>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navBtnPrimary}`}
          onClick={() =>
            scrollToIndex(isLast ? 0 : index + 1)
          }
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
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined"
    ) {
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
                    Capybara Instagram list carousels — pick a set, then swipe
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
