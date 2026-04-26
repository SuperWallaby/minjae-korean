"use client";

import * as React from "react";
import Image from "next/image";

import { BOOK_GALLERY_SLIDES } from "@/data/bookSamples";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

import { BookProductGallery } from "./BookProductGallery";

const coverWidth =
  "h-auto w-[300px] max-w-full sm:w-[350px] lg:w-[420px]";

export function BookHeroClickable() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group max-w-[440px] cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
      >
        <span className="relative mx-auto flex w-fit justify-center">
          <Image
            src="/book-mockup.png"
            alt="Korean, Beyond Translation — click to preview covers and sample pages"
            width={820}
            height={1030}
            priority
            className={cn("relative z-1 object-contain", coverWidth)}
          />
        </span>
        <span className="mt-3 block text-center text-sm font-medium text-white/90 underline-offset-4 group-hover:underline">
          Click for cover &amp; sample pages
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Book preview"
        description="Front & back covers plus PDF sample spreads. Thumbnails load lazily until you scroll them into view."
        panelClassName="max-w-5xl max-h-[min(94dvh,960px)]"
        contentClassName="px-4 pb-5 pt-2 sm:px-6"
      >
        {open ? (
          <BookProductGallery
            slides={BOOK_GALLERY_SLIDES}
            priorityMain
            variant="modal"
            previewFrameClassName="rounded-xl border-0 bg-transparent p-1 sm:p-2"
            mainImageSizes="(max-width: 640px) 100vw, min(94vw, 900px)"
            mainImageQuality={95}
          />
        ) : null}
      </Modal>
    </>
  );
}
