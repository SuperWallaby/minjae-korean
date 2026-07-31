import type { Metadata } from "next";

/** Shared crawler policy for private, transactional, and utility routes. */
export const NO_INDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};
