export type BookSample = {
  page: string;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
};

export type BookGallerySlide = {
  id: string;
  /** Full-size asset for the main preview. */
  src: string;
  /** Small asset for the strip (regenerated when samples change). */
  thumbSrc: string;
  label: string;
  alt: string;
};

function sampleThumbSrc(imageSrc: string): string {
  return imageSrc.replace(
    "/book-samples/",
    "/book-samples/thumbs/"
  );
}

export const BOOK_SAMPLE_PAGES: BookSample[] = [
  {
    page: "Page 7",
    eyebrow: "Sample word 018",
    title: "하필 and unlucky exactness",
    description:
      "A sample page showing how the book explains emotional friction, not just dictionary definition.",
    imageSrc: "/book-samples/page-007.webp",
  },
  {
    page: "Page 9",
    eyebrow: "Sample word 003",
    title: "괜히 and quiet regret",
    description:
      "Another early sample page focused on emotional meaning rather than literal translation alone.",
    imageSrc: "/book-samples/page-009.webp",
  },
  {
    page: "Page 8",
    eyebrow: "Sample word 002",
    title: "그냥 keeps things light",
    description:
      "This sample shows how the book teaches tone control, softening pressure without overexplaining.",
    imageSrc: "/book-samples/page-008.webp",
  },
  {
    page: "Page 10",
    eyebrow: "Chapter 1 sample",
    title: "괜히 adds regret before you explain",
    description:
      "A chapter-one page showing how a tiny word can quietly add regret, second-guessing, or emotional friction.",
    imageSrc: "/book-samples/page-010.webp",
  },
  {
    page: "Page 11",
    eyebrow: "Chapter 1 sample",
    title: "혹시 softens the ask before it lands",
    description:
      "This page breaks down how Korean opens space for the other person before a request even arrives.",
    imageSrc: "/book-samples/page-011.webp",
  },
  {
    page: "Page 12",
    eyebrow: "Chapter 1 sample",
    title: "일단 keeps the decision open",
    description:
      "A practical example of how speakers move things forward now without pretending the decision is already final.",
    imageSrc: "/book-samples/page-012.webp",
  },
  {
    page: "Page 13",
    eyebrow: "Chapter 1 sample",
    title: "그러니까 pushes the point, not just logic",
    description:
      "This sample shows how a connector can sound explanatory, corrective, or slightly forceful depending on the context.",
    imageSrc: "/book-samples/page-013.webp",
  },
  {
    page: "Page 14",
    eyebrow: "Chapter 1 sample",
    title: "약간 leaves room around your judgment",
    description:
      "A clean example of how Korean scales a judgment so it sounds more precise and less absolute.",
    imageSrc: "/book-samples/page-014.webp",
  },
  {
    page: "Page 15",
    eyebrow: "Chapter 1 sample",
    title: "살짝 makes the line land lighter",
    description:
      "This page highlights how a soft adverb can make a sentence gentler than the dictionary meaning suggests.",
    imageSrc: "/book-samples/page-015.webp",
  },
  {
    page: "Page 115",
    eyebrow: "Final page",
    title: "You learned how Korean feels",
    description:
      "The sample can close on the same message the book ends with: this is about sensibility, not just translation equivalents.",
    imageSrc: "/book-samples/page-115.webp",
  },
];

export const BOOK_GALLERY_SLIDES: BookGallerySlide[] = [
  {
    id: "cover",
    src: "/book-samples/book-cover.png",
    thumbSrc: "/book-samples/thumbs/book-cover.webp",
    label: "Front cover",
    alt: "Korean, Beyond Translation — front cover",
  },
  {
    id: "back",
    src: "/behind-cover.webp",
    thumbSrc: "/book-samples/thumbs/behind-cover.webp",
    label: "Back",
    alt: "Korean, Beyond Translation — back cover",
  },
  ...BOOK_SAMPLE_PAGES.map((s) => ({
    id: s.imageSrc,
    src: s.imageSrc,
    thumbSrc: sampleThumbSrc(s.imageSrc),
    label: s.page,
    alt: `${s.title} — sample preview`,
  })),
];
