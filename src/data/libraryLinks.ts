export type LibraryLink = {
  href: string;
  label: string;
  icon: string;
  description: string;
  emphasized?: boolean;
};

export const LIBRARY_LINKS: readonly LibraryLink[] = [
  {
    href: "/blog",
    label: "Blog",
    icon: "/blog.webp",
    description: "Long-form posts about learning Korean and culture.",
    emphasized: true,
  },
  {
    href: "/book/korean-beyond-translation",
    label: "Book",
    icon: "/book-open.webp",
    description: "Korean, Beyond Translation — nuance beyond dictionary glosses.",
  },
] as const;
