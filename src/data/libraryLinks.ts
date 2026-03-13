export type LibraryLink = {
  href: string;
  label: string;
  icon: string;
  description: string;
};

export const LIBRARY_LINKS: readonly LibraryLink[] = [
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
    href: "/news",
    label: "News",
    icon: "/news.webp",
    description: "Short news articles for Korean reading practice.",
  },
  {
    href: "/blog",
    label: "Blog",
    icon: "/blog.webp",
    description: "Long-form posts about learning Korean and culture.",
  },
  {
    href: "/songs",
    label: "Song",
    icon: "/music.webp",
    description: "Lyrics and breakdowns from Korean songs.",
  },
  {
    href: "/drama",
    label: "Drama",
    icon: "/drama.webp",
    description: "Dialogues and phrases taken from K-dramas.",
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

