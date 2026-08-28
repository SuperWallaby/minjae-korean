import type { MetadataRoute } from "next";

/**
 * kajakorean.com — do not invite crawling/indexing.
 * SEO effort is on eigopin.com / sound.eigopin.com / getpronounce.net.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
