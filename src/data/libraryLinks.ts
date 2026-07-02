export type LibraryLink = {
  href: string;
  label: string;
  icon: string;
  description: string;
  /** 홈 라이브러리 그리드에서 살짝 더 눈에 띄게 */
  emphasized?: boolean;
};

/** News — first item in Library nav */
export const NEWS_RESOURCE: LibraryLink = {
  href: "/news",
  label: "News",
  icon: "/news.webp",
  description: "Short news articles for Korean reading practice.",
  emphasized: true,
};

export const LIBRARY_LINKS: readonly LibraryLink[] = [
  NEWS_RESOURCE,
  {
    href: "/blog",
    label: "Blog",
    icon: "/blog.webp",
    description: "Long-form posts about learning Korean and culture.",
  },
  {
    href: "/drama",
    label: "Drama",
    icon: "/drama.webp",
    description: "Dialogues and phrases taken from K-dramas.",
  },
  {
    href: "/grammar",
    label: "Grammar",
    icon: "/book-open.webp",
    description: "Grammar explanations and example-based notes.",
  },
  {
    href: "/expressions",
    label: "Expressions",
    icon: "/talk.webp",
    description: "Useful real-life Korean expressions and phrases.",
  },
  {
    href: "/songs",
    label: "Song",
    icon: "/music.webp",
    description: "Lyrics and breakdowns from Korean songs.",
  },
  // {
  //   href: "/exams",
  //   label: "Exams",
  //   icon: "/book-open.webp",
  //   description: "Practice exams for checking your progress.",
  // },
  {
    href: "/quoto",
    label: "Quoto",
    icon: "/talk.webp",
    description: "Short Korean quotes and bite-sized reading.",
  },
  {
    href: "/fundamental",
    label: "Basic",
    icon: "/cubs.webp",
    description: "Fundamental basics to build your Korean foundation.",
  },
] as const;

