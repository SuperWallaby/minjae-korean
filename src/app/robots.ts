import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/siteUrl";

/**
 * kajakorean.com — index marketing + blog; keep vocab / app surfaces private.
 */
export default function robots(): MetadataRoute.Robots {
  const base = SITE_ORIGIN.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/vocab",
          "/vocab-quiz",
          "/admin",
          "/account",
          "/api/",
          "/login",
          "/bookmarks",
          "/recap",
          "/recaps",
          "/call/",
          "/join/",
          "/payment/",
          "/r/",
          "/q/",
          "/quiz/",
          "/worksheet-review",
          "/booking",
          "/go/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}
