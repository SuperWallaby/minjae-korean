import type { MetadataRoute } from "next";

import { vocabDetailSiteBaseUrl } from "@/lib/vocabDetail/slug";

const baseUrl = vocabDetailSiteBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
