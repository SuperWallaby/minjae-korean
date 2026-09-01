"use client";

import * as React from "react";
import Image from "next/image";

import type { BookGallerySlide } from "@/data/bookSamples";
import { cn } from "@/lib/utils";

import styles from "./home-blog.module.css";

type GalleryVariant = "detail" | "modal";

type Props = {
  slides: BookGallerySlide[];
  /** First slide is LCP / above the fold (detail page hero). */
  priorityMain?: boolean;
  className?: string;
  /** Layout preset: reserved A4 slot + height cap for detail vs modal. */
  variant?: GalleryVariant;
  /** Extra classes on the A4 preview slot (after variant base). */
  previewSlotClassName?: string;
  /** Wrapper around the large preview (border, padding). */
  previewFrameClassName?: string;
  /** Responsive `sizes` for the large preview (controls optimizer resolution). */
  mainImageSizes?: string;
  /** next/image quality for the large preview (1–100). */
  mainImageQuality?: number;
};

export function BookProductGallery({
  slides,
  priorityMain,
  className,
  variant = "detail",
  previewSlotClassName,
  previewFrameClassName,
  mainImageSizes = "(max-width: 900px) 92vw, 360px",
  mainImageQuality = 95,
}: Props) {
  const [selected, setSelected] = React.useState(0);
  const current = slides[selected];
  if (!current) return null;

  return (
    <div className={cn(styles.bookGallery, className)}>
      <div
        className={cn(
          styles.bookGalleryFrame,
          variant === "modal" && styles.bookGalleryFrameModal,
          previewFrameClassName,
        )}
      >
        <div
          className={cn(
            styles.bookGallerySlot,
            variant === "modal" && styles.bookGallerySlotModal,
            previewSlotClassName,
          )}
          data-book-preview-slot
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            quality={mainImageQuality}
            priority={Boolean(priorityMain && selected === 0)}
            loading={priorityMain && selected === 0 ? undefined : "lazy"}
            className={styles.bookGalleryImage}
            sizes={mainImageSizes}
          />
        </div>
      </div>

      <div
        className={styles.bookGalleryThumbs}
        role="tablist"
        aria-label="Book preview thumbnails"
      >
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={i === selected}
            aria-label={slide.label}
            onClick={() => setSelected(i)}
            className={cn(
              styles.bookGalleryThumb,
              i === selected && styles.bookGalleryThumbActive,
            )}
          >
            <Image
              src={slide.thumbSrc}
              alt=""
              fill
              quality={88}
              className="object-cover object-top"
              sizes="48px"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
