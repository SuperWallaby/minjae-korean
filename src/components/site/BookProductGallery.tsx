"use client";

import * as React from "react";
import Image from "next/image";

import type { BookGallerySlide } from "@/data/bookSamples";
import { cn } from "@/lib/utils";

/** ISO A4 portrait (210mm × 297mm). */
const ASPECT_A4 = "aspect-[210/297]";

const DEFAULT_MAIN_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 94vw, min(58vw, 1120px)";

/** Reserved preview area: stable before images load; caps follow A4 + max height. */
const PREVIEW_SLOT = {
  detail: cn(
    "relative mx-auto w-full overflow-hidden rounded-xl bg-muted/30",
    ASPECT_A4,
    "max-h-[min(84dvh,1120px)] max-w-[min(100%,calc(min(84dvh,1120px)*210/297))]",
    "min-h-[min(72dvh,560px)] sm:min-h-[min(64dvh,720px)]",
    "ring-1 ring-black/7 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:ring-white/10 dark:shadow-[0_2px_20px_rgba(0,0,0,0.25)]",
  ),
  modal: cn(
    "relative mx-auto w-full overflow-hidden rounded-xl bg-muted/30",
    ASPECT_A4,
    "max-h-[min(calc(94dvh-13.5rem),680px)] max-w-[min(100%,calc(min(calc(94dvh-13.5rem),680px)*210/297))]",
    "min-h-[min(40dvh,420px)]",
  ),
} as const;

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
  mainImageSizes = DEFAULT_MAIN_SIZES,
  mainImageQuality = 95,
}: Props) {
  const [selected, setSelected] = React.useState(0);
  const current = slides[selected];
  if (!current) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "flex justify-center rounded-2xl border border-border bg-muted/25 p-3 sm:p-4",
          previewFrameClassName,
        )}
      >
        <div
          className={cn(PREVIEW_SLOT[variant], previewSlotClassName)}
          data-book-preview-slot
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            quality={mainImageQuality}
            priority={Boolean(priorityMain && selected === 0)}
            loading={priorityMain && selected === 0 ? undefined : "lazy"}
            className={cn(
              "object-contain object-center",
              variant === "detail" &&
                "drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
            )}
            sizes={mainImageSizes}
          />
        </div>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
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
              "relative h-24 w-auto shrink-0 cursor-pointer overflow-hidden rounded border-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              ASPECT_A4,
              i === selected
                ? "border-[#f25b43] ring-2 ring-[#f25b43]/25"
                : variant === "detail"
                  ? "border-border/55 opacity-90 shadow-sm ring-1 ring-black/5 hover:opacity-100 dark:ring-white/10"
                  : "border-transparent opacity-80 hover:opacity-100",
            )}
          >
            <Image
              src={slide.thumbSrc}
              alt=""
              fill
              quality={88}
              className="object-cover object-top"
              sizes="144px"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
